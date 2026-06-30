import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const [totalMateri, totalQuiz, recentAttempts] = await Promise.all([
    prisma.materi.count({ where: { published: true } }),
    prisma.quiz.count({ where: { published: true } }),
    userId
      ? await prisma.quizAttempt.findMany({
          where: { userId },
          include: { quiz: true },
          orderBy: { completedAt: 'desc' },
          take: 5,
        })
      : [],
  ]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Selamat datang kembali! Lanjutkan perjalanan belajarmu.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Materi</h3>
          <p className="text-3xl font-bold text-gray-900">{totalMateri}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Quiz</h3>
          <p className="text-3xl font-bold text-gray-900">{totalQuiz}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Quiz Diambil</h3>
          <p className="text-3xl font-bold text-gray-900">{recentAttempts.length}</p>
        </div>
      </div>

      {recentAttempts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quiz Terbaru</h2>
          <div className="space-y-4">
            {recentAttempts.map((attempt) => (
              <div key={attempt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{attempt.quiz.judul}</p>
                  <p className="text-sm text-gray-500">
                    {attempt.completedAt ? new Date(attempt.completedAt).toLocaleDateString('id-ID') : 'Belum selesai'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{attempt.skor ?? '-'}</p>
                  <p className="text-xs text-gray-500">Skor</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
