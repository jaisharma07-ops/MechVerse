import { callGeminiStream } from "./providers/gemini";
import { hasGeminiKeys } from "./rotation";
import { generate } from "./gateway";
import { recordAttempt, recordFailure, recordSuccess } from "./stats";
import {
  GeminiError,
  type GenerateOptions,
  type GenerateResult,
  type Source,
} from "./types";

/**
 * Streaming variant of generate().
 *
 * Path 1 (happy): Gemini configured → use `generateContentStream` so the
 *                 client sees tokens arrive as they're produced AND can
 *                 actually stop generation by hanging up.
 * Path 2 (fallback): No Gemini, or Gemini fails before yielding anything →
 *                    fall back to the non-streaming gateway and emit the
 *                    whole answer as one chunk. Abort still works on this
 *                    path because the OpenAI-compat client honors signal.
 *
 * Yields:
 *   { kind: "delta", text }     — append text to the assistant message
 *   { kind: "sources", sources } — terminal grounding metadata (once)
 *
 * Throws GeminiError on failure. Callers should also handle `code === "ABORTED"`
 * by closing the response without surfacing an error to the user.
 */
export type StreamEvent =
  | { kind: "delta"; text: string }
  | { kind: "sources"; sources: Source[] };

const STREAM_MODEL = "gemini-2.5-flash";

export async function* generateStream(
  opts: GenerateOptions,
): AsyncGenerator<StreamEvent, void, void> {
  // Try Gemini streaming first when available.
  if (hasGeminiKeys()) {
    let yieldedAnything = false;
    const started = Date.now();
    recordAttempt("gemini");
    try {
      for await (const ev of callGeminiStream(opts, STREAM_MODEL)) {
        if (ev.kind === "delta") {
          if (ev.text) {
            yieldedAnything = true;
            yield { kind: "delta", text: ev.text };
          }
        } else {
          if (ev.sources.length) yield { kind: "sources", sources: ev.sources };
        }
      }
      recordSuccess("gemini", Date.now() - started);
      return;
    } catch (e) {
      recordFailure("gemini");
      // If the client aborted, never fall through — that would burn tokens
      // on a provider call the user has already told us to stop.
      if (e instanceof GeminiError && e.code === "ABORTED") throw e;

      // If the stream gave us partial output and then failed, surface the
      // failure as-is rather than silently restarting on another provider
      // (the assistant message would get clobbered mid-thought).
      if (yieldedAnything) throw e;

      // Pre-stream failure (rate limit, bad key, etc.) — fall through to
      // the non-streaming gateway below, which has its own retries.
    }
  }

  // Non-streaming fallback. Reuses the full provider cascade so any
  // configured provider can serve the request.
  let result: GenerateResult;
  try {
    result = await generate(opts);
  } catch (e) {
    throw e;
  }
  if (result.text) yield { kind: "delta", text: result.text };
  if (result.sources.length) yield { kind: "sources", sources: result.sources };
}
