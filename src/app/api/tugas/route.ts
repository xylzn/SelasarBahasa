import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, requireAuth } from '@/lib/api-auth';
import { z } from 'zod';

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();

export async function GET(request: Request) {
  const session = await requireAuth();
  const { searchParams } = new URL(request.url);
  const kelas = searchParams.get('kelas');

  const isPremium = session.user?.role === 'ADMIN' || session.user?.role === 'PREMIUM';

  const tugas = await prisma.tugas.findMany({
    where: {
      published: true,
      ...(!isPremium && { isPremium: false }),
      ...(kelas && { kelas: kelas as any }),
    },
    orderBy: { urutan: 'asc' },
  });

  return NextResponse.json(tugas);
}

const createTugasSchema = z.object({
  judul: z.string().min(1),
  slug: z.string().optional(),
  instruksi: z.string().min(1),
  fileInstruksiUrl: z.string().optional(),
  kelas: z.enum(['DASAR', 'MENENGAH', 'LANJUTAN']).default('DASAR'),
  isPremium: z.boolean().default(false),
  deadline: z.string().optional(),
  urutan: z.number().default(0),
  published: z.boolean().default(true),
});

export async function POST(request: Request) {
  await requireAdmin();
  const body = await request.json();
  const validated = createTugasSchema.parse(body);

  let slug = validated.slug || slugify(validated.judul);
  let slugExists = await prisma.tugas.findUnique({ where: { slug } });
  let counter = 1;
  while (slugExists) {
    slug = `${slugify(validated.judul)}-${counter}`;
    slugExists = await prisma.tugas.findUnique({ where: { slug } });
    counter++;
  }

  const newTugas = await prisma.tugas.create({
    data: {
      judul: validated.judul,
      slug,
      instruksi: validated.instruksi,
      fileInstruksiUrl: validated.fileInstruksiUrl,
      kelas: validated.kelas,
      isPremium: validated.isPremium,
      deadline: validated.deadline ? new Date(validated.deadline) : null,
      urutan: validated.urutan,
      published: validated.published,
    },
  });

  return NextResponse.json(newTugas, { status: 201 });
}
