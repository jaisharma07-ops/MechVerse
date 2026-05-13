/**
 * Smoke test: fire 20 concurrent /api/facts requests across mixed categories
 * and assert every one succeeds. Prints which provider served each, plus a
 * final summary snapshot from /api/llm/stats.
 *
 * Run with: npx tsx scripts/llm_smoke.ts
 * Requires the dev server on http://localhost:3000 (or set BASE_URL).
 */

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const CATEGORIES = [
  "cars",
  "bikes",
  "aircraft",
  "ships",
  "trains",
  "road",
  "experimental",
  "all",
] as const;

interface FactsResponse {
  facts?: string[];
  error?: string;
}

interface StatsResponse {
  cacheHits: number;
  cacheMisses: number;
  providers: Array<{
    id: string;
    label: string;
    configured: boolean;
    requests: number;
    successes: number;
    failures: number;
    avgLatencyMs: number;
  }>;
}

async function fireOne(i: number): Promise<{
  i: number;
  ok: boolean;
  category: string;
  status: number;
  errorMsg?: string;
}> {
  const category = CATEGORIES[i % CATEGORIES.length];
  try {
    const res = await fetch(`${BASE_URL}/api/facts`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ category }),
    });
    const body = (await res.json()) as FactsResponse;
    const ok = res.ok && Array.isArray(body.facts) && body.facts.length > 0;
    return {
      i,
      ok,
      category,
      status: res.status,
      errorMsg: ok ? undefined : body.error,
    };
  } catch (e) {
    return {
      i,
      ok: false,
      category,
      status: 0,
      errorMsg: e instanceof Error ? e.message : String(e),
    };
  }
}

async function main() {
  console.log(`[smoke] firing 20 concurrent /api/facts at ${BASE_URL}`);
  const t0 = Date.now();
  const results = await Promise.all(
    Array.from({ length: 20 }, (_, i) => fireOne(i)),
  );
  const wall = Date.now() - t0;

  const passes = results.filter((r) => r.ok);
  const fails = results.filter((r) => !r.ok);

  for (const r of results) {
    const tag = r.ok ? "✓" : "✗";
    console.log(
      `  ${tag} #${String(r.i + 1).padStart(2, "0")} cat=${r.category.padEnd(13)} status=${r.status}${
        r.errorMsg ? "  err=" + r.errorMsg.slice(0, 80) : ""
      }`,
    );
  }

  console.log(`\n[smoke] ${passes.length}/${results.length} passed in ${wall}ms`);

  try {
    const statsRes = await fetch(`${BASE_URL}/api/llm/stats`);
    const stats = (await statsRes.json()) as StatsResponse;
    console.log("\n[smoke] provider breakdown:");
    for (const p of stats.providers) {
      if (p.requests === 0 && !p.configured) continue;
      console.log(
        `  ${p.configured ? "●" : "○"} ${p.id.padEnd(11)} req=${p.requests} ok=${p.successes} fail=${p.failures} avg=${p.avgLatencyMs}ms  (${p.label})`,
      );
    }
    console.log(
      `  cache: ${stats.cacheHits} hits / ${stats.cacheMisses} misses`,
    );
  } catch (e) {
    console.warn("[smoke] stats endpoint unreachable:", e instanceof Error ? e.message : e);
  }

  if (fails.length > 0) {
    console.error(`\n[smoke] FAIL — ${fails.length} request(s) errored`);
    process.exit(1);
  }
  console.log("\n[smoke] PASS — all 20 requests succeeded");
}

main().catch((e) => {
  console.error("[smoke] fatal:", e);
  process.exit(1);
});
