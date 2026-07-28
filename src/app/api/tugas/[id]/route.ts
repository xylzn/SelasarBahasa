import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, requireAuth } from '@/lib/api-auth';
import { canReadContent } from '@/lib/access';
import { z } from 'zod';
import { invalidateCachePattern, invalidateCache } from '@/lib/cache';
import { CACHE_KEYS } from '@/lib/cache-keys';
import { deleteFile } from '@/lib/supabase-storage';

const updateTugasSchema = z.object({
  judul: z.string().min(1).optional(),
  slug: z.string().optional(),
  instruksi: z.string().min(1).optional(),
  fileInstruksiUrl: z.string().optional().nullable(),
  tipeKelas: z.enum(['REGULER', 'PRIVAT', 'ANAK_REMAJA']).optional(),
  tingkatBIPA: z.enum(['BIPA_1', 'BIPA_2', 'BIPA_3', 'BIPA_4', 'BIPA_5', 'BIPA_6']).optional(),
  deadline: z.string().optional().nullable(),
  urutan: z.number().optional(),
  published: z.boolean().optional(),
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
  const user = authResult.session.user!;
  const { id } = await params;

  // Enrollment gate: read access requires ACTIVE or COMPLETED
  if (user.role !== 'ADMIN') {
    const allowed = await canReadContent(user.id as string);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Kamu harus terdaftar dan aktif di kelas untuk mengakses tugas ini.' },
        { status: 403 }
      );
    }
  }

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

  if (validated.fileInstruksiUrl !== undefined && existingTugas.fileInstruksiUrl && validated.fileInstruksiUrl !== existingTugas.fileInstruksiUrl) {
    try {
      const r = await deleteFile(existingTugas.fileInstruksiUrl, 'tugas-files');
      if ('error' in r) console.error('storage: delete tugas instruksi:', r.error);
    } catch (e) { console.error('storage: delete tugas instruksi:', e); }
  }

  let slug = validated.slug || existingTugas.slug;
  if (validated.slug !== existingTugas.slug) {
    let slugExists = await prisma.tugas.findUnique({ where: { slug } });
    let counter = 1;
    const baseSlug = validated.judul ? slugify(validated.judul) : existingTugas.slug;
    while (slugExists && slugExists.id !== id) {
      slug = `${baseSlug}-${counter}`;
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
      tipeKelas: validated.tipeKelas,
      tingkatBIPA: validated.tingkatBIPA,
      deadline: validated.deadline ? new Date(validated.deadline) : null,
      urutan: validated.urutan,
      published: validated.published,
    },
  });

  await invalidateCachePattern('tugas:list:*');
  if (existingTugas?.slug) await invalidateCache(CACHE_KEYS.tugasDetail(existingTugas.slug));
  if (updatedTugas.slug && updatedTugas.slug !== existingTugas?.slug) await invalidateCache(CACHE_KEYS.tugasDetail(updatedTugas.slug));

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

  const existingTugas = await prisma.tugas.findUnique({ where: { id } });

  // 1. Hapus semua submission file storage untuk tugas ini
  try {
    const allFiles = await prisma.tugasSubmissionFile.findMany({
      where: { submission: { tugasId: id } },
      select: { id: true, fileUrl: true },
    });
    await Promise.allSettled(
      allFiles.map(async (f) => {
        const r = await deleteFile(f.fileUrl, 'tugas-files');
        if ('error' in r) console.error(`storage: delete submission file ${f.id}:`, r.error);
      })
    );
  } catch (e) { console.error('storage: fetch submission files:', e); }

  // 2. Hapus file instruksi tugas
  if (existingTugas?.fileInstruksiUrl) {
    try {
      const r = await deleteFile(existingTugas.fileInstruksiUrl, 'tugas-files');
      if ('error' in r) console.error('storage: delete tugas instruksi:', r.error);
    } catch (e) { console.error('storage: delete tugas instruksi:', e); }
  }

  await prisma.tugasSubmissionFile.deleteMany({
    where: { submission: { tugasId: id } },
  });
  await prisma.tugasSubmission.deleteMany({
    where: { tugasId: id },
  });
  await prisma.tugas.delete({
    where: { id },
  });

  await invalidateCachePattern('tugas:list:*');
  if (existingTugas?.slug) await invalidateCache(CACHE_KEYS.tugasDetail(existingTugas.slug));

  return NextResponse.json({ success: true });
}
