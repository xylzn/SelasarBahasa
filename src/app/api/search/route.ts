import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { canReadContent } from '@/lib/access';
import { checkRateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/get-client-ip';

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const { allowed: ipAllowed } = await checkRateLimit(`search:ip:${ip}`, 120, 60);
  if (!ipAllowed) {
    return NextResponse.json(
      { error: 'Terlalu banyak permintaan pencarian. Coba lagi sebentar.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  const authResult = await requireAuth();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const userId = authResult.session.user.id as string;
  const { allowed: userAllowed } = await checkRateLimit(`search:user:${userId}`, 60, 60);
  if (!userAllowed) {
    return NextResponse.json(
      { error: 'Terlalu banyak permintaan pencarian. Coba lagi sebentar.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') || '').trim();

  if (!query.trim()) {
    return NextResponse.json({ materi: [], tugas: [], quiz: [] });
  }
  if (query.length > 100) {
    return NextResponse.json({ error: 'Kata pencarian terlalu panjang.' }, { status: 400 });
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
