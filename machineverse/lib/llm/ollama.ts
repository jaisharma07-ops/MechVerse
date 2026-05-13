import { OPENAI_COMPAT_BASE_URL } from "./config";

/**
 * Best-effort Ollama health probe. Returns false (and never throws) if the
 * daemon is unreachable. Used at server startup to print a one-line warning.
 */
export async function isOllamaReachable(): Promise<boolean> {
  try {
    // Use the OpenAI-compat endpoint base, but ping /api/tags on the native
    // port — that's the canonical health endpoint and doesn't require a model.
    const base = OPENAI_COMPAT_BASE_URL.ollama.replace(/\/v1\/?$/, "");
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 1500);
    const res = await fetch(`${base}/api/tags`, { signal: ctrl.signal });
    clearTimeout(t);
    return res.ok;
  } catch {
    return false;
  }
}

let warned = false;

/** Logs a one-line warning if Ollama is unreachable. Idempotent per process. */
export async function ollamaStartupCheck(): Promise<void> {
  if (warned) return;
  warned = true;
  const ok = await isOllamaReachable();
  if (!ok) {
    console.warn(
      "[llm] Ollama not reachable on " +
        OPENAI_COMPAT_BASE_URL.ollama +
        " — local fallback disabled. Run `ollama serve` and `ollama pull llama3.2:3b` to enable it.",
    );
  }
}
