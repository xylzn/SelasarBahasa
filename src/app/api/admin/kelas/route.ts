import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  nama: z.string().min(1, 'Nama kelas harus diisi'),
  tipe: z.enum(['REGULER', 'PRIVAT', 'ANAK_REMAJA']),
  tingkat: z.enum(['BIPA_1', 'BIPA_2', 'BIPA_3', 'BIPA_4', 'BIPA_5', 'BIPA_6']),
  status: z.enum(['WAITING_LIST', 'ONGOING', 'COMPLETED']).default('WAITING_LIST'),
  minKuota: z.coerce.number().int().min(1).default(5),
});

export async function GET() {
  const auth = await requireAdmin();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const kelas = await prisma.kelas.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { enrollments: true } } },
  });
  return NextResponse.json(kelas);
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const kelas = await prisma.kelas.create({ data: parsed.data });
  return NextResponse.json(kelas, { status: 201 });
}
