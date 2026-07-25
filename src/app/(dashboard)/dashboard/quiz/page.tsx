import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import QuizCard from '@/components/quiz/QuizCard';
import { getEnrollmentAccess } from '@/lib/access';
import Link from 'next/link';

export default async function QuizPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const isAdmin = session?.user?.role === 'ADMIN';

  let contentFilter: object = {};
  if (!isAdmin) {
    if (!userId) return <div className="p-8 text-gray-500">Silakan login terlebih dahulu.</div>;
    const enrollment = await getEnrollmentAccess(userId);
    if (!enrollment) {
      return (
        <div className="p-8 text-center">
          <p className="text-gray-500 mb-4">Kamu belum terdaftar di kelas aktif.</p>
          <Link href="/#packages" className="text-brand-blue font-semibold hover:underline">Pilih Program →</Link>
        </div>
      );
    }
    contentFilter = {
      tingkatBIPA: enrollment.kelas.tingkat,
      OR: [
        { tipeKelas: enrollment.kelas.tipe },
        ...(enrollment.kelas.tipe === 'PRIVAT' ? [{ tipeKelas: 'REGULER' }] : []),
      ],
    };
  }

  const quizList = await prisma.quiz.findMany({
    where: { published: true, ...contentFilter },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quiz</h1>
        <p className="text-gray-600">Uji kemampuanmu dengan quiz interaktif.</p>
      </div>

      {quizList.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">Belum ada quiz yang tersedia untuk kelasmu.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizList.map((quiz) => (
          <QuizCard
            key={quiz.id}
            id={quiz.id}
            judul={quiz.judul}
            deskripsi={quiz.deskripsi}
          />
        ))}
      </div>
    </div>
  );
}
