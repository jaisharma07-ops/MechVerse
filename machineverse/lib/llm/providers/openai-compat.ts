import OpenAI from "openai";
import type { ChatCompletionMessageParam, ChatCompletionContentPart } from "openai/resources/chat/completions";
import {
  envKeyName,
  GATEWAY_CONFIG,
  OPENAI_COMPAT_BASE_URL,
} from "../config";
import {
  GeminiError,
  type GenerateOptions,
  type GenerateResult,
  type ProviderId,
} from "../types";

/**
 * Universal client for any provider that speaks OpenAI's Chat Completions
 * format. We just swap baseURL + apiKey + model id. Used for Groq,
 * OpenRouter, Cerebras, GitHub Models, and Ollama.
 *
 * Trade-off vs the native Gemini path: no web grounding (sources will be
 * empty). The chat route accepts this as a degradation when Gemini fails.
 */

type OpenAICompatId = Exclude<ProviderId, "gemini">;

function buildMessages(opts: GenerateOptions): ChatCompletionMessageParam[] {
  const out: ChatCompletionMessageParam[] = [];
  if (opts.systemInstruction) {
    out.push({ role: "system", content: opts.systemInstruction });
  }

  for (const m of opts.history ?? []) {
    if (m.role === "user") {
      if (m.attachments?.length) {
        // OpenAI multimodal: image_url parts with data URIs.
        const parts: ChatCompletionContentPart[] = [];
        for (const a of m.attachments) {
          if (a.mimeType.startsWith("image/")) {
            parts.push({
              type: "image_url",
              image_url: { url: `data:${a.mimeType};base64,${a.data}` },
            });
          }
        }
        if (m.content) {
          parts.push({ type: "text", text: m.content });
        }
        out.push({ role: "user", content: parts });
      } else {
        out.push({ role: "user", content: m.content || "" });
      }
    } else {
      out.push({ role: "assistant", content: m.content || "" });
    }
  }
  if (opts.prompt) {
    out.push({ role: "user", content: opts.prompt });
  }
  return out;
}

function apiKeyFor(provider: OpenAICompatId): string | null {
  if (provider === "ollama") return "ollama"; // Ollama doesn't validate keys
  const env = envKeyName(provider);
  const v = process.env[env];
  return v ? v.trim() : null;
}

function clientFor(provider: OpenAICompatId): OpenAI | null {
  const apiKey = apiKeyFor(provider);
  if (!apiKey) return null;
  const baseURL = OPENAI_COMPAT_BASE_URL[provider];
  return new OpenAI({
    apiKey,
    baseURL,
    timeout: GATEWAY_CONFIG.requestTimeoutMs,
    maxRetries: 0, // we handle retries at the gateway level
  });
}

export function isConfigured(provider: OpenAICompatId): boolean {
  return apiKeyFor(provider) !== null;
}

export async function callOpenAICompat(
  provider: OpenAICompatId,
  opts: GenerateOptions,
  model: string,
): Promise<GenerateResult> {
  const client = clientFor(provider);
  if (!client) {
    throw new GeminiError({
      code: "NO_API_KEY",
      provider,
      userMessage: `${provider} API key is not configured.`,
    });
  }

  const messages = buildMessages(opts);
  if (messages.length === 0) {
    throw new GeminiError({
      code: "NO_INPUT",
      provider,
      userMessage: "Empty prompt — nothing to send to the model.",
    });
  }

  // Lower temperature for JSON / structured routes to suppress hallucinations.
  const temperature =
    opts.temperature ?? (opts.responseMimeType === "application/json" ? 0.2 : 0.7);

  try {
    const completion = await client.chat.completions.create(
      {
        model,
        messages,
        temperature,
        response_format:
          opts.responseMimeType === "application/json"
            ? { type: "json_object" }
            : undefined,
      },
      // Threads the gateway-provided AbortSignal into the OpenAI SDK fetch.
      // When the client hangs up, OpenAI/Groq/etc. see the connection close
      // and stop generating — which is exactly the token-saving behavior we
      // promise on /api/chat/stream.
      opts.signal ? { signal: opts.signal } : undefined,
    );

    const text = completion.choices?.[0]?.message?.content ?? "";
    return { text: typeof text === "string" ? text : "", sources: [] };
  } catch (e) {
    throw normalizeError(provider, e);
  }
}

function normalizeError(provider: OpenAICompatId, e: unknown): GeminiError {
  const message = e instanceof Error ? e.message : String(e);

  // AbortError from fetch/OpenAI SDK when the client hung up. Flag it
  // explicitly so the gateway breaks out instead of trying fallbacks
  // (the user just asked us to stop — we should respect that).
  const name = e instanceof Error ? e.name : "";
  if (name === "AbortError" || (e as { code?: string })?.code === "ERR_CANCELED") {
    return new GeminiError({
      code: "ABORTED",
      provider,
      userMessage: "Request aborted.",
    });
  }

  // OpenAI SDK errors carry a status code.
  const status =
    typeof e === "object" && e !== null && "status" in e
      ? (e as { status?: number }).status
      : undefined;

  if (status === 429) {
    return new GeminiError({
      code: "RATE_LIMIT",
      provider,
      userMessage: `${provider} rate limit reached.`,
    });
  }
  if (status === 401 || status === 403) {
    return new GeminiError({
      code: "PERMISSION_DENIED",
      provider,
      userMessage: `${provider} rejected the API key.`,
    });
  }
  if (status === 503 || status === 504) {
    return new GeminiError({
      code: "UNAVAILABLE",
      provider,
      userMessage: `${provider} is temporarily unavailable.`,
    });
  }
  return new GeminiError({
    code: status ? String(status) : "UNKNOWN",
    provider,
    userMessage: `${provider} error: ${message}`,
  });
}
