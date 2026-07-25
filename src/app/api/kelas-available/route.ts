import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/kelas-available?tipe=REGULER
// Public — used by registration forms to list open batches
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tipe = searchParams.get('tipe');

  const kelas = await prisma.kelas.findMany({
    where: {
      status: 'WAITING_LIST',
      ...(tipe ? { tipe: tipe as any } : {}),
    },
    select: { id: true, tipe: true, tingkat: true, minKuota: true, _count: { select: { enrollments: true } } },
    orderBy: { tingkat: 'asc' },
  });

  return NextResponse.json(kelas);
}
