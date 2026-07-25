import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { getAllUserEnrollments } from '@/lib/access';
import DashboardOverview from '@/components/dashboard/DashboardOverview';

type MateriOrQuizFilter = {
  OR: Array<
    { tipeKelas: never; tingkatBIPA: never }
  >;
  published: true;
};

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  let totalMateri = 0;
  let totalQuiz = 0;
  let completedMateriCount = 0;
  let recentAttempts: any[] = [];
  let enrolledCount = 0;

  if (userId) {
    const enrollments = await getAllUserEnrollments(userId);

    if (enrollments.length > 0) {
      const filterRules: { tipeKelas: any; tingkatBIPA: any }[] = [];
      enrollments.forEach((e: any) => {
        filterRules.push({ tipeKelas: e.kelas.tipe, tingkatBIPA: e.kelas.tingkat });
        if (e.kelas.tipe === 'PRIVAT') {
          filterRules.push({ tipeKelas: 'REGULER', tingkatBIPA: e.kelas.tingkat });
        }
      });

      const kelasFilter = {
        OR: filterRules as MateriOrQuizFilter['OR'],
        published: true as const,
      };

      [totalMateri, totalQuiz, recentAttempts, completedMateriCount, enrolledCount] = await Promise.all([
        prisma.materi.count({ where: kelasFilter }),
        prisma.quiz.count({ where: kelasFilter }),
        prisma.quizAttempt.findMany({
          where: {
            userId,
            quiz: {
              OR: filterRules as MateriOrQuizFilter['OR'],
            },
          },
          include: { quiz: true },
          orderBy: { completedAt: 'desc' },
          take: 5,
        }),
        prisma.materiProgress.count({
          where: {
            userId,
            materi: {
              OR: filterRules as MateriOrQuizFilter['OR'],
            },
          },
        }),
        (() => {
          const latestEnrollment = enrollments[0];
          return latestEnrollment
            ? prisma.enrollment.count({
                where: {
                  kelasId: latestEnrollment.kelasId,
                  status: { in: ['WAITING', 'ACTIVE', 'COMPLETED'] },
                },
              })
            : 0;
        })(),
      ]);
    }
  }

  return (
    <DashboardOverview
      totalMateri={totalMateri}
      totalQuiz={totalQuiz}
      recentAttempts={recentAttempts}
      completedMateriCount={completedMateriCount}
      enrolledCount={enrolledCount}
    />
  );
}
