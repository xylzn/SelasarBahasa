import { redis } from './redis';

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
    // Fail-open: if Redis is down, don't block core features like password reset
    console.error('[rate-limit] Redis error — failing open:', err);
    return { allowed: true, remaining: limit };
  }
}
