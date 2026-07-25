import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, requireAuth } from '@/lib/api-auth';
import { z } from 'zod';
import { invalidateCachePattern } from '@/lib/cache';
import { getEnrollmentAccess } from '@/lib/access';

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();

export async function GET(request: Request) {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const userId = authResult.session.user.id as string;
  const isAdmin = authResult.session.user?.role === 'ADMIN';

  let contentFilter = {};
  if (!isAdmin) {
    const enrollment = await getEnrollmentAccess(userId);
    if (!enrollment) return NextResponse.json([]);
    contentFilter = {
      tingkatBIPA: enrollment.kelas.tingkat,
      OR: [
        { tipeKelas: enrollment.kelas.tipe },
        ...(enrollment.kelas.tipe === 'PRIVAT' ? [{ tipeKelas: 'REGULER' }] : []),
      ],
    };
  }

  const tugas = await prisma.tugas.findMany({
    where: { published: true, ...contentFilter },
    orderBy: { urutan: 'asc' },
  });

  return NextResponse.json(tugas);
}

const createTugasSchema = z.object({
  judul: z.string().min(1),
  slug: z.string().optional(),
  instruksi: z.string().min(1),
  fileInstruksiUrl: z.string().optional(),
  tipeKelas: z.enum(['REGULER', 'PRIVAT', 'ANAK_REMAJA']).default('REGULER'),
  tingkatBIPA: z.enum(['BIPA_1', 'BIPA_2', 'BIPA_3', 'BIPA_4', 'BIPA_5', 'BIPA_6']).default('BIPA_1'),
  deadline: z.string().optional(),
  urutan: z.number().default(0),
  published: z.boolean().default(true),
});

export async function POST(request: Request) {
  const authResult = await requireAdmin();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
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
      tipeKelas: validated.tipeKelas,
      tingkatBIPA: validated.tingkatBIPA,
      deadline: validated.deadline ? new Date(validated.deadline) : null,
      urutan: validated.urutan,
      published: validated.published,
    },
  });

  await invalidateCachePattern('tugas:list:*');

  return NextResponse.json(newTugas, { status: 201 });
}
