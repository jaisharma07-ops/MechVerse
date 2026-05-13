/**
 * Legacy import path. Kept as a thin re-export of the new multi-provider
 * gateway in lib/llm/gateway.ts so existing API routes (and any other
 * imports of `generate`, `GeminiError`, `safeJsonParse`) keep working
 * without touching their source.
 *
 * Going forward, new code should import from "@/lib/llm/gateway" directly.
 */

export {
  generate,
  safeJsonParse,
  GeminiError,
  DEFAULT_MODEL,
  FALLBACK_MODEL,
  type GenerateOptions,
  type GenerateResult,
} from "@/lib/llm/gateway";
