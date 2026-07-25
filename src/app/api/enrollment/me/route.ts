import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId: authResult.session.user.id,
      status: { in: ['PENDING_PAYMENT', 'WAITING', 'ACTIVE', 'COMPLETED', 'REFUND_REQUESTED'] },
    },
    include: { kelas: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ enrollment });
}
