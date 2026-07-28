import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';
import { z } from 'zod';
import { invalidateCachePattern, invalidateCache } from '@/lib/cache';
import { CACHE_KEYS } from '@/lib/cache-keys';
import { deleteFile } from '@/lib/supabase-storage';

// Helper slugify
function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

// GET /api/materi/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const { id } = await params;

  const materi = await prisma.materi.findUnique({
    where: { id },
  });

  if (!materi) {
    return NextResponse.json({ error: 'Materi tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json(materi);
}

// PUT /api/materi/[id]
const updateMateriSchema = z.object({
  judul: z.string().min(1).optional(),
  slug: z.string().optional(),
  tipe: z.enum(['TEKS', 'VIDEO']).optional(),
  tipeKelas: z.enum(['REGULER', 'PRIVAT', 'ANAK_REMAJA']).optional(),
  tingkatBIPA: z.enum(['BIPA_1', 'BIPA_2', 'BIPA_3', 'BIPA_4', 'BIPA_5', 'BIPA_6']).optional(),
  pdfUrl: z.string().optional().nullable(),
  videoUrl: z.string().optional().nullable(),
  videoProvider: z.enum(['YOUTUBE', 'VIMEO']).optional().nullable(),
  deskripsi: z.string().optional().nullable(),
  urutan: z.number().optional(),
  published: z.boolean().optional(),
  sumberDokumen: z.enum(['LINK', 'UPLOAD']).optional().nullable(),
});

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
  const validated = updateMateriSchema.parse(body);

  const oldMateri = await prisma.materi.findUnique({ where: { id } });
  if (!oldMateri) {
    return NextResponse.json({ error: 'Materi tidak ditemukan' }, { status: 404 });
  }

  if (validated.pdfUrl !== undefined && oldMateri.pdfUrl && validated.pdfUrl !== oldMateri.pdfUrl) {
    try {
      const r = await deleteFile(oldMateri.pdfUrl, 'materi-files');
      if ('error' in r) console.error('storage: delete materi PDF:', r.error);
    } catch (e) { console.error('storage: delete materi PDF:', e); }
  }

  // Generate slug if not provided
  let dataToUpdate = { ...validated };
  if (!validated.slug) {
    const tipeKelas = validated.tipeKelas || oldMateri.tipeKelas;
    const tingkatBIPA = validated.tingkatBIPA || oldMateri.tingkatBIPA;
    const judul = validated.judul || oldMateri.judul;
    const tipe = validated.tipe || oldMateri.tipe;

    // Handle case where tipeKelas or tingkatBIPA might be null (fall back to old slug)
    if (!tipeKelas || !tingkatBIPA) {
      dataToUpdate.slug = oldMateri.slug;
    } else {
      const kelasTingkatSlug = `${tipeKelas.toLowerCase().replace('_', '-')}-${tingkatBIPA.toLowerCase().replace('_', '-')}`;
      const judulSlug = slugify(judul);
      const jenisMateriSlug = tipe === 'VIDEO' ? 'vid' : 'teks';
      let newSlug = `${kelasTingkatSlug}-${judulSlug}-${jenisMateriSlug}`;

      // Check uniqueness
      let slugExists = await prisma.materi.findUnique({ where: { slug: newSlug } });
      let counter = 1;
      while (slugExists && slugExists.id !== id) {
        newSlug = `${kelasTingkatSlug}-${judulSlug}-${jenisMateriSlug}-${counter}`;
        slugExists = await prisma.materi.findUnique({ where: { slug: newSlug } });
        counter++;
      }
      dataToUpdate.slug = newSlug;
    }
  }

  const materi = await prisma.materi.update({
    where: { id },
    data: dataToUpdate,
  });

  // Invalidate cache
  await invalidateCachePattern('materi:list:*');
  await invalidateCache(CACHE_KEYS.materiCount());
  if (oldMateri?.slug) await invalidateCache(CACHE_KEYS.materiDetail(oldMateri.slug));
  if (materi.slug && materi.slug !== oldMateri?.slug) await invalidateCache(CACHE_KEYS.materiDetail(materi.slug));

  return NextResponse.json(materi);
}

// DELETE /api/materi/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const { id } = await params;

  const oldMateri = await prisma.materi.findUnique({ where: { id } });
  if (oldMateri?.pdfUrl) {
    try {
      const r = await deleteFile(oldMateri.pdfUrl, 'materi-files');
      if ('error' in r) console.error('storage: delete materi PDF:', r.error);
    } catch (e) { console.error('storage: delete materi PDF:', e); }
  }

  await prisma.materi.delete({
    where: { id },
  });

  // Invalidate cache
  await invalidateCachePattern('materi:list:*');
  await invalidateCache(CACHE_KEYS.materiCount());
  if (oldMateri?.slug) await invalidateCache(CACHE_KEYS.materiDetail(oldMateri.slug));

  return NextResponse.json({ success: true });
}
