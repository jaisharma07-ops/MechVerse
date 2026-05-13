import type { Source } from "@/lib/types";

export interface InlineAttachment {
  mimeType: string;
  data: string; // base64, no data: prefix
}

export interface HistoryEntry {
  role: "user" | "bot";
  content: string;
  attachments?: InlineAttachment[];
}

export interface GenerateOptions {
  systemInstruction?: string;
  history?: HistoryEntry[];
  prompt?: string;
  useWebSearch?: boolean;
  responseMimeType?: "application/json";
  model?: string;
  /** Sampling temperature. Defaults to 0.7 for chat, 0.2 for JSON routes (less hallucination). */
  temperature?: number;
  /**
   * Task hint — the gateway uses this to pick the best-suited provider first.
   * "chat-grounded": needs web grounding → Gemini's googleSearch.
   * "json": one-shot structured → Groq is fastest + cheapest at temp 0.2.
   * "long-context": large prompt/history → Cerebras / OpenRouter handle better.
   * Defaults to inferring from the request shape if unset.
   */
  task?: "chat-grounded" | "json" | "long-context" | "default";
}

export interface GenerateResult {
  text: string;
  sources: Source[];
}

/** Per-provider result + audit metadata that the gateway adds before returning. */
export interface InternalCallResult extends GenerateResult {
  provider: ProviderId;
  /** Did we hit the in-memory cache? */
  cached: boolean;
}

export type ProviderId =
  | "gemini"
  | "groq"
  | "openrouter"
  | "cerebras"
  | "github"
  | "ollama";

export interface ProviderConfig {
  id: ProviderId;
  /** Human-readable name for logs/stats. */
  label: string;
  /** Default model id used when calling this provider. */
  model: string;
  /** True if this provider supports the Gemini-only googleSearch grounding tool. */
  supportsGrounding: boolean;
  /** True if this provider can return JSON via response_format / responseMimeType. */
  supportsJsonMode: boolean;
}

/**
 * Custom error type kept compatible with the previous `GeminiError` so API
 * routes don't need to change their `instanceof` checks.
 */
export class GeminiError extends Error {
  code: string;
  retryAfterSeconds?: number;
  userMessage: string;
  /** Which provider raised this error (undefined for gateway-level errors like NO_API_KEY). */
  provider?: ProviderId;

  constructor(opts: {
    code: string;
    userMessage: string;
    retryAfterSeconds?: number;
    provider?: ProviderId;
    cause?: unknown;
  }) {
    super(opts.userMessage);
    this.name = "GeminiError";
    this.code = opts.code;
    this.userMessage = opts.userMessage;
    this.retryAfterSeconds = opts.retryAfterSeconds;
    this.provider = opts.provider;
  }
}

/** Re-export for legacy import paths. */
export type { Source } from "@/lib/types";
