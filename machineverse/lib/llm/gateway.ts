import { GATEWAY_CONFIG, PROVIDER_ORDER } from "./config";
import { cacheGet, cacheKey, cacheSet } from "./cache";
import { hasGeminiKeys } from "./rotation";
import { callGemini } from "./providers/gemini";
import { callOpenAICompat, isConfigured } from "./providers/openai-compat";
import { resultsToSources, snippetsToContext, webSearch, type SearchResult } from "./search";
import {
  recordAttempt,
  recordCacheHit,
  recordCacheMiss,
  recordFailure,
  recordSuccess,
} from "./stats";
import {
  GeminiError,
  type GenerateOptions,
  type GenerateResult,
  type ProviderConfig,
  type ProviderId,
} from "./types";

/**
 * Main entry point. Walks PROVIDER_ORDER top-to-bottom, trying each
 * configured provider with up to N retries before falling through.
 *
 * Cache layer wraps the whole thing — only kicks in for non-grounded
 * requests (cache.ts already skips responses with sources).
 *
 * Returns the same {text, sources} shape the rest of the app already
 * expects, so /api/* routes don't need to change their consumer code.
 */

function isProviderConfigured(p: ProviderConfig): boolean {
  if (p.id === "gemini") return hasGeminiKeys();
  if (p.id === "ollama") return true; // local; presence checked at call time
  return isConfigured(p.id);
}

/**
 * Infer the task type from request shape when not provided explicitly.
 * Drives the per-task provider ordering below.
 */
function inferTask(opts: GenerateOptions): NonNullable<GenerateOptions["task"]> {
  if (opts.task && opts.task !== "default") return opts.task;
  if (opts.responseMimeType === "application/json") return "json";
  if (opts.useWebSearch) return "chat-grounded";
  // Rough heuristic: a history with > 8 turns or a system prompt > 2KB is
  // "long-context" territory.
  const histLen = (opts.history ?? []).length;
  const sysLen = (opts.systemInstruction ?? "").length;
  if (histLen > 8 || sysLen > 2000) return "long-context";
  return "default";
}

/**
 * Task-aware provider ordering. Each task biases the head of the chain
 * toward the provider best-suited for that workload. The full chain
 * always remains intact so any provider can still serve as fallback.
 */
function taskOrder(task: NonNullable<GenerateOptions["task"]>): ProviderId[] {
  switch (task) {
    case "chat-grounded":
      // Native Google grounding wins for citation-heavy chat.
      return ["gemini", "groq", "openrouter", "cerebras", "github", "ollama"];
    case "json":
      // Groq is fastest at structured output + lowest hallucination at temp 0.2.
      // Gemini next (also JSON-native), then OpenRouter / Cerebras.
      return ["groq", "gemini", "openrouter", "cerebras", "github", "ollama"];
    case "long-context":
      // Cerebras Llama-4 has the largest context window of our free providers.
      return ["cerebras", "openrouter", "gemini", "groq", "github", "ollama"];
    default:
      return PROVIDER_ORDER.map((p) => p.id);
  }
}

function pickProviders(opts: GenerateOptions): ProviderConfig[] {
  // If a specific model id was passed and it matches a provider's model,
  // pin that one to the head; otherwise honor the task-aware order.
  const pinned = opts.model
    ? PROVIDER_ORDER.find((p) => p.model === opts.model)
    : undefined;

  const order = taskOrder(inferTask(opts));
  const ordered = order
    .map((id) => PROVIDER_ORDER.find((p) => p.id === id))
    .filter((p): p is ProviderConfig => !!p);

  const list = pinned
    ? [pinned, ...ordered.filter((p) => p.id !== pinned.id)]
    : ordered;

  return list.filter(isProviderConfigured);
}

async function callProvider(
  p: ProviderConfig,
  opts: GenerateOptions,
  externalSearch: SearchResult[] | null,
): Promise<GenerateResult> {
  // Gemini gets native googleSearch grounding for plain chat. But googleSearch
  // can't combine with JSON response mode — in those cases Gemini has no
  // retrieval, so we inject the external search context into its system
  // prompt just like we do for fallback providers.
  if (p.id === "gemini") {
    const needsInjection =
      opts.useWebSearch &&
      opts.responseMimeType === "application/json" &&
      externalSearch &&
      externalSearch.length > 0;

    if (needsInjection) {
      const effective: GenerateOptions = {
        ...opts,
        systemInstruction:
          (opts.systemInstruction ?? "") + snippetsToContext(externalSearch),
      };
      const res = await callGemini(effective, p.model);
      if (res.sources.length === 0) {
        return { ...res, sources: resultsToSources(externalSearch) };
      }
      return res;
    }
    return callGemini(opts, p.model);
  }

  // For non-Gemini providers we have no native grounding. Inject external
  // search context whenever the caller asked for web search.
  let effective = opts;
  let injectedSources: SearchResult[] = [];
  if (opts.useWebSearch && externalSearch && externalSearch.length > 0) {
    effective = {
      ...opts,
      systemInstruction:
        (opts.systemInstruction ?? "") + snippetsToContext(externalSearch),
    };
    injectedSources = externalSearch;
  }

  const res = await callOpenAICompat(p.id, effective, p.model);
  if (injectedSources.length > 0 && res.sources.length === 0) {
    return { ...res, sources: resultsToSources(injectedSources) };
  }
  return res;
}

/**
 * Build a search query from a request. Prefers the explicit prompt; for
 * chat-style requests with a history, uses the last user message.
 */
