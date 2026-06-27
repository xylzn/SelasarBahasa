import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { getCached, invalidateCache, invalidateCachePattern } from '@/lib/cache';
import { CACHE_KEYS } from '@/lib/cache-keys';
import { z } from 'zod';

// GET /api/materi/[slug]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await requireAuth();
  const { slug } = await params;

  const cacheKey = CACHE_KEYS.materiDetail(slug);

  const materi = await getCached(cacheKey, 1800, async () => {
    return await prisma.materi.findUnique({
      where: { slug, published: true },
    });
  });

  if (!materi) {
    return NextResponse.json({ error: 'Materi tidak ditemukan' }, { status: 404 });
  }

  const isPremium = session.user?.role === 'ADMIN' || session.user?.role === 'PREMIUM';
  if (materi.isPremium && !isPremium) {
    return NextResponse.json(
      { error: 'Materi ini membutuhkan akses premium' },
      { status: 403 }
    );
  }

  return NextResponse.json(materi);
}

// PUT /api/materi/[slug]
const updateMateriSchema = z.object({
  judul: z.string().min(1).optional(),
  slug: z.string().optional(),
  tipe: z.enum(['TEKS', 'VIDEO']).optional(),
  kontenTeks: z.string().optional(),
  videoUrl: z.string().optional(),
  isPremium: z.boolean().optional(),
  urutan: z.number().optional(),
  published: z.boolean().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  await requireAuth();
  const body = await request.json();
  const validated = updateMateriSchema.parse(body);
  const { slug } = await params;

  let videoProvider = null;
  if (validated.videoUrl) {
    if (validated.videoUrl.includes('youtube.com') || validated.videoUrl.includes('youtu.be')) {
      videoProvider = 'YOUTUBE';
    } else if (validated.videoUrl.includes('vimeo.com')) {
      videoProvider = 'VIMEO';
    }
  }

  const materi = await prisma.materi.update({
    where: { slug },
    data: {
      ...validated,
      videoProvider,
    },
  });

  // Invalidate cache
  await invalidateCachePattern('materi:list:*');
  await invalidateCache(CACHE_KEYS.materiDetail(slug));

  return NextResponse.json(materi);
}

// DELETE /api/materi/[slug]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  await requireAuth();
  const { slug } = await params;

  await prisma.materi.delete({ where: { slug } });

  // Invalidate cache
  await invalidateCachePattern('materi:list:*');
  await invalidateCache(CACHE_KEYS.materiDetail(slug));

  return NextResponse.json({ message: 'Materi dihapus' });
}
