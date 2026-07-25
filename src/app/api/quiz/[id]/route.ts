import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, requireAdmin } from '@/lib/api-auth';
import { getCached, invalidateCachePattern, invalidateCache } from '@/lib/cache';
import { CACHE_KEYS } from '@/lib/cache-keys';
import { z } from 'zod';
import { canAccessContent } from '@/lib/access';

// GET /api/quiz/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const session = authResult.session;
  const { id } = await params;
  const isAdmin = session.user?.role === 'ADMIN';

  const cacheKey = CACHE_KEYS.quizDetail(id);

  const quiz = await getCached(cacheKey, 1800, async () => {
    return await prisma.quiz.findUnique({
      where: isAdmin ? { id } : { id, published: true },
      select: {
        id: true,
        judul: true,
        deskripsi: true,
        tipeKelas: true,
        tingkatBIPA: true,
        published: true,
        createdAt: true,
        questions: {
          select: {
            id: true, pertanyaan: true, urutan: true,
            options: { select: { id: true, teks: true } },
          },
          orderBy: { urutan: 'asc' },
        },
      },
    });
  });

  if (!quiz) {
    return NextResponse.json({ error: 'Quiz tidak ditemukan' }, { status: 404 });
  }

  const userId = session.user?.id as string;
  const allowed = isAdmin
    ? true
    : await canAccessContent(userId, { tipeKelas: quiz.tipeKelas ?? null, tingkatBIPA: quiz.tingkatBIPA ?? null });

  if (!allowed) {
    return NextResponse.json({ error: 'Kamu tidak memiliki akses ke quiz ini.' }, { status: 403 });
  }

  return NextResponse.json(quiz);
}

// PUT /api/quiz/[id]
const updateQuizSchema = z.object({
  judul: z.string().min(1).optional(),
  deskripsi: z.string().min(1).optional(),
  tipeKelas: z.enum(['REGULER', 'PRIVAT', 'ANAK_REMAJA']).optional().nullable(),
  tingkatBIPA: z.enum(['BIPA_1', 'BIPA_2', 'BIPA_3', 'BIPA_4', 'BIPA_5', 'BIPA_6']).optional().nullable(),
  published: z.boolean().optional(),
  questions: z.array(
    z.object({
      id: z.string().optional(),
      pertanyaan: z.string().min(1),
      urutan: z.number().default(0),
      options: z.array(
        z.object({
          id: z.string().optional(),
          teks: z.string().min(1),
          isCorrect: z.boolean().default(false),
        })
      ).min(2).max(6).refine((options) => {
        return options.filter((o) => o.isCorrect).length === 1;
      }, 'Setiap pertanyaan harus tepat 1 jawaban benar'),
    })
  ).min(1, 'Quiz harus punya minimal 1 soal').optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const { id } = await params;
  const body = await request.json();
  const validated = updateQuizSchema.parse(body);

  // Handle nested update with replace approach
  const quiz = await prisma.quiz.update({
    where: { id },
    data: {
      judul: validated.judul,
      deskripsi: validated.deskripsi,
      tipeKelas: validated.tipeKelas ?? undefined,
      tingkatBIPA: validated.tingkatBIPA ?? undefined,
      published: validated.published,
      ...(validated.questions && {
        questions: {
          deleteMany: {},
          create: validated.questions.map((q) => ({
            pertanyaan: q.pertanyaan, urutan: q.urutan,
            options: { create: q.options },
          })),
        },
      }),
    },
    select: {
      id: true, judul: true, deskripsi: true, tipeKelas: true, tingkatBIPA: true, published: true,
      questions: {
        select: {
          id: true, pertanyaan: true, urutan: true,
          options: { select: { id: true, teks: true, isCorrect: true } },
        },
      },
    },
  });

  // Invalidate cache
  await invalidateCachePattern('quiz:list:*');
  await invalidateCache(CACHE_KEYS.quizCount());
  await invalidateCache(CACHE_KEYS.quizDetail(id));

  return NextResponse.json(quiz);
}

// DELETE /api/quiz/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const { id } = await params;

  await prisma.quiz.delete({
    where: { id },
  });

  await invalidateCachePattern('quiz:list:*');
  await invalidateCache(CACHE_KEYS.quizCount());
  await invalidateCache(CACHE_KEYS.quizDetail(id));

  return NextResponse.json({ success: true });
}
