import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';
import { getCached } from '@/lib/cache';
import { CACHE_KEYS } from '@/lib/cache-keys';

export async function GET() {
  await requireAdmin();

  const cacheKey = CACHE_KEYS.adminStats();

  const stats = await getCached(cacheKey, 120, async () => {
    const [
      totalUsers,
      totalMateri,
      totalQuiz,
      totalArtikel,
      unreadMessages,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.materi.count({ where: { published: true } }),
      prisma.quiz.count({ where: { published: true } }),
      prisma.article.count({ where: { published: true } }),
      prisma.contactMessage.count({ where: { isRead: false } }),
    ]);

    return {
      totalUsers,
      totalMateri,
      totalQuiz,
      totalArtikel,
      unreadMessages,
    };
  });

  return NextResponse.json(stats);
}
