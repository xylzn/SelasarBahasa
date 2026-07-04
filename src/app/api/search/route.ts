import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { hasActivePremiumAccess } from '@/lib/access';

export async function GET(request: Request) {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const session = authResult.session;
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  if (!query.trim()) {
    return NextResponse.json({ materi: [], tugas: [], quiz: [] });
  }

  const userCanAccessPremium = hasActivePremiumAccess({
    role: session?.user?.role || 'USER',
    premiumExpiresAt: session?.user?.premiumExpiresAt ? new Date(session.user.premiumExpiresAt) : null,
  });

  // Search materi
  const materi = await prisma.materi.findMany({
    where: {
      published: true,
      judul: { contains: query, mode: 'insensitive' },
      ...(!userCanAccessPremium && { isPremium: false }),
    },
    select: {
      id: true,
      judul: true,
      slug: true,
      kelas: true,
      isPremium: true,
      tipe: true,
    },
    take: 10,
    orderBy: { urutan: 'asc' },
  });

  // Search tugas
  const tugas = await prisma.tugas.findMany({
    where: {
      published: true,
      judul: { contains: query, mode: 'insensitive' },
      ...(!userCanAccessPremium && { isPremium: false }),
    },
    select: {
      id: true,
      judul: true,
      slug: true,
      kelas: true,
      isPremium: true,
    },
    take: 10,
    orderBy: { urutan: 'asc' },
  });

  // Search quiz
  const quiz = await prisma.quiz.findMany({
    where: {
      published: true,
      judul: { contains: query, mode: 'insensitive' },
      ...(!userCanAccessPremium && { isPremium: false }),
    },
    select: {
      id: true,
      judul: true,
      kelas: true,
      isPremium: true,
    },
    take: 10,
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ materi, tugas, quiz });
}
