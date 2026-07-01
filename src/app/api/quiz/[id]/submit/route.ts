import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const submitQuizSchema = z.object({
  jawaban: z.record(z.string(), z.string()), // questionId -> optionId
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  const userId = session.user?.id as string;
  const { id } = await params;

  // Rate limit: max 10 per minute per user
  const { allowed } = await checkRateLimit(
    `quiz-submit:${userId}`,
    10,
    60
  );
  if (!allowed) {
    return NextResponse.json(
      { error: 'Terlalu banyak permintaan, coba lagi nanti' },
      { status: 429 }
    );
  }

  const body = await request.json();
  const validated = submitQuizSchema.parse(body);

  // Get full quiz with correct answers (server-side only!)
  const quiz = await prisma.quiz.findUnique({
    where: { id, published: true },
    include: {
      questions: {
        include: {
          options: true,
        },
      },
    },
  });

  if (!quiz) {
    return NextResponse.json({ error: 'Quiz tidak ditemukan' }, { status: 404 });
  }

  const isPremium = session.user?.role === 'ADMIN' || session.user?.role === 'PREMIUM';
  if (quiz.isPremium && !isPremium) {
    return NextResponse.json(
      { error: 'Quiz ini membutuhkan akses premium' },
      { status: 403 }
    );
  }

  // Calculate score
  let correctCount = 0;
  const breakdown = [];

  for (const question of quiz.questions) {
    const userOptionId = validated.jawaban[question.id];
    const correctOption = question.options.find((o: any) => o.isCorrect);
    const isCorrect = userOptionId && userOptionId === correctOption?.id;

    if (isCorrect) correctCount++;

    breakdown.push({
      questionId: question.id,
      pertanyaan: question.pertanyaan,
      jawabanUser: userOptionId || null,
      isCorrect,
      jawabanBenar: correctOption?.id,
    });
  }

  const score = quiz.questions.length > 0 ? Math.round((correctCount / quiz.questions.length) * 100) : 0;

  // Save attempt
  const attempt = await prisma.quizAttempt.create({
    data: {
      userId,
      quizId: id,
      score,
      jawaban: validated.jawaban, // now this is Json!
    },
  });

  return NextResponse.json({
    score,
    breakdown,
    attemptId: attempt.id,
  });
}
