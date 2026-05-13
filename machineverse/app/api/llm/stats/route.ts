import { NextResponse } from "next/server";
import { cacheSnapshot } from "@/lib/llm/cache";
import { PROVIDER_ORDER } from "@/lib/llm/config";
import { snapshotKeys, totalGeminiKeys } from "@/lib/llm/rotation";
import { statsSnapshot } from "@/lib/llm/stats";
import { isOllamaReachable } from "@/lib/llm/ollama";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Read-only observability endpoint. Returns:
 *   - per-provider request/success/failure counts + avg latency
 *   - cache size, hit rate, ttl
 *   - Gemini key fingerprints + remaining cool-down per key
 *   - which providers are configured + Ollama reachability
 *
 * Intentionally unauthenticated — the keys are never returned in full,
 * only `prefix…suffix` fingerprints. Still, do not expose this route
 * publicly in production without putting it behind auth.
 */
export async function GET() {
  const stats = statsSnapshot();
  const cache = cacheSnapshot();
  const keys = snapshotKeys();
  const ollamaUp = await isOllamaReachable();

  const providers = PROVIDER_ORDER.map((p) => {
    let configured = false;
    if (p.id === "gemini") configured = totalGeminiKeys() > 0;
    else if (p.id === "ollama") configured = ollamaUp;
    else {
      const envName =
        p.id === "groq"
          ? "GROQ_API_KEY"
          : p.id === "openrouter"
            ? "OPENROUTER_API_KEY"
            : p.id === "cerebras"
              ? "CEREBRAS_API_KEY"
              : "GITHUB_TOKEN";
      configured = !!process.env[envName];
    }
    const counts = stats.providers.find((s) => s.provider === p.id) ?? {
      provider: p.id,
      requests: 0,
      successes: 0,
      failures: 0,
      avgLatencyMs: 0,
    };
    return {
      id: p.id,
      label: p.label,
      model: p.model,
      configured,
      requests: counts.requests,
      successes: counts.successes,
      failures: counts.failures,
      avgLatencyMs: counts.avgLatencyMs,
    };
  });

  return NextResponse.json({
    uptimeMs: stats.uptimeMs,
    cache,
    cacheHits: stats.cache.hits,
    cacheMisses: stats.cache.misses,
    cacheHitRate: stats.cache.hitRate,
    geminiKeys: keys,
    providers,
  });
}
