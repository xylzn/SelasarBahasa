import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import QuizCard from '@/components/quiz/QuizCard';
import { hasActivePremiumAccess } from '@/lib/access';

export default async function QuizPage() {
  const session = await auth();
  const userCanAccessPremium = hasActivePremiumAccess({
    role: session?.user?.role || 'USER',
    premiumExpiresAt: session?.user?.premiumExpiresAt ? new Date(session.user.premiumExpiresAt) : null,
  });

  // Fetch directly without cache
  const quizList = await prisma.quiz.findMany({
    where: {
      published: true,
    },
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quiz</h1>
        <p className="text-gray-600">Uji kemampuanmu dengan quiz interaktif.</p>
      </div>

      {quizList.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">Belum ada quiz yang tersedia.</p>
        </div>
      )}

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
