import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession, requireAdmin, requireAuth } from '@/lib/api-auth';
import { getCached, invalidateCachePattern, invalidateCache } from '@/lib/cache';
import { CACHE_KEYS } from '@/lib/cache-keys';
import { z } from 'zod';

// Helper slugify
function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

// GET /api/materi
export async function GET(request: Request) {
  const session = await requireAuth();
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const isPremium = session.user?.role === 'ADMIN' || session.user?.role === 'PREMIUM';
  const cacheKey = CACHE_KEYS.materiList(page, isPremium);

  const materi = await getCached(cacheKey, 600, async () => {
    return await prisma.materi.findMany({
      where: {
        published: true,
        ...(!isPremium && { isPremium: false }),
      },
      select: {
        id: true,
        judul: true,
        slug: true,
        tipe: true,
        isPremium: true,
        urutan: true,
      },
      orderBy: { urutan: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  });

  return NextResponse.json(materi);
}

// POST /api/materi
const createMateriSchema = z.object({
  judul: z.string().min(1),
  slug: z.string().optional(),
  tipe: z.enum(['TEKS', 'VIDEO']),
  kelas: z.enum(['DASAR', 'MENENGAH', 'LANJUTAN']).default('DASAR'),
  kontenTeks: z.string().optional(),
  videoUrl: z.string().optional(),
  isPremium: z.boolean().default(false),
  urutan: z.number().default(0),
  published: z.boolean().default(true),
});

export async function POST(request: Request) {
  await requireAdmin();
  const body = await request.json();
  const validated = createMateriSchema.parse(body);

  let slug = validated.slug || slugify(validated.judul);
  
  // Check slug uniqueness
  let slugExists = await prisma.materi.findUnique({ where: { slug } });
  let counter = 1;
  while (slugExists) {
    slug = `${slugify(validated.judul)}-${counter}`;
    slugExists = await prisma.materi.findUnique({ where: { slug } });
    counter++;
  }

  let videoProvider = null;
  if (validated.videoUrl) {
    if (validated.videoUrl.includes('youtube.com') || validated.videoUrl.includes('youtu.be')) {
      videoProvider = 'YOUTUBE';
    } else if (validated.videoUrl.includes('vimeo.com')) {
      videoProvider = 'VIMEO';
    }
  }

  const materi = await prisma.materi.create({
    data: {
      ...validated,
      slug,
      videoProvider,
    },
  });

  // Invalidate cache
  await invalidateCachePattern('materi:list:*');

  return NextResponse.json(materi, { status: 201 });
}
