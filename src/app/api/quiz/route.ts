import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession, requireAdmin, requireAuth } from '@/lib/api-auth';
import { getCached, invalidateCachePattern, invalidateCache } from '@/lib/cache';
import { CACHE_KEYS } from '@/lib/cache-keys';
import { z } from 'zod';
import { canReadContent } from '@/lib/access';

// GET /api/quiz
export async function GET(request: Request) {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const session = authResult.session;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const isAdmin = session.user?.role === 'ADMIN';

  const userId = session.user?.id as string;
  const hasAccess = isAdmin ? true : await canReadContent(userId);
  const cacheKey = CACHE_KEYS.quizList(page);

  const quizzes = await getCached(cacheKey, 1800, async () => {
    return await prisma.quiz.findMany({
      where: isAdmin ? undefined : (hasAccess ? { published: true } : { id: '' }),
      select: {
        id: true, judul: true, deskripsi: true, tipeKelas: true, tingkatBIPA: true,
        published: true, createdAt: true, _count: { select: { questions: true } },
      },
      skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
    });
  });

  return NextResponse.json(quizzes);
}

// POST /api/quiz (admin)
const createQuizSchema = z.object({
  judul: z.string().min(1),
  deskripsi: z.string().min(1),
  tipeKelas: z.enum(['REGULER', 'PRIVAT', 'ANAK_REMAJA']).optional().nullable(),
  tingkatBIPA: z.enum(['BIPA_1', 'BIPA_2', 'BIPA_3', 'BIPA_4', 'BIPA_5', 'BIPA_6']).optional().nullable(),
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
  const authResult = await requireAdmin();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const body = await request.json();
  const validated = createQuizSchema.parse(body);

  const quiz = await prisma.quiz.create({
    data: {
      judul: validated.judul,
      deskripsi: validated.deskripsi,
      tipeKelas: validated.tipeKelas ?? null,
      tingkatBIPA: validated.tingkatBIPA ?? null,
      published: validated.published,
      questions: {
        create: validated.questions.map((q) => ({
          pertanyaan: q.pertanyaan,
          urutan: q.urutan,
          options: { create: q.options },
        })),
      },
    },
    select: {
      id: true, judul: true, deskripsi: true, tipeKelas: true, tingkatBIPA: true,
      published: true, createdAt: true,
      questions: {
        select: {
          id: true, pertanyaan: true, urutan: true,
          options: { select: { id: true, teks: true } },
        },
      },
    },
  });

  await invalidateCachePattern('quiz:list:*');
  await invalidateCache(CACHE_KEYS.quizCount());

  return NextResponse.json(quiz, { status: 201 });
}
