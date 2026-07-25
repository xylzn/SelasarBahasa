import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { canReadContent } from '@/lib/access';

export async function GET(request: Request) {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const userId = authResult.session.user.id as string;
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  if (!query.trim()) {
    return NextResponse.json({ materi: [], tugas: [], quiz: [] });
  }

  const hasAccess = authResult.session.user.role === 'ADMIN'
    ? true
    : await canReadContent(userId);

  // Only show content if user has active enrollment (or is admin)
  if (!hasAccess) {
    return NextResponse.json({ materi: [], tugas: [], quiz: [] });
  }

  const [materi, tugas, quiz] = await Promise.all([
    prisma.materi.findMany({
      where: { published: true, judul: { contains: query, mode: 'insensitive' } },
      select: { id: true, judul: true, slug: true, tipe: true, tipeKelas: true, tingkatBIPA: true },
      take: 10,
      orderBy: { urutan: 'asc' },
    }),
    prisma.tugas.findMany({
      where: { published: true, judul: { contains: query, mode: 'insensitive' } },
      select: { id: true, judul: true, slug: true, tipeKelas: true, tingkatBIPA: true },
      take: 10,
      orderBy: { urutan: 'asc' },
    }),
    prisma.quiz.findMany({
      where: { published: true, judul: { contains: query, mode: 'insensitive' } },
      select: { id: true, judul: true, tipeKelas: true, tingkatBIPA: true },
      take: 10,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return NextResponse.json({ materi, tugas, quiz });
}
