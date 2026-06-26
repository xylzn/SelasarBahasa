import { redis } from './redis';

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  const keyWithPrefix = `ratelimit:${key}`;
  
  const current = await redis.incr(keyWithPrefix);
  
  if (current === 1) {
    await redis.expire(keyWithPrefix, windowSeconds);
  }
  
  const remaining = Math.max(0, limit - current);
  const allowed = current <= limit;
  
  return { allowed, remaining };
}
