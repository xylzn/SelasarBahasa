import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, requireAuth } from '@/lib/api-auth';
import { z } from 'zod';

const updateTugasSchema = z.object({
  judul: z.string().min(1),
  slug: z.string().optional(),
  instruksi: z.string().min(1),
  fileInstruksiUrl: z.string().optional().nullable(),
  kelas: z.enum(['DASAR', 'MENENGAH', 'LANJUTAN']),
  isPremium: z.boolean(),
  deadline: z.string().optional().nullable(),
  urutan: z.number(),
  published: z.boolean(),
});

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const user = authResult.session.user!; // User is guaranteed because requireAuth checks
  const { id } = await params;

  const tugas = await prisma.tugas.findUnique({
    where: { id },
    include: {
      submissions: {
        where: { userId: user.id },
        include: { files: true },
      },
    },
  });

  if (!tugas) {
    return NextResponse.json({ error: 'Tugas tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json(tugas);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const { id } = await params;

  const body = await request.json();
  const validated = updateTugasSchema.parse(body);

  const existingTugas = await prisma.tugas.findUnique({ where: { id } });
  if (!existingTugas) {
    return NextResponse.json({ error: 'Tugas tidak ditemukan' }, { status: 404 });
  }

  let slug = validated.slug || existingTugas.slug;
  if (validated.slug !== existingTugas.slug) {
    let slugExists = await prisma.tugas.findUnique({ where: { slug } });
    let counter = 1;
    while (slugExists && slugExists.id !== id) {
      slug = `${slugify(validated.judul)}-${counter}`;
      slugExists = await prisma.tugas.findUnique({ where: { slug } });
      counter++;
    }
  }

  const updatedTugas = await prisma.tugas.update({
    where: { id },
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

  return NextResponse.json(updatedTugas);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const { id } = await params;

  await prisma.tugasSubmissionFile.deleteMany({
    where: { submission: { tugasId: id } },
  });
  await prisma.tugasSubmission.deleteMany({
    where: { tugasId: id },
  });
  await prisma.tugas.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
