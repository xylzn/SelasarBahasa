import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { getCached, invalidateCache, invalidateCachePattern } from '@/lib/cache';
import { CACHE_KEYS } from '@/lib/cache-keys';
import { z } from 'zod';
import { canAccessContent } from '@/lib/access';

// GET /api/materi/slug/[slug]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const session = authResult.session;
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

  const userId = session.user?.id as string;
  const allowed = session.user?.role === 'ADMIN'
    ? true
    : await canAccessContent(userId, { tipeKelas: materi.tipeKelas ?? null, tingkatBIPA: materi.tingkatBIPA ?? null });

  if (!allowed) {
    return NextResponse.json({ error: 'Kamu tidak memiliki akses ke materi ini.' }, { status: 403 });
  }

  return NextResponse.json(materi);
}
