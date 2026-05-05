import { GoogleGenAI } from "@google/genai";
import type { Source } from "@/lib/types";

const apiKey =
  process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

export const DEFAULT_MODEL = "gemini-2.5-flash";
export const FALLBACK_MODEL = "gemini-2.5-flash-lite";

export class GeminiError extends Error {
  code: string;
  retryAfterSeconds?: number;
  userMessage: string;
  constructor(opts: {
    code: string;
    userMessage: string;
    retryAfterSeconds?: number;
    cause?: unknown;
  }) {
    super(opts.userMessage);
    this.code = opts.code;
    this.userMessage = opts.userMessage;
    this.retryAfterSeconds = opts.retryAfterSeconds;
  }
}

export function getAi() {
  if (!apiKey) {
    throw new GeminiError({
      code: "NO_API_KEY",
      userMessage:
        "Gemini API key isn't configured. Add GEMINI_API_KEY to .env and restart the server.",
    });
  }
  return new GoogleGenAI({ apiKey });
}

interface ParsedGeminiError {
  status?: string;
  code?: number;
  message?: string;
  retryDelay?: string;
}

function parseRawError(raw: unknown): ParsedGeminiError {
  const out: ParsedGeminiError = {};
  if (!raw) return out;
  const message = raw instanceof Error ? raw.message : String(raw);

  const match = message.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      const obj = JSON.parse(match[0]) as {
        error?: {
          code?: number;
          status?: string;
          message?: string;
          details?: Array<{
            "@type"?: string;
            retryDelay?: string;
          }>;
        };
      };
      const e = obj.error;
      if (e) {
        out.code = e.code;
        out.status = e.status;
        out.message = e.message;
        const retryInfo = e.details?.find((d) =>
          d["@type"]?.includes("RetryInfo"),
        );
        if (retryInfo?.retryDelay) out.retryDelay = retryInfo.retryDelay;
      }
    } catch {
      out.message = message;
    }
  } else {
    out.message = message;
  }
  return out;
}

function toFriendly(parsed: ParsedGeminiError): GeminiError {
  const status = parsed.status ?? "";
  const code = parsed.code ?? 0;
  const retrySec = parsed.retryDelay
    ? Math.ceil(parseFloat(parsed.retryDelay))
    : undefined;

  if (status === "RESOURCE_EXHAUSTED" || code === 429) {
    return new GeminiError({
      code: "RATE_LIMIT",
      retryAfterSeconds: retrySec,
      userMessage: retrySec
        ? `Rate limit reached on the Gemini free tier. Try again in about ${retrySec}s, or upgrade your plan at https://ai.dev/rate-limit.`
        : "Rate limit reached on the Gemini free tier. Wait a moment and try again, or upgrade your plan at https://ai.dev/rate-limit.",
    });
  }
  if (status === "PERMISSION_DENIED" || code === 403) {
    return new GeminiError({
      code: "PERMISSION_DENIED",
      userMessage:
        "Gemini rejected the API key. Double-check GEMINI_API_KEY and that the Generative Language API is enabled.",
    });
  }
  if (status === "INVALID_ARGUMENT" || code === 400) {
    return new GeminiError({
      code: "BAD_REQUEST",
      userMessage:
        "The model rejected the request. Try simplifying your prompt or starting a new chat.",
    });
  }
  if (status === "UNAVAILABLE" || code === 503) {
    return new GeminiError({
      code: "UNAVAILABLE",
      userMessage:
        "Gemini is temporarily unavailable. Please retry in a few seconds.",
    });
  }
  return new GeminiError({
    code: status || "UNKNOWN",
    userMessage: parsed.message
      ? `The model errored out: ${parsed.message}`
      : "Something went wrong calling Gemini. Please try again.",
  });
}

interface InlineAttachment {
  mimeType: string;
  data: string; // base64
}

interface HistoryEntry {
  role: "user" | "bot";
  content: string;
  attachments?: InlineAttachment[];
}

