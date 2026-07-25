import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  nama: z.string().min(1).optional(),
  tipe: z.enum(['REGULER', 'PRIVAT', 'ANAK_REMAJA']).optional(),
  tingkat: z.enum(['BIPA_1', 'BIPA_2', 'BIPA_3', 'BIPA_4', 'BIPA_5', 'BIPA_6']).optional(),
  status: z.enum(['WAITING_LIST', 'ONGOING', 'COMPLETED']).optional(),
  minKuota: z.coerce.number().int().min(1).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const auth = await requireAdmin();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const kelas = await prisma.kelas.findUnique({
    where: { id },
    include: { _count: { select: { enrollments: true } } },
  });
  if (!kelas) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 });
  return NextResponse.json(kelas);
}

export async function PUT(request: Request, { params }: Params) {
  const auth = await requireAdmin();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  // When transitioning to ONGOING, bulk-activate all WAITING enrollments in a transaction
  if (parsed.data.status === 'ONGOING') {
    const [kelas] = await prisma.$transaction([
      prisma.kelas.update({ where: { id }, data: parsed.data }),
      prisma.enrollment.updateMany({
        where: { kelasId: id, status: 'WAITING' },
        data: { status: 'ACTIVE' },
      }),
    ]);
    return NextResponse.json(kelas);
  }

  // When transitioning to COMPLETED, bulk-graduate all ACTIVE enrollments
  if (parsed.data.status === 'COMPLETED') {
    const [kelas] = await prisma.$transaction([
      prisma.kelas.update({ where: { id }, data: parsed.data }),
      prisma.enrollment.updateMany({
        where: { kelasId: id, status: 'ACTIVE' },
        data: { status: 'COMPLETED' },
      }),
    ]);
    return NextResponse.json(kelas);
  }

  const kelas = await prisma.kelas.update({ where: { id }, data: parsed.data });
  return NextResponse.json(kelas);
}

export async function DELETE(_req: Request, { params }: Params) {
  const auth = await requireAdmin();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  await prisma.kelas.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
