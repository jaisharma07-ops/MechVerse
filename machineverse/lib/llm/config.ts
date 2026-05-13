import type { ProviderConfig, ProviderId } from "./types";

/**
 * Multi-provider gateway config — Node-native equivalent of the LiteLLM yaml
 * sketched in the rollout plan. Ordered list = fallback chain. The gateway
 * walks this list top-to-bottom on failure; first success wins.
 *
 * Free-tier providers only. Models picked are the strongest free models each
 * provider currently exposes (Nov 2026 snapshot — update as the landscape
 * shifts). All providers except Gemini and Ollama expose OpenAI-compatible
 * endpoints; we call them via the `openai` SDK pointed at their base URL.
 */
export const PROVIDER_ORDER: ProviderConfig[] = [
  {
    id: "gemini",
    label: "Gemini 2.5 Flash",
    model: "gemini-2.5-flash",
    supportsGrounding: true,
    supportsJsonMode: true,
  },
  {
    id: "groq",
    label: "Groq Llama 3.3 70B",
    model: "llama-3.3-70b-versatile",
    supportsGrounding: false,
    supportsJsonMode: true,
  },
  {
    id: "openrouter",
    label: "OpenRouter DeepSeek Chat v3.1 (free)",
    model: "deepseek/deepseek-chat-v3.1:free",
    supportsGrounding: false,
    supportsJsonMode: true,
  },
  {
    id: "cerebras",
    label: "Cerebras Llama 4 Scout",
    model: "llama-4-scout-17b-16e-instruct",
    supportsGrounding: false,
    supportsJsonMode: true,
  },
  {
    id: "github",
    label: "GitHub Models GPT-4o-mini",
    model: "gpt-4o-mini",
    supportsGrounding: false,
    supportsJsonMode: true,
  },
  {
    id: "ollama",
    label: "Ollama llama3.2:3b (local)",
    model: "llama3.2:3b",
    supportsGrounding: false,
    supportsJsonMode: true,
  },
];

/** OpenAI-compatible base URLs for each non-Gemini provider. */
export const OPENAI_COMPAT_BASE_URL: Record<
  Exclude<ProviderId, "gemini">,
  string
> = {
  groq: "https://api.groq.com/openai/v1",
  openrouter: "https://openrouter.ai/api/v1",
  cerebras: "https://api.cerebras.ai/v1",
  github: "https://models.inference.ai.azure.com",
  ollama: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1",
};

/** Returns the API key env var for a given provider (excluding Gemini, which is rotated). */
export function envKeyName(
  p: Exclude<ProviderId, "gemini" | "ollama">,
): string {
  switch (p) {
    case "groq":
      return "GROQ_API_KEY";
    case "openrouter":
      return "OPENROUTER_API_KEY";
    case "cerebras":
      return "CEREBRAS_API_KEY";
    case "github":
      return "GITHUB_TOKEN";
  }
}

export const GATEWAY_CONFIG = {
  /** Per-request timeout in milliseconds. */
  requestTimeoutMs: 30_000,
  /** Retries against the same provider before falling through. */
  perProviderRetries: 2,
  /** How long to skip a Gemini key after a 429 / quota error. */
  geminiKeyCooldownMs: 60_000,
  /** Cache TTL — null means cached forever within the process lifetime. */
  cacheTtlMs: 30 * 60_000, // 30 min
  /** Max cache entries before LRU eviction. */
  cacheMaxEntries: 256,
} as const;