interface GenerateOptions {
  systemInstruction?: string;
  history?: HistoryEntry[];
  prompt?: string;
  useWebSearch?: boolean;
  responseMimeType?: "application/json";
  model?: string;
}

export interface GenerateResult {
  text: string;
  sources: Source[];
}

export async function generate({
  systemInstruction,
  history = [],
  prompt,
  useWebSearch = false,
  responseMimeType,
  model = DEFAULT_MODEL,
}: GenerateOptions): Promise<GenerateResult> {
  const ai = getAi();

  const contents = [
    ...history.map((m) => {
      const parts: Array<
        { text: string } | { inlineData: { mimeType: string; data: string } }
      > = [];
      if (m.attachments?.length) {
        for (const a of m.attachments) {
          parts.push({ inlineData: { mimeType: a.mimeType, data: a.data } });
        }
      }
      // Always include some text part so the API has something to anchor on
      parts.push({ text: m.content || "" });
      return {
        role: m.role === "user" ? "user" : "model",
        parts,
      };
    }),
    ...(prompt ? [{ role: "user", parts: [{ text: prompt }] }] : []),
  ];

  if (contents.length === 0) {
    throw new GeminiError({
      code: "NO_INPUT",
      userMessage: "Empty prompt — nothing to send to the model.",
    });
  }

  // googleSearch tool can't be combined with JSON response mime
  const tools = useWebSearch && !responseMimeType ? [{ googleSearch: {} }] : undefined;

  const tryModel = async (m: string) =>
    ai.models.generateContent({
      model: m,
      contents,
      config: {
        systemInstruction,
        tools,
        responseMimeType,
        temperature: 0.7,
      },
    });

  let response;
  try {
    response = await tryModel(model);
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[gemini] raw upstream error:", e instanceof Error ? e.message : e);
    }
    const parsed = parseRawError(e);
    const friendly = toFriendly(parsed);

    // Only try the lite fallback for text-only rate-limit cases
    const hasInlineData = contents.some((c) =>
      c.parts.some(
        (p) => "inlineData" in p && p.inlineData?.data,
      ),
    );
    const canTryFallback =
      friendly.code === "RATE_LIMIT" &&
      model !== FALLBACK_MODEL &&
      !hasInlineData;

    if (canTryFallback) {
      try {
        response = await tryModel(FALLBACK_MODEL);
      } catch (e2) {
        if (process.env.NODE_ENV !== "production") {
          console.error(
            "[gemini] fallback also failed:",
            e2 instanceof Error ? e2.message : e2,
          );
        }
        // Surface the original error rather than the fallback's
        throw friendly;
      }
    } else {
      throw friendly;
    }
  }

  const text = response.text ?? "";
  const sources: Source[] = [];
  const seen = new Set<string>();

  const grounding = response.candidates?.[0]?.groundingMetadata;
  const chunks = grounding?.groundingChunks ?? [];

  for (const chunk of chunks) {
    const uri = chunk.web?.uri;
    const title = chunk.web?.title;
    if (!uri) continue;
    try {
      const u = new URL(uri);
      const key = u.hostname;
      if (seen.has(key)) continue;
      seen.add(key);
      sources.push({
        url: uri,
        domain: u.hostname.replace(/^www\./, ""),
        title,
      });
    } catch {
      // skip invalid URLs
    }
  }

  return { text, sources };
}

export function safeJsonParse<T>(raw: string): T | null {
  if (!raw) return null;
  let text = raw.trim();

  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  }

  const start = text.indexOf("{");
  const startArr = text.indexOf("[");
  let candidate = text;
  if (start === -1 && startArr === -1) return null;
  const fromIdx =
    start === -1 ? startArr : startArr === -1 ? start : Math.min(start, startArr);
  candidate = text.slice(fromIdx);

  const lastBrace = Math.max(candidate.lastIndexOf("}"), candidate.lastIndexOf("]"));
  if (lastBrace !== -1) candidate = candidate.slice(0, lastBrace + 1);

  try {
    return JSON.parse(candidate) as T;
  } catch {
    return null;
  }
}
