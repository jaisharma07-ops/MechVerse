# MachineVerse

An AI-powered, conversational encyclopedia for every machine and mode of transport ever built. Built on Next.js 16 with a resilient multi-provider LLM gateway, 24/7 web grounding, and a cinematic scroll-driven landing page.

## Getting Started

```bash
cp .env.example .env       # then fill in any one of the provider keys
npm install
npm run dev                # http://localhost:3000
```

You need **at least one** LLM provider key configured — the gateway falls through the rest automatically. See the **LLM Providers** section below for free-key signup URLs.

## Deployment

### Push to GitHub

```bash
git add .
git commit -m "ship: multi-provider gateway + cinematic landing"
git push origin main
```

The `.gitignore` keeps `.env`, `public/videos/_raw/`, `.next/`, and `node_modules/` out of the repo.

### Deploy on Vercel

1. **Import the GitHub repo** at <https://vercel.com/new>.
2. **Framework preset**: Next.js (auto-detected).
3. **Environment Variables**: copy every non-empty line from your local `.env` into Vercel's project settings → Environment Variables. At minimum:
   - `GEMINI_API_KEY_1` (or any single LLM provider key)
   - `TAVILY_API_KEY` (recommended for best grounding)
4. **Deploy.** Build takes ~90 s. The `vercel.json` in this repo sets:
   - `iad1` (US-East) region
   - `maxDuration: 60` on every LLM route (Pro plan required for >10 s).

If you're on the **Hobby** tier, the 10 s function limit will truncate slow Gemini calls. Either upgrade to Pro, drop `GEMINI_API_KEY_*` entirely so the gateway prefers faster providers (Groq answers in <1 s), or move heavy routes to Edge runtime (requires refactor — Gemini SDK is Node-only).

### Live URL smoke test

```bash
curl -s -X POST https://<your-app>.vercel.app/api/facts \
  -H "content-type: application/json" \
  -d '{"category":"cars"}' | jq .facts | head -5

curl -s https://<your-app>.vercel.app/api/llm/stats | jq
```

## Architecture

```
app/
  page.tsx                 — landing (Velocity theme: pinned video stage, magnetic CTAs, view transitions)
  chat/page.tsx            — chat interface
  api/
    chat,compare,facts,
    surprise,timeline      — LLM-backed routes, all funneled through lib/gemini.ts
    llm/stats              — observability endpoint (per-provider counts, cache, key cool-down)

lib/
  llm/
    gateway.ts             — generate() with task-aware routing + fallback chain + cache + stats
    config.ts              — provider order, OpenAI-compat base URLs, tuning constants
    rotation.ts            — Gemini key round-robin + 60s cool-down on 429
    cache.ts               — in-memory exact-match cache (LRU, 30min TTL)
    stats.ts               — per-provider counters
    search.ts              — Tavily → SerpAPI → Wikipedia+DDG search backends
    ollama.ts              — local-fallback health probe
    providers/
      gemini.ts            — @google/genai, preserves native googleSearch grounding
      openai-compat.ts     — unified client for Groq, OpenRouter, Cerebras, GitHub, Ollama
  gemini.ts                — thin re-export of gateway (back-compat for existing imports)
  prompts.ts               — system prompts, all reinforced with accuracyDirective

components/landing/        — Hero, StickyVideoStage, Speedometer, MagneticButton, Bento, FAQ, Footer
hooks/                     — useLenis (smooth scroll), useViewTransition (zoom-warp into /chat)
instrumentation.ts         — boot-time Ollama health check
scripts/                   — setup_ollama, llm_smoke, test_search, test_fallback
```

## LLM Providers

The gateway routes every LLM call through a fallback chain. **You only need ONE key configured** for the app to work — anything beyond that is redundancy. The chain is task-aware: chat-with-grounding prefers Gemini (native Google Search), JSON routes prefer Groq (fastest + lowest hallucination at temp 0.2), long-context routes prefer Cerebras.

### Fallback order

| # | Provider | Model | Why it's here |
|---|---|---|---|
| 1 | **Gemini** (rotated `GEMINI_API_KEY_1..5`) | `gemini-2.5-flash` | Best free quality + native googleSearch grounding |
| 2 | **Groq** | `llama-3.3-70b-versatile` | Sub-second responses, generous free tier |
| 3 | **OpenRouter** | `deepseek/deepseek-chat-v3.1:free` | Strong reasoning, $0 tier |
| 4 | **Cerebras** | `llama-4-scout-17b-16e-instruct` | Fast hosted inference |
| 5 | **GitHub Models** | `gpt-4o-mini` | Free preview for any GitHub user |
| 6 | **Ollama** (local) | `llama3.2:3b` | Last-resort offline safety net |

