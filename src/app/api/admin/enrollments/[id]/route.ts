import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  status: z.enum(['PENDING_PAYMENT', 'WAITING', 'ACTIVE', 'COMPLETED', 'REFUND_REQUESTED', 'REFUNDED']),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const enrollment = await prisma.enrollment.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  return NextResponse.json(enrollment);
}
