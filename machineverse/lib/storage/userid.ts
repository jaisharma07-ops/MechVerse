import { createHash } from "node:crypto";

/**
 * Convert a verified email into a stable, opaque storage id.
 *
 * We never store raw emails in Redis keys or filesystem paths — a SHA-256
 * hex digest is enough for lookup and avoids leaking PII into ops dashboards.
 * Truncated to 24 chars; collision space (96 bits) is fine for this scale.
 */
export function userIdFromEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  return createHash("sha256").update(normalized).digest("hex").slice(0, 24);
}
