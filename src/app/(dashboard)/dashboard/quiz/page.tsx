import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import QuizCard from '@/components/quiz/QuizCard';

export default async function QuizPage() {
  const session = await auth();
  const userRole = session?.user?.role || 'USER';
  const userCanAccessPremium = userRole === 'ADMIN' || userRole === 'PREMIUM';

  const quizList = await prisma.quiz.findMany({
    where: { published: true },
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quiz</h1>
        <p className="text-gray-600">Uji kemampuanmu dengan quiz interaktif.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizList.map((quiz) => (
          <QuizCard
            key={quiz.id}
            id={quiz.id}
            judul={quiz.judul}
            deskripsi={`Quiz untuk kelas ${quiz.kelas.toLowerCase()}`}
            isPremium={quiz.isPremium}
            userCanAccess={userCanAccessPremium}
          />
        ))}
      </div>
    </div>
  );
}
