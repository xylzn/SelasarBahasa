import { redis } from './redis';

/**
 * In-process in-memory fallback store used ONLY when Redis / Upstash
 * connection fails. This ensures the rate limiter does NOT fully fail-open
 * during an infrastructure outage, so endpoints like register / login /
 * forgot-password / contact remain protected against flood & spam.
 *
 * Limitations (documented intentionally, acceptable tradeoff vs fail-open):
 *   - Per-process only (Next.js serverless instances have separate state)
 *   - Eviction is lazy (entries are removed on the NEXT call that lands
 *     after their expiry)
 *   - NOT a replacement for a proper shared rate-limit store
 */
const inMemoryStore = new Map<string, { count: number; expiresAt: number }>();

/** Lazy prune — remove expired entries to keep the map bounded. */
function pruneMemoryStore(now: number): void {
  for (const [k, v] of inMemoryStore) {
    if (v.expiresAt < now) inMemoryStore.delete(k);
  }
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  const keyWithPrefix = `ratelimit:${key}`;

  try {
    const current = await redis.incr(keyWithPrefix);

    if (current === 1) {
      await redis.expire(keyWithPrefix, windowSeconds);
    }

    const remaining = Math.max(0, limit - current);
    const allowed = current <= limit;

    return { allowed, remaining };
  } catch (err) {
    // ── Redis/Upstash DOWN — use in-process fallback (fail-CLOSED) ───────
    console.warn(
      `[rate-limit] Redis unreachable, falling back to in-memory store for key=${key}. Reason:`,
      err instanceof Error ? err.message : err
    );

    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    pruneMemoryStore(now);

    const existing = inMemoryStore.get(keyWithPrefix);
    let count: number;
    let expiresAt: number;

    if (existing == null || existing.expiresAt < now) {
      count = 1;
      expiresAt = now + windowMs;
    } else {
      count = existing.count + 1;
      expiresAt = existing.expiresAt;
    }

    inMemoryStore.set(keyWithPrefix, { count, expiresAt });

    const allowed = count <= limit;
    const remaining = Math.max(0, limit - count);

    return { allowed, remaining };
  }
}