function deriveSearchQuery(opts: GenerateOptions): string | null {
  if (opts.prompt && opts.prompt.trim().length > 3) {
    return opts.prompt.slice(0, 240);
  }
  const lastUser = [...(opts.history ?? [])]
    .reverse()
    .find((m) => m.role === "user" && m.content?.trim());
  if (lastUser?.content) return lastUser.content.slice(0, 240);
  return null;
}

function logLine(
  status: "TRY" | "OK" | "FAIL" | "CACHE",
  provider: ProviderId | "—",
  detail: string,
) {
  // Structured one-line log; cheap to grep, doesn't need a logger lib.
  if (process.env.LLM_LOG === "off") return;
  console.log(`[llm] ${status} ${provider} ${detail}`);
}

export async function generate(
  opts: GenerateOptions,
): Promise<GenerateResult> {
  // Cache lookup — skip entirely for grounded requests (those need fresh sources).
  const key = !opts.useWebSearch ? cacheKey(opts) : null;
  if (key) {
    const hit = cacheGet(key);
    if (hit) {
      recordCacheHit();
      logLine("CACHE", "—", "hit");
      return hit;
    }
    recordCacheMiss();
  }

  const candidates = pickProviders(opts);
  if (candidates.length === 0) {
    throw new GeminiError({
      code: "NO_PROVIDERS",
      userMessage:
        "No LLM providers are configured. Add at least one of GEMINI_API_KEY_1..5, GROQ_API_KEY, OPENROUTER_API_KEY, CEREBRAS_API_KEY, or GITHUB_TOKEN to .env — or start Ollama locally.",
    });
  }

  // Kick off an external web search in parallel when grounding is requested.
  // The first provider in the chain (Gemini) won't use it — it has native
  // grounding — but every fallback after that will receive the snippets
  // baked into the system prompt. We never block waiting for search on the
  // happy path: if Gemini succeeds first, the search may still be in flight
  // and that's fine, it gets discarded.
  let searchPromise: Promise<SearchResult[]> | null = null;
  if (opts.useWebSearch) {
    const q = deriveSearchQuery(opts);
    if (q) searchPromise = webSearch(q);
  }

  let lastError: GeminiError | null = null;
  let searchResults: SearchResult[] | null = null;

  for (const provider of candidates) {
    // For fallback providers, await the search once before the first attempt
    // so we have context to inject.
    if (provider.id !== "gemini" && searchPromise && searchResults === null) {
      try {
        searchResults = await searchPromise;
      } catch {
        searchResults = [];
      }
    }

    for (let attempt = 0; attempt <= GATEWAY_CONFIG.perProviderRetries; attempt++) {
      const started = Date.now();
      recordAttempt(provider.id);
      logLine(
        "TRY",
        provider.id,
        `${provider.model} attempt ${attempt + 1}/${GATEWAY_CONFIG.perProviderRetries + 1}`,
      );

      try {
        const result = await callProvider(provider, opts, searchResults);
        const latency = Date.now() - started;
        recordSuccess(provider.id, latency);
        logLine("OK", provider.id, `${latency}ms`);
        if (key) cacheSet(key, result);
        return result;
      } catch (e) {
        recordFailure(provider.id);
        const err =
          e instanceof GeminiError
            ? e
            : new GeminiError({
                code: "UNKNOWN",
                provider: provider.id,
                userMessage:
                  e instanceof Error ? e.message : "Unknown provider error.",
              });
        lastError = err;
        const latency = Date.now() - started;
        logLine("FAIL", provider.id, `${err.code} ${latency}ms`);

        // Client hung up — don't try fallbacks, that defeats the purpose
        // of aborting. Re-throw immediately so the route handler exits.
        if (err.code === "ABORTED") {
          throw err;
        }

        // Non-retryable on this provider: skip remaining attempts, move to next.
        if (
          err.code === "NO_API_KEY" ||
          err.code === "PERMISSION_DENIED" ||
          err.code === "BAD_REQUEST" ||
          err.code === "ALL_KEYS_COOLING" ||
          err.code === "NO_INPUT"
        ) {
          break;
        }
      }
    }
  }

  // Surface the last error. Caller can still pattern-match on .code.
  throw (
    lastError ??
    new GeminiError({
      code: "ALL_PROVIDERS_FAILED",
      userMessage:
        "All LLM providers failed. Check your API keys, network, and Ollama (if local fallback expected).",
    })
  );
}

/**
 * JSON parser kept here for back-compat with existing imports of
 * safeJsonParse from lib/gemini.ts. Same forgiving behavior — handles
 * fenced ```json blocks and stray prose around the JSON object.
 */
export function safeJsonParse<T>(raw: string): T | null {
  if (!raw) return null;
  let text = raw.trim();

  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  }

  const start = text.indexOf("{");
  const startArr = text.indexOf("[");
  if (start === -1 && startArr === -1) return null;
  const fromIdx =
    start === -1 ? startArr : startArr === -1 ? start : Math.min(start, startArr);
  let candidate = text.slice(fromIdx);
  const lastBrace = Math.max(
    candidate.lastIndexOf("}"),
    candidate.lastIndexOf("]"),
  );
  if (lastBrace !== -1) candidate = candidate.slice(0, lastBrace + 1);

  try {
    return JSON.parse(candidate) as T;
  } catch {
    return null;
  }
}

export { GeminiError } from "./types";
export type { GenerateOptions, GenerateResult } from "./types";

/** Legacy default model export kept for back-compat (rarely imported directly). */
export const DEFAULT_MODEL = "gemini-2.5-flash";
export const FALLBACK_MODEL = "gemini-2.5-flash-lite";
