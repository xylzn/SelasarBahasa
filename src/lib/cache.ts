import { redis } from './redis';

export async function getCached<T>(
  key: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached as string);
    }
  } catch (e) {
    console.error('Cache get error:', e);
  }

  const data = await fetchFn();

  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(data));
  } catch (e) {
    console.error('Cache set error:', e);
  }

  return data;
}

export async function invalidateCache(...keys: string[]): Promise<void> {
  try {
    await redis.del(...keys);
  } catch (e) {
    console.error('Cache invalidate error:', e);
  }
}

export async function invalidateCachePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (e) {
    console.error('Cache invalidate pattern error:', e);
  }
}
