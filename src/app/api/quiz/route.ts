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

  const isPremium = session.user?.role === 'ADMIN' || session.user?.role === 'PREMIUM';
  const cacheKey = CACHE_KEYS.quizList(page, isPremium);

  const quizzes = await getCached(cacheKey, 1800, async () => {
    return await prisma.quiz.findMany({
      where: {
        published: true,
        ...(!isPremium && { isPremium: false }),
      },
      select: {
        id: true,
        judul: true,
        isPremium: true,
        tipe: true,
        kelas: true,
        slug: true,
        pertanyaan: {
          select: {
            id: true,
            teks: true,
            urutan: true,
            pilihan: true, // NO jawabanBenar!
            tipe: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    });
  });

  return NextResponse.json(quizzes);
}

// POST /api/quiz
const createQuizSchema = z.object({
  judul: z.string().min(1),
  slug: z.string().min(1),
  materiId: z.string().optional(),
  tipe: z.enum(['PILIHAN_GANDA', 'ESAY']).default('PILIHAN_GANDA'),
  kelas: z.enum(['DASAR', 'MENENGAH', 'LANJUTAN']).default('DASAR'),
  isPremium: z.boolean().default(false),
  urutan: z.number().default(0),
  published: z.boolean().default(true),
  pertanyaan: z.array(
    z.object({
      teks: z.string().min(1),
      tipe: z.enum(['PILIHAN_GANDA', 'ESAY']).default('PILIHAN_GANDA'),
      pilihan: z.array(z.string()).optional(),
      jawabanBenar: z.string().optional(),
      urutan: z.number().default(0),
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
      slug: validated.slug,
      materiId: validated.materiId,
      tipe: validated.tipe,
      kelas: validated.kelas,
      isPremium: validated.isPremium,
      urutan: validated.urutan,
      published: validated.published,
      pertanyaan: {
        create: validated.pertanyaan,
      },
    },
    include: {
      pertanyaan: true,
    },
  });

  // Invalidate cache
  await invalidateCachePattern('quiz:list:*');

  return NextResponse.json(quiz, { status: 201 });
}
