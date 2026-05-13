import type { ProviderId } from "./types";

interface ProviderCounters {
  requests: number;
  successes: number;
  failures: number;
  totalLatencyMs: number;
}

const counters = new Map<ProviderId, ProviderCounters>();
let cacheHits = 0;
let cacheMisses = 0;
const startedAt = Date.now();

function bucket(p: ProviderId): ProviderCounters {
  let b = counters.get(p);
  if (!b) {
    b = { requests: 0, successes: 0, failures: 0, totalLatencyMs: 0 };
    counters.set(p, b);
  }
  return b;
}

export function recordAttempt(p: ProviderId): void {
  bucket(p).requests += 1;
}

export function recordSuccess(p: ProviderId, latencyMs: number): void {
  const b = bucket(p);
  b.successes += 1;
  b.totalLatencyMs += latencyMs;
}

export function recordFailure(p: ProviderId): void {
  bucket(p).failures += 1;
}

export function recordCacheHit(): void {
  cacheHits += 1;
}
export function recordCacheMiss(): void {
  cacheMisses += 1;
}

export interface StatsSnapshot {
  startedAt: number;
  uptimeMs: number;
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
  };
  providers: Array<{
    provider: ProviderId;
    requests: number;
    successes: number;
    failures: number;
    avgLatencyMs: number;
  }>;
}

export function statsSnapshot(): StatsSnapshot {
  const total = cacheHits + cacheMisses;
  const providers = Array.from(counters.entries()).map(([provider, b]) => ({
    provider,
    requests: b.requests,
    successes: b.successes,
    failures: b.failures,
    avgLatencyMs: b.successes > 0 ? Math.round(b.totalLatencyMs / b.successes) : 0,
  }));
  return {
    startedAt,
    uptimeMs: Date.now() - startedAt,
    cache: {
      hits: cacheHits,
      misses: cacheMisses,
      hitRate: total > 0 ? cacheHits / total : 0,
    },
    providers,
  };
}

export function statsReset(): void {
  counters.clear();
  cacheHits = 0;
  cacheMisses = 0;
}
