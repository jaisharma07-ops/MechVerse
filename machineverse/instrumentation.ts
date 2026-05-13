/**
 * Next.js boot-time hook. Runs once per server process before any request
 * is served. Used to print a one-line warning if Ollama (the local
 * safety-net provider) isn't reachable.
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ollamaStartupCheck } = await import("@/lib/llm/ollama");
    await ollamaStartupCheck();
  }
}
