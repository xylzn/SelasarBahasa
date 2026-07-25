import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/aktivitas-kita — public
export async function GET() {
  const items = await prisma.aktivitasKita.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      media: true,
    },
  });
  return NextResponse.json(items);
}
