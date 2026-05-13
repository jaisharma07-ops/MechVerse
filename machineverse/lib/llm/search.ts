import * as cheerio from "cheerio";
import type { Source } from "@/lib/types";

/**
 * Provider-agnostic web search. Used to ground LLM answers when the active
 * provider doesn't have its own search tool (i.e. everything except Gemini).
 *
 * Backend selection:
 *   1. TAVILY_API_KEY set        → Tavily (best quality, LLM-optimized, 1000/mo free)
 *   2. SERPAPI_API_KEY set       → SerpAPI (100/mo free)
 *   3. otherwise                 → Wikipedia API + DuckDuckGo HTML, merged
 *
 * Why Wikipedia first when no key: this app is vehicle-focused, Wikipedia
 * is the canonical citation source for every category we cover, and the
 * MediaWiki API has no rate limit and never blocks bots. DDG is scraped
 * as a supplementary signal — its anti-bot challenges fire often enough
 * that we never rely on it alone.
 *
 * Results are normalized to {title, url, snippet} and capped at `limit` items.
 * Failures degrade silently to an empty list — the LLM is still asked, just
 * without external context. Logged via the same [llm] prefix as the gateway.
 */

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

// A real-browser UA — DDG's HTML endpoint returns the empty "home" skeleton
// for anything that looks like a bot. We're identifying as Chrome because
// the alternative is a degraded UX for users who don't have a Tavily key.
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

const SEARCH_TIMEOUT_MS = 6000;

export async function webSearch(
  query: string,
  limit = 6,
): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const cacheHit = cacheRead(trimmed);
  if (cacheHit) return cacheHit.slice(0, limit);

  let results: SearchResult[] = [];
  try {
    if (process.env.TAVILY_API_KEY) {
      results = await tavilySearch(trimmed, limit);
    } else if (process.env.SERPAPI_API_KEY) {
      results = await serpApiSearch(trimmed, limit);
    } else {
      // No key configured: try Wikipedia first (always works, vehicle-rich),
      // then merge in DDG results if it returns anything. Dedupe by domain.
      const wiki = await wikipediaSearch(trimmed, limit).catch(() => []);
      const remaining = Math.max(0, limit - wiki.length);
      let ddg: SearchResult[] = [];
      if (remaining > 0) {
        ddg = await duckDuckGoHtmlSearch(trimmed, remaining).catch(() => []);
      }
      const seen = new Set(wiki.map((r) => safeHost(r.url)));
      const merged = [...wiki];
      for (const r of ddg) {
        const h = safeHost(r.url);
        if (!seen.has(h)) {
          seen.add(h);
          merged.push(r);
        }
      }
      results = merged;
    }
  } catch (e) {
    if (process.env.LLM_LOG !== "off") {
      console.warn(
        "[llm] search failed:",
        e instanceof Error ? e.message : e,
      );
    }
    return [];
  }

  if (process.env.LLM_LOG !== "off") {
    console.log(`[llm] SEARCH "${trimmed.slice(0, 80)}" → ${results.length} hits`);
  }

  cacheWrite(trimmed, results);
  return results.slice(0, limit);
}

/* ───────────────── backends ───────────────── */

interface TavilyResponse {
  results?: Array<{ title?: string; url?: string; content?: string }>;
}

async function tavilySearch(
  query: string,
  limit: number,
): Promise<SearchResult[]> {
  const res = await fetchWithTimeout("https://api.tavily.com/search", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query,
      search_depth: "basic",
      max_results: limit,
      include_answer: false,
      include_raw_content: false,
    }),
  });
  if (!res.ok) throw new Error(`Tavily ${res.status}`);
  const data = (await res.json()) as TavilyResponse;
  return (data.results ?? [])
    .filter((r): r is { title: string; url: string; content: string } =>
      typeof r.title === "string" && typeof r.url === "string",
    )
    .map((r) => ({ title: r.title, url: r.url, snippet: r.content ?? "" }));
}

interface SerpApiResponse {
  organic_results?: Array<{ title?: string; link?: string; snippet?: string }>;
}

