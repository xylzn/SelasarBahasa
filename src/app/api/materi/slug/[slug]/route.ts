import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { getCached, invalidateCache, invalidateCachePattern } from '@/lib/cache';
import { CACHE_KEYS } from '@/lib/cache-keys';
import { z } from 'zod';

// GET /api/materi/slug/[slug]
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
