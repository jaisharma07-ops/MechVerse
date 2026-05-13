/**
 * Direct test of the web search layer. Bypasses the gateway so we can
 * verify each backend independently.
 *
 * Run: npx tsx scripts/test_search.ts
 */

// Mute the LLM gateway logger for this script
process.env.LLM_LOG = "off";

import { webSearch } from "../lib/llm/search";

async function main() {
  const queries = [
    "Bugatti Tourbillon top speed",
    "Falcon 9 first stage landing record",
    "Concorde supersonic flight Mach speed",
  ];

  for (const q of queries) {
    console.log(`\n── ${q} ──`);
    const t0 = Date.now();
    const results = await webSearch(q, 4);
    const dt = Date.now() - t0;
    console.log(`  ${results.length} hits in ${dt}ms`);
    for (const r of results) {
      console.log(`  • ${r.title}`);
      console.log(`    ${r.url}`);
      if (r.snippet) console.log(`    ${r.snippet.slice(0, 140)}`);
    }
  }
}

main().catch((e) => {
  console.error("[test_search] fatal:", e);
  process.exit(1);
});
