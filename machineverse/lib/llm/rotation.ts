import { GATEWAY_CONFIG } from "./config";

/**
 * Gemini key round-robin with per-key cool-down on 429 / RESOURCE_EXHAUSTED.
 * Reads GEMINI_API_KEY_1..5 plus the legacy GEMINI_API_KEY fallback.
 *
 * Singleton state lives at module scope — fine inside a single Next.js
 * Node process; not shared across serverless instances. Good enough for
 * the project's deployment shape (single dev server / single container).
 */

interface KeyState {
  key: string;
  /** epoch ms; if > Date.now(), this key is in cool-down and should be skipped. */
  cooldownUntil: number;
}

function loadKeys(): KeyState[] {
  const slots: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const v = process.env[`GEMINI_API_KEY_${i}`];
    if (v) slots.push(v.trim());
  }
  const legacy = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (legacy && !slots.includes(legacy.trim())) {
    slots.push(legacy.trim());
  }
  return slots.map((key) => ({ key, cooldownUntil: 0 }));
}

const KEYS: KeyState[] = loadKeys();
let cursor = 0;

export function hasGeminiKeys(): boolean {
  return KEYS.length > 0;
}

export function totalGeminiKeys(): number {
  return KEYS.length;
}

/**
 * Returns the next available Gemini API key (one not in cool-down), or null
 * if every key is currently cooling down.
 */
export function nextGeminiKey(): string | null {
  if (KEYS.length === 0) return null;
  const now = Date.now();
  // At most one full sweep — if all keys are cooling down, give up.
  for (let i = 0; i < KEYS.length; i++) {
    const idx = (cursor + i) % KEYS.length;
    const state = KEYS[idx];
    if (state.cooldownUntil <= now) {
      cursor = (idx + 1) % KEYS.length;
      return state.key;
    }
  }
  return null;
}

/** Mark a specific Gemini key as cooling down (typically on a 429). */
export function coolDownKey(key: string, ms = GATEWAY_CONFIG.geminiKeyCooldownMs): void {
  const state = KEYS.find((s) => s.key === key);
  if (!state) return;
  state.cooldownUntil = Date.now() + ms;
}

export interface KeyStatus {
  /** Truncated for logs/stats — never expose the full key. */
  fingerprint: string;
  cooldownRemainingMs: number;
}

export function snapshotKeys(): KeyStatus[] {
  const now = Date.now();
  return KEYS.map((s) => ({
    fingerprint: s.key.slice(0, 6) + "…" + s.key.slice(-4),
    cooldownRemainingMs: Math.max(0, s.cooldownUntil - now),
  }));
}