### Web search — always on

When a route requests `useWebSearch: true` (chat + all JSON routes by default), the gateway:

1. Fires an external search **in parallel** with the first LLM call (no latency penalty).
2. If Gemini answers and uses its native googleSearch grounding → those sources flow through.
3. If Gemini fails OR JSON-mode blocks googleSearch → external snippets are **injected into the system prompt** so the answering model has fresh evidence regardless of which provider it is.

Search backend selection:

| Backend | Key needed | Free quota | Use when |
|---|---|---|---|
| **Tavily** | `TAVILY_API_KEY` | 1,000 q/mo | Best snippets — sign up at <https://app.tavily.com/> |
| SerpAPI | `SERPAPI_API_KEY` | 100 q/mo | Need Google results |
| Wikipedia + DuckDuckGo | none | unlimited | Default — works without any key |

### Getting free keys

| Provider | Where | Notes |
|---|---|---|
| Gemini | <https://aistudio.google.com/app/apikey> | Create up to 5 keys; the gateway rotates them and cools any key down 60 s after a 429 |
| Groq | <https://console.groq.com/keys> | Free, generous |
| OpenRouter | <https://openrouter.ai/keys> | `:free` tier is rate-limited but unmetered |
| Cerebras | <https://cloud.cerebras.ai/> | Free tier, sign up required |
| GitHub Models | <https://github.com/settings/tokens> | Reuse any PAT with `read:user` scope |
| Tavily | <https://app.tavily.com/> | 1,000 free queries/mo, dev key shape `tvly-dev-...` |
| Ollama | <https://ollama.com/download> | Local install + `bash scripts/setup_ollama.sh` (or `.ps1` on Windows) |

### How it picks a provider

1. **Infer task** from request shape (`useWebSearch` → chat-grounded, `responseMimeType: "application/json"` → json, large history → long-context).
2. **Reorder** `PROVIDER_ORDER` to put the best-suited provider first for that task.
3. **Walk the chain**, retrying each provider up to 2× on transient errors. Bail to the next provider on `NO_API_KEY` / `PERMISSION_DENIED` / `BAD_REQUEST`.
4. **Cache hits** short-circuit the whole walk. Grounded responses bypass the cache to stay fresh.

### Observability

```bash
curl http://localhost:3000/api/llm/stats | jq
```

Returns per-provider request/success/failure counts, average latency, cache hit-rate, configured-provider list, and Gemini key fingerprints with their remaining cool-down. Keys are never returned in full — only `prefix…suffix` fingerprints.

Set `LLM_LOG=off` in `.env` to silence the per-request `[llm] TRY/OK/FAIL` console lines.

### Smoke test

```bash
# 1. start the dev server
npm run dev

# 2. fire 20 concurrent requests
npx tsx scripts/llm_smoke.ts

# 3. force fallback off Gemini (verify Groq → search injection → answer with sources)
env $(grep -v '^#' .env | grep -v '^$' | xargs -d '\n') npx tsx scripts/test_fallback.ts
```

### Adding a new provider

If it speaks OpenAI's Chat Completions API (most do):

1. Add an entry to `PROVIDER_ORDER` in [lib/llm/config.ts](lib/llm/config.ts) (`id`, `label`, `model`, capability flags).
2. Add its base URL to `OPENAI_COMPAT_BASE_URL` in the same file.
3. Add a case to `envKeyName()` so the gateway knows which env var holds its key.
4. Add the new env slot to `.env.example` with a comment pointing at its console.
5. Optionally add the new id to one of the task-order arrays in [lib/llm/gateway.ts](lib/llm/gateway.ts) `taskOrder()` to bias it for specific request types.

If it requires a non-OpenAI shape (like Gemini does for grounding), copy [lib/llm/providers/gemini.ts](lib/llm/providers/gemini.ts) to a new file and wire it into the `callProvider()` switch in [lib/llm/gateway.ts](lib/llm/gateway.ts).

## Caveats on Vercel

- **Module state is per-instance.** The in-memory cache, request stats, and Gemini round-robin cursor live in each serverless instance's process — they reset on cold starts and don't share across regions. For low-traffic free tier this is fine. For high traffic, swap `lib/llm/cache.ts` and `lib/llm/stats.ts` to a Vercel KV / Upstash Redis store.
- **Ollama isn't reachable from Vercel.** The local-fallback path only fires in dev or self-hosted environments. In Vercel, the chain ends at GitHub Models.
- **Function size.** Videos in `public/videos/` add ~46 MB to the repo. For faster cold starts, move them to a CDN (Cloudinary, Vercel Blob, Bunny) and update the `<source>` tags in `components/landing/StickyVideoStage.tsx`.
