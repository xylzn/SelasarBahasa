import QuizForm from '@/components/admin/forms/QuizForm';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: {
        include: {
          options: true,
        },
        orderBy: {
          urutan: 'asc',
        },
      },
    },
  });

  if (!quiz) return notFound();

  return <QuizForm quizId={id} initialData={quiz} />;
}