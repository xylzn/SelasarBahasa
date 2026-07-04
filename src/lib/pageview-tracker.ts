import { redis } from './redis';

function getTodayKey(): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  return `pageview:home:${yyyy}-${mm}-${dd}`;
}

function getDateKey(daysAgo: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `pageview:home:${yyyy}-${mm}-${dd}`;
}

function getDateLabel(daysAgo: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

/**
 * Increments the homepage visit counter for today.
 * Key format: pageview:home:YYYY-MM-DD
 * Expires after 90 days automatically.
 */
export async function trackHomepageVisit(): Promise<void> {
  const key = getTodayKey();
  await redis.incr(key);
  // Set expiry only on first visit of the day (when count becomes 1),
  // but it's safe to call expire every time — negligible overhead.
  await redis.expire(key, 60 * 60 * 24 * 90); // 90 days
}

export interface DailyVisit {
  date: string;  // formatted label
  count: number;
}

/**
 * Returns visit counts for the last 7 days (today + 6 previous days),
 * ordered from oldest to newest (left = oldest, right = today).
 */
export async function getHomepageVisitsLast7Days(): Promise<DailyVisit[]> {
  // Build keys for day-6 to day-0 (oldest to newest)
  const days = [6, 5, 4, 3, 2, 1, 0];
  const keys = days.map((d) => getDateKey(d));

  const results = await Promise.all(keys.map((key) => redis.get(key)));

  return days.map((daysAgo, i) => ({
    date: getDateLabel(daysAgo),
    count: results[i] ? Number(results[i]) : 0,
  }));
}
