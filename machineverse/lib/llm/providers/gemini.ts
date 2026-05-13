import { GoogleGenAI } from "@google/genai";
import { GATEWAY_CONFIG } from "../config";
import { coolDownKey, nextGeminiKey } from "../rotation";
import {
  GeminiError,
  type GenerateOptions,
  type GenerateResult,
  type Source,
} from "../types";

/**
 * Native Gemini call path. Kept on @google/genai (instead of going through
 * OpenAI-compat) for one reason: web grounding. Gemini's googleSearch tool
 * returns groundingMetadata.groundingChunks[].web.uri citations, which is
 * what populates the source list in /api/chat. No OpenAI-compat provider
 * gives us that.
 *
 * The wrapper translates each `nextGeminiKey()` rotation into a fresh
 * GoogleGenAI client, parses upstream errors back into our GeminiError
 * type, and cool-downs a key on 429.
 */

interface ParsedRawError {
  status?: string;
  code?: number;
  message?: string;
  retryDelay?: string;
}

function parseRawError(raw: unknown): ParsedRawError {
  const out: ParsedRawError = {};
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
          details?: Array<{ "@type"?: string; retryDelay?: string }>;
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

function toFriendly(parsed: ParsedRawError): GeminiError {
  const status = parsed.status ?? "";
  const code = parsed.code ?? 0;
  const retrySec = parsed.retryDelay
    ? Math.ceil(parseFloat(parsed.retryDelay))
    : undefined;

  if (status === "RESOURCE_EXHAUSTED" || code === 429) {
    return new GeminiError({
      code: "RATE_LIMIT",
      provider: "gemini",
      retryAfterSeconds: retrySec,
      userMessage: retrySec
        ? `Rate limit reached on Gemini. Try again in ~${retrySec}s.`
        : "Rate limit reached on Gemini. Falling back to next provider.",
    });
  }
  if (status === "PERMISSION_DENIED" || code === 403) {
    return new GeminiError({
      code: "PERMISSION_DENIED",
      provider: "gemini",
      userMessage:
        "Gemini rejected the API key. Check GEMINI_API_KEY_* and that the Generative Language API is enabled.",
    });
  }
  if (status === "INVALID_ARGUMENT" || code === 400) {
    return new GeminiError({
      code: "BAD_REQUEST",
      provider: "gemini",
      userMessage:
        "Gemini rejected the request. Try simplifying your prompt or starting a new chat.",
    });
  }
  if (status === "UNAVAILABLE" || code === 503) {
    return new GeminiError({
      code: "UNAVAILABLE",
      provider: "gemini",
      userMessage: "Gemini is temporarily unavailable.",
    });
  }
  return new GeminiError({
    code: status || "UNKNOWN",
    provider: "gemini",
    userMessage: parsed.message
      ? `Gemini error: ${parsed.message}`
      : "Unknown Gemini error.",
  });
}

function buildContents(opts: GenerateOptions) {
  const contents = [
    ...(opts.history ?? []).map((m) => {
      const parts: Array<
        { text: string } | { inlineData: { mimeType: string; data: string } }
      > = [];
      if (m.attachments?.length) {
        for (const a of m.attachments) {
          parts.push({ inlineData: { mimeType: a.mimeType, data: a.data } });
        }
      }
      parts.push({ text: m.content || "" });
      return {
        role: m.role === "user" ? "user" : "model",
        parts,
      };
    }),
    ...(opts.prompt ? [{ role: "user", parts: [{ text: opts.prompt }] }] : []),
  ];
  return contents;
}

export async function callGemini(
  opts: GenerateOptions,
  model: string,
): Promise<GenerateResult> {
  const key = nextGeminiKey();
  if (!key) {
    throw new GeminiError({
      code: "ALL_KEYS_COOLING",
      provider: "gemini",
      userMessage: "All Gemini keys are cooling down.",
    });
  }

  const ai = new GoogleGenAI({ apiKey: key });
  const contents = buildContents(opts);
  if (contents.length === 0) {
    throw new GeminiError({
      code: "NO_INPUT",
      provider: "gemini",
      userMessage: "Empty prompt — nothing to send to the model.",
    });
  }

  // googleSearch tool can't combine with JSON response mode.
  const tools =
    opts.useWebSearch && !opts.responseMimeType
      ? [{ googleSearch: {} }]
      : undefined;

  const timeoutPromise = new Promise<never>((_, rej) =>
    setTimeout(
      () =>
        rej(
          new GeminiError({
            code: "TIMEOUT",
            provider: "gemini",
            userMessage: "Gemini request timed out.",
          }),
        ),
      GATEWAY_CONFIG.requestTimeoutMs,
    ),
  );

  // Lower temperature for JSON / structured routes to suppress hallucinations.
  const temperature =
    opts.temperature ?? (opts.responseMimeType === "application/json" ? 0.2 : 0.7);

  let response;
  try {
    response = await Promise.race([
      ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: opts.systemInstruction,
          tools,
          responseMimeType: opts.responseMimeType,
          temperature,
        },
      }),
      timeoutPromise,
    ]);
  } catch (e) {
    if (e instanceof GeminiError) throw e;
    const friendly = toFriendly(parseRawError(e));
    if (friendly.code === "RATE_LIMIT") {
      coolDownKey(key);
    }
    throw friendly;
  }

  const text = response.text ?? "";
  const sources: Source[] = [];
  const seen = new Set<string>();

  const chunks =
    response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
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
      // skip invalid URL
    }
  }

  return { text, sources };
}
