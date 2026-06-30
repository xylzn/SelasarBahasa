import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const submitQuizSchema = z.object({
  jawaban: z.record(z.string(), z.string()),
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
      pertanyaan: true,
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

  for (const question of quiz.pertanyaan) {
    const userAnswer = validated.jawaban[question.id];
    const isCorrect = question.jawabanBenar && userAnswer === question.jawabanBenar;

    if (isCorrect) correctCount++;

    breakdown.push({
      questionId: question.id,
      pertanyaan: question.teks,
      jawabanUser: userAnswer || null,
      isCorrect,
      jawabanBenar: question.jawabanBenar,
    });
  }

  const score = quiz.pertanyaan.length > 0 ? Math.round((correctCount / quiz.pertanyaan.length) * 100) : 0;

  // Save attempt
  const attempt = await prisma.quizAttempt.create({
    data: {
      userId,
      quizId: id,
      skor: score,
      jawaban: JSON.stringify(validated.jawaban), // karena field jawaban di schema adalah String
    },
  });

  return NextResponse.json({
    score,
    breakdown,
    attemptId: attempt.id,
  });
}
