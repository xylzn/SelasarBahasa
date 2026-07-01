import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession, requireAdmin, requireAuth } from '@/lib/api-auth';
import { getCached, invalidateCachePattern } from '@/lib/cache';
import { CACHE_KEYS } from '@/lib/cache-keys';
import { z } from 'zod';

// GET /api/quiz
export async function GET(request: Request) {
  const session = await requireAuth();
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const isAdmin = session.user?.role === 'ADMIN';

  const isPremium = session.user?.role === 'ADMIN' || session.user?.role === 'PREMIUM';
  const cacheKey = CACHE_KEYS.quizList(page, isPremium);

  const quizzes = await getCached(cacheKey, 1800, async () => {
    return await prisma.quiz.findMany({
      where: isAdmin ? undefined : {
        published: true,
        ...(!isPremium && { isPremium: false }),
      },
      select: {
        id: true,
        judul: true,
        deskripsi: true,
        isPremium: true,
        kelas: true,
        published: true,
        createdAt: true,
        _count: { select: { questions: true } }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  });

  return NextResponse.json(quizzes);
}

// POST /api/quiz (admin)
const createQuizSchema = z.object({
  judul: z.string().min(1),
  deskripsi: z.string().min(1),
  kelas: z.enum(['DASAR', 'MENENGAH', 'LANJUTAN']).default('DASAR'),
  isPremium: z.boolean().default(false),
  published: z.boolean().default(true),
  questions: z.array(
    z.object({
      pertanyaan: z.string().min(1),
      urutan: z.number().default(0),
      options: z.array(
        z.object({
          teks: z.string().min(1),
          isCorrect: z.boolean().default(false),
        })
      ).min(2).max(6).refine((options) => {
        return options.filter((o) => o.isCorrect).length === 1;
      }, 'Setiap pertanyaan harus tepat 1 jawaban benar'),
    })
  ).min(1, 'Quiz harus punya minimal 1 soal'),
});

export async function POST(request: Request) {
  await requireAdmin();
  const body = await request.json();
  const validated = createQuizSchema.parse(body);

  const quiz = await prisma.quiz.create({
    data: {
      judul: validated.judul,
      deskripsi: validated.deskripsi,
      kelas: validated.kelas,
      isPremium: validated.isPremium,
      published: validated.published,
      questions: {
        create: validated.questions.map((q) => ({
          pertanyaan: q.pertanyaan,
          urutan: q.urutan,
          options: {
            create: q.options,
          },
        })),
      },
    },
    select: {
      id: true,
      judul: true,
      deskripsi: true,
      isPremium: true,
      kelas: true,
      published: true,
      createdAt: true,
      questions: {
        select: {
          id: true,
          pertanyaan: true,
          urutan: true,
          options: {
            select: {
              id: true,
              teks: true,
            },
          },
        },
      },
    },
  });

  await invalidateCachePattern('quiz:list:*');

  return NextResponse.json(quiz, { status: 201 });
}
