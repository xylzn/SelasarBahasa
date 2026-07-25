import prisma from '@/lib/prisma';
import AdminDashboardOverview from '@/components/admin/AdminDashboardOverview';
import { getCached } from '@/lib/cache';
import { CACHE_KEYS } from '@/lib/cache-keys';
import { getHomepageVisitsLast7Days } from '@/lib/pageview-tracker';

export default async function AdminDashboardPage() {
  const [
    totalUsers,
    totalMateri,
    totalQuiz,
    totalArtikel,
    topArticles,
    homepageVisits,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.materi.count({ where: { published: true } }),
    prisma.quiz.count({ where: { published: true } }),
    prisma.article.count({ where: { published: true } }),
    getCached(
      CACHE_KEYS.topArticles(),
      600,
      () =>
        prisma.article.findMany({
          where: { published: true },
          orderBy: { views: 'desc' },
          take: 5,
          select: { id: true, judul: true, slug: true, views: true },
        })
    ),
    getHomepageVisitsLast7Days(),
  ]);

  return (
    <AdminDashboardOverview
      totalUsers={totalUsers}
      totalMateri={totalMateri}
      totalQuiz={totalQuiz}
      totalArtikel={totalArtikel}
      topArticles={topArticles}
      homepageVisits={homepageVisits}
    />
  );
}
