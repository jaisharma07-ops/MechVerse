/**
 * Force-fallback test: spoof a bad Gemini key, then call the gateway and
 * confirm a fallback provider (Groq/OpenRouter/Cerebras) answers using
 * the web-search context injected by the gateway.
 *
 * Run: npx tsx scripts/test_fallback.ts
 */

process.env.LLM_LOG = process.env.LLM_LOG ?? "on";

// Wipe Gemini keys so the chain skips to Groq/OpenRouter/Cerebras.
delete process.env.GEMINI_API_KEY_1;
delete process.env.GEMINI_API_KEY_2;
delete process.env.GEMINI_API_KEY_3;
delete process.env.GEMINI_API_KEY_4;
delete process.env.GEMINI_API_KEY_5;
delete process.env.GEMINI_API_KEY;
delete process.env.NEXT_PUBLIC_GEMINI_API_KEY;

import { readFileSync } from "node:fs";
// Lazy-load: read .env manually for the non-Gemini keys we want to keep.
const envFile = readFileSync(".env", "utf8");
for (const line of envFile.split(/\r?\n/)) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
  if (!m) continue;
  const key = m[1];
  if (key.startsWith("GEMINI_")) continue;
  if (!process.env[key]) process.env[key] = m[2].trim();
}

async function main() {
  console.log("[test_fallback] Gemini disabled — gateway should fall through to Groq.\n");

  // Dynamic import AFTER the env manipulation so rotation.ts sees no Gemini keys.
  const { generate } = await import("../lib/llm/gateway");

  const res = await generate({
    prompt:
      "In one paragraph: what is the Bugatti Tourbillon's top speed and when was it unveiled? Cite your source domain.",
    useWebSearch: true,
  });

  console.log("ANSWER:\n" + res.text);
  console.log("\nSOURCES:");
  for (const s of res.sources) {
    console.log(`  • ${s.title ?? "(no title)"}\n    ${s.url}`);
  }
}

main().catch((e) => {
  console.error("[test_fallback] fatal:", e);
  process.exit(1);
});
