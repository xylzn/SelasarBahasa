import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import prisma from '@/lib/prisma';
import { sendRefundNotificationEmail } from '@/lib/email';
import { z } from 'zod';

const schema = z.object({
  alasan: z.string().min(10, 'Alasan minimal 10 karakter'),
  rekening: z.string().min(5, 'Rekening harus diisi'),
});

export async function POST(request: Request) {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId: authResult.session.user.id,
      status: { in: ['PENDING_PAYMENT', 'WAITING', 'ACTIVE'] },
    },
    include: { kelas: true, user: { select: { nama: true, email: true, noWhatsapp: true } } },
  });

  if (!enrollment) {
    return NextResponse.json({ error: 'Tidak ada enrollment aktif.' }, { status: 404 });
  }

  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: { alasanRefund: parsed.data.alasan, status: 'REFUND_REQUESTED' },
  });

  const emailResult = await sendRefundNotificationEmail(
    enrollment.user.nama,
    enrollment.user.email,
    parsed.data.alasan,
    parsed.data.rekening
  );
  if (!emailResult.success) {
    console.error('[/api/enrollment/refund] Email failed:', emailResult.error);
  }

  return NextResponse.json({ ok: true });
}
