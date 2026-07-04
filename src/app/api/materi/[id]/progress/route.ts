import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { invalidateCache, invalidateCachePattern } from '@/lib/cache';
import { CACHE_KEYS } from '@/lib/cache-keys';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const session = authResult.session;
  const userId = session.user?.id as string;
  const { id: materiId } = await params;

  // Check if materi exists and is published
  const materi = await prisma.materi.findUnique({
    where: { id: materiId, published: true },
  });

  if (!materi) {
    return NextResponse.json({ error: 'Materi not found' }, { status: 404 });
  }

  // Upsert progress
  await prisma.materiProgress.upsert({
    where: {
      userId_materiId: {
        userId,
        materiId,
      },
    },
    update: {
      completedAt: new Date(),
    },
    create: {
      userId,
      materiId,
    },
  });

  // Invalidate caches
  if (session.user?.id) {
    await invalidateCache(CACHE_KEYS.userMateriProgress(session.user.id));
  }
  await invalidateCachePattern('materi:list:*');

  return NextResponse.json({ success: true });
}
