import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';
import { z } from 'zod';
import { invalidateCachePattern, invalidateCache } from '@/lib/cache';
import { CACHE_KEYS } from '@/lib/cache-keys';
import { revalidatePath } from 'next/cache';
import { deleteFile } from '@/lib/supabase-storage';

// Helper slugify
function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

// GET /api/artikel/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const { id } = await params;

  const artikel = await prisma.article.findUnique({
    where: { id },
  });

  if (!artikel) {
    return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json(artikel);
}

// PUT /api/artikel/[id]
const updateArtikelSchema = z.object({
  judul: z.string().min(1).optional(),
  slug: z.string().optional(),
  ringkasan: z.string().max(300).optional(),
  isi: z.string().min(1).optional(),
  thumbnailUrl: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().max(160).optional(),
  ogImageUrl: z.string().optional(),
  kategori: z.string().optional(),
  published: z.boolean().optional(),
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
  const validated = updateArtikelSchema.parse(body);

  // Get current article to check published status
  const currentArtikel = await prisma.article.findUnique({ where: { id } });
  if (!currentArtikel) {
    return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 });
  }

  if (validated.thumbnailUrl !== undefined && currentArtikel.thumbnailUrl && validated.thumbnailUrl !== currentArtikel.thumbnailUrl) {
    try {
      const r = await deleteFile(currentArtikel.thumbnailUrl, 'artikel-thumbnails');
      if ('error' in r) console.error('storage: delete artikel thumbnail:', r.error);
    } catch (e) { console.error('storage: delete artikel thumbnail:', e); }
  }

  // Handle slug
  let dataToUpdate: any = { ...validated };
  
  if (validated.slug && validated.slug !== currentArtikel.slug) {
    // Check if new slug is unique
    let slugExists = await prisma.article.findUnique({ where: { slug: validated.slug } });
    let counter = 1;
    let newSlug = validated.slug;
    while (slugExists) {
      newSlug = `${validated.slug}-${counter}`;
      slugExists = await prisma.article.findUnique({ where: { slug: newSlug } });
      counter++;
    }
    dataToUpdate.slug = newSlug;
  } else if (validated.judul && !validated.slug) {
    // Auto-generate slug from judul if changed but not provided
    let newSlug = slugify(validated.judul);
    let slugExists = await prisma.article.findUnique({ where: { slug: newSlug } });
    let counter = 1;
    while (slugExists) {
      newSlug = `${slugify(validated.judul)}-${counter}`;
      slugExists = await prisma.article.findUnique({ where: { slug: newSlug } });
      counter++;
    }
    dataToUpdate.slug = newSlug;
  }

  // Handle publishedAt
  if (validated.published && !currentArtikel.published) {
    dataToUpdate.publishedAt = new Date();
  }

  const artikel = await prisma.article.update({
    where: { id },
    data: dataToUpdate,
  });

  // Invalidate article-related caches
  await Promise.all([
    invalidateCachePattern('artikel:*'),
    invalidateCache(CACHE_KEYS.topArticles()),
  ]);

  // Invalidate Next.js Full Route Cache
  revalidatePath('/artikel');
  revalidatePath(`/artikel/${artikel.slug}`);
  // Also invalidate old slug if it changed
  if (currentArtikel.slug !== artikel.slug) {
    revalidatePath(`/artikel/${currentArtikel.slug}`);
  }

  return NextResponse.json(artikel);
}

// DELETE /api/artikel/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const { id } = await params;

  // Fetch slug + thumbnail before deleting so we can revalidate the path afterwards
  const articleToDelete = await prisma.article.findUnique({ where: { id }, select: { slug: true, thumbnailUrl: true } });

  if (articleToDelete?.thumbnailUrl) {
    try {
      const r = await deleteFile(articleToDelete.thumbnailUrl, 'artikel-thumbnails');
      if ('error' in r) console.error('storage: delete artikel thumbnail:', r.error);
    } catch (e) { console.error('storage: delete artikel thumbnail:', e); }
  }

  await prisma.article.delete({
    where: { id },
  });

  // Invalidate article-related caches
  await Promise.all([
    invalidateCachePattern('artikel:*'),
    invalidateCache(CACHE_KEYS.topArticles()),
  ]);

  // Invalidate Next.js Full Route Cache
  revalidatePath('/artikel');
  if (articleToDelete) {
    revalidatePath(`/artikel/${articleToDelete.slug}`);
  }

  return NextResponse.json({ success: true });
}
