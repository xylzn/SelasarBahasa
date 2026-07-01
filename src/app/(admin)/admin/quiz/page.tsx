import Link from 'next/link';
import prisma from '@/lib/prisma';
import QuizTableClient from '@/components/admin/QuizTableClient';

export default async function AdminQuizPage() {
  const quizList = await prisma.quiz.findMany({
    include: { _count: { select: { questions: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Kelola Quiz</h1>
          <p className="text-gray-600">Tambah, edit, atau hapus quiz.</p>
        </div>
        <Link
          href="/admin/quiz/create"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          + Tambah Quiz
        </Link>
      </div>

      <QuizTableClient quizzes={quizList} />
    </div>
  );
}
