import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const auth = await requireAdmin();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const enrollments = await prisma.enrollment.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { nama: true, email: true, noWhatsapp: true } },
      kelas: { select: { tipe: true, tingkat: true } },
    },
  });

  return NextResponse.json(enrollments);
}
