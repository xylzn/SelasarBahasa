import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { getCached } from '@/lib/cache';
import { CACHE_KEYS } from '@/lib/cache-keys';

// GET /api/quiz/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  const { id } = await params;

  const cacheKey = CACHE_KEYS.quizDetail(id);

  const quiz = await getCached(cacheKey, 1800, async () => {
    return await prisma.quiz.findUnique({
      where: { id, published: true },
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
    });
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

  return NextResponse.json(quiz);
}
