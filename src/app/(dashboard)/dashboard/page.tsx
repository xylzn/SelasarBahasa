import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { getCached } from '@/lib/cache';
import { CACHE_KEYS } from '@/lib/cache-keys';
import DashboardOverview from '@/components/dashboard/DashboardOverview';

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const [totalMateri, totalQuiz, recentAttempts, completedMateriCount] = await Promise.all([
    getCached(CACHE_KEYS.materiCount(), 1800, async () => {
      return prisma.materi.count({ where: { published: true } });
    }),
    getCached(CACHE_KEYS.quizCount(), 1800, async () => {
      return prisma.quiz.count({ where: { published: true } });
    }),
    userId
      ? await prisma.quizAttempt.findMany({
          where: { userId },
          include: { quiz: true },
          orderBy: { completedAt: 'desc' },
          take: 5,
        })
      : [],
    userId
      ? await prisma.materiProgress.count({ where: { userId } })
      : 0,
  ]);

  return (
    <DashboardOverview
      totalMateri={totalMateri}
      totalQuiz={totalQuiz}
      recentAttempts={recentAttempts}
      completedMateriCount={completedMateriCount}
    />
  );
}