async function serpApiSearch(
  query: string,
  limit: number,
): Promise<SearchResult[]> {
  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("api_key", process.env.SERPAPI_API_KEY ?? "");
  url.searchParams.set("q", query);
  url.searchParams.set("engine", "google");
  url.searchParams.set("num", String(limit));
  const res = await fetchWithTimeout(url.toString());
  if (!res.ok) throw new Error(`SerpAPI ${res.status}`);
  const data = (await res.json()) as SerpApiResponse;
  return (data.organic_results ?? [])
    .filter((r): r is { title: string; link: string; snippet?: string } =>
      typeof r.title === "string" && typeof r.link === "string",
    )
    .map((r) => ({
      title: r.title,
      url: r.link,
      snippet: r.snippet ?? "",
    }));
}

/**
 * Wikipedia search — primary no-key backend. Two-step:
 *   1. action=query&list=search → full-text search returns the top N
 *      matching articles with snippets (HTML-highlighted).
 *   2. action=query&prop=extracts → plaintext intro for the same titles.
 * Both APIs are unauthenticated, unmetered, and never bot-challenge.
 * Perfect for a vehicle-focused project where Wikipedia is already the
 * canonical citation source.
 */
interface WikiSearchResponse {
  query?: {
    search?: Array<{
      title: string;
      pageid: number;
      snippet?: string;
    }>;
  };
}

interface WikiExtractResponse {
  query?: {
    pages?: Record<
      string,
      { pageid?: number; title?: string; extract?: string; fullurl?: string }
    >;
  };
}

async function wikipediaSearch(
  query: string,
  limit: number,
): Promise<SearchResult[]> {
  const searchUrl = new URL("https://en.wikipedia.org/w/api.php");
  searchUrl.searchParams.set("action", "query");
  searchUrl.searchParams.set("list", "search");
  searchUrl.searchParams.set("srsearch", query);
  searchUrl.searchParams.set("srlimit", String(limit));
  searchUrl.searchParams.set("srprop", "snippet");
  searchUrl.searchParams.set("format", "json");

  const res = await fetchWithTimeout(searchUrl.toString(), {
    headers: { "user-agent": UA, accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Wikipedia ${res.status}`);
  const data = (await res.json()) as WikiSearchResponse;
  const hits = data.query?.search ?? [];
  if (hits.length === 0) return [];

  const titles = hits.map((h) => h.title);

  // Batch-fetch plaintext intros for cleaner snippets than the HTML-marked
  // ones the search endpoint returns.
  const extractsUrl = new URL("https://en.wikipedia.org/w/api.php");
  extractsUrl.searchParams.set("action", "query");
  extractsUrl.searchParams.set("prop", "extracts|info");
  extractsUrl.searchParams.set("exintro", "1");
  extractsUrl.searchParams.set("explaintext", "1");
  extractsUrl.searchParams.set("exchars", "500");
  extractsUrl.searchParams.set("inprop", "url");
  extractsUrl.searchParams.set("titles", titles.join("|"));
  extractsUrl.searchParams.set("format", "json");
  extractsUrl.searchParams.set("redirects", "1");

  const exRes = await fetchWithTimeout(extractsUrl.toString(), {
    headers: { "user-agent": UA, accept: "application/json" },
  }).catch(() => null);

  const extracts = new Map<
    string,
    { title: string; url: string; snippet: string }
  >();
  if (exRes?.ok) {
    const ej = (await exRes.json()) as WikiExtractResponse;
    const pages = ej.query?.pages ?? {};
    for (const v of Object.values(pages)) {
      if (v.title && v.fullurl) {
        extracts.set(v.title, {
          title: v.title,
          url: v.fullurl,
          snippet: (v.extract ?? "").replace(/\s+/g, " ").trim(),
        });
      }
    }
  }

  const out: SearchResult[] = [];
  for (const h of hits) {
    if (out.length >= limit) break;
    const ex = extracts.get(h.title);
    out.push({
      title: ex?.title ?? h.title,
      url:
        ex?.url ??
        `https://en.wikipedia.org/wiki/${encodeURIComponent(
          h.title.replace(/ /g, "_"),
        )}`,
      // Prefer plaintext extract; fall back to the HTML-marked search snippet
      // stripped of its <span class="searchmatch"> wrappers.
      snippet:
        ex?.snippet ||
        (h.snippet ?? "").replace(/<[^>]+>/g, "").replace(/&[a-z]+;/gi, " ").trim(),
    });
  }
  return out;
}

function safeHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * Last-resort: scrape DuckDuckGo's HTML results. Often anti-bot-challenges
 * with a CAPTCHA page; we handle that as "0 hits" and move on.
 */
async function duckDuckGoHtmlSearch(
  query: string,
  limit: number,
): Promise<SearchResult[]> {
  // DDG's HTML endpoint only returns real results for POST; GET routes
  // to the bare home page. URL-encode the query in form-data shape.
  const body = new URLSearchParams({ q: query }).toString();
  const res = await fetchWithTimeout("https://html.duckduckgo.com/html/", {
    method: "POST",
    headers: {
      "user-agent": UA,
      "content-type": "application/x-www-form-urlencoded",
      accept: "text/html,application/xhtml+xml",
    },
    body,
  });
  if (!res.ok) throw new Error(`DDG ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const out: SearchResult[] = [];
  $(".result").each((_, el) => {
    if (out.length >= limit) return false;
    const a = $(el).find("a.result__a").first();
    const title = a.text().trim();
    let href = a.attr("href") ?? "";
    // DDG wraps urls like /l/?uddg=<url-encoded>
    if (href.startsWith("/l/?") || href.startsWith("//duckduckgo.com/l/?")) {
      try {
        const u = new URL(href, "https://duckduckgo.com");
        const real = u.searchParams.get("uddg");
        if (real) href = decodeURIComponent(real);
      } catch {
        // keep original
      }
    }
    const snippet = $(el).find(".result__snippet").text().trim();
    if (title && href.startsWith("http")) {
      out.push({ title, url: href, snippet });
    }
    return undefined;
  });

  return out;
}

/* ───────────────── helpers ───────────────── */

async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), SEARCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

/** Convert search results to a Source[] for the API response. */
export function resultsToSources(results: SearchResult[]): Source[] {
  const seen = new Set<string>();
  const out: Source[] = [];
  for (const r of results) {
    try {
      const u = new URL(r.url);
      const key = u.hostname;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        url: r.url,
        domain: u.hostname.replace(/^www\./, ""),
        title: r.title,
      });
    } catch {
      // skip invalid URLs
    }
  }
  return out;
}

/** Format the search snippets as a system-prompt addendum. */
export function snippetsToContext(results: SearchResult[]): string {
  if (results.length === 0) return "";
  const lines = results
    .slice(0, 6)
    .map(
      (r, i) =>
        `[${i + 1}] ${r.title}\n${r.url}\n${(r.snippet || "")
          .replace(/\s+/g, " ")
          .slice(0, 400)}`,
    )
    .join("\n\n");
  return `\n\n──────────── LIVE WEB CONTEXT (just fetched, ${new Date().toISOString()}) ────────────\nUse these as primary evidence. Prefer information from these snippets over your training data. Cite them by domain when relevant.\n\n${lines}\n────────────────────────────────────────────────────────────────────────`;
}

/* ─── tiny in-memory cache for repeated identical queries within a window ─── */

interface CacheEntry {
  query: string;
  results: SearchResult[];
  expiresAt: number;
}
const cache = new Map<string, CacheEntry>();
const TTL_MS = 5 * 60_000; // 5 min — long enough to dedupe a burst, short enough to stay fresh.

function cacheRead(query: string): SearchResult[] | null {
  const e = cache.get(query);
  if (!e) return null;
  if (e.expiresAt <= Date.now()) {
    cache.delete(query);
    return null;
  }
  return e.results;
}

function cacheWrite(query: string, results: SearchResult[]): void {
  if (cache.size > 128) {
    const k = cache.keys().next().value;
    if (k) cache.delete(k);
  }
  cache.set(query, { query, results, expiresAt: Date.now() + TTL_MS });
}
