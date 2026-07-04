import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, requireAuth } from '@/lib/api-auth';
import { z } from 'zod';
import { getCached, invalidateCachePattern } from '@/lib/cache';
import { CACHE_KEYS } from '@/lib/cache-keys';
import { hasActivePremiumAccess } from '@/lib/access';

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
  const session = authResult.session;
  const { searchParams } = new URL(request.url);
  const kelas = searchParams.get('kelas') ?? undefined;

  const userCanAccessPremium = hasActivePremiumAccess({
    role: session.user?.role || 'USER',
    premiumExpiresAt: session.user?.premiumExpiresAt ? new Date(session.user.premiumExpiresAt) : null,
  });
  const cacheKey = CACHE_KEYS.tugasList(1, userCanAccessPremium, kelas);

  const tugas = await getCached(cacheKey, 1800, async () => {
    return prisma.tugas.findMany({
      where: {
        published: true,
        ...(!userCanAccessPremium && { isPremium: false }),
        ...(kelas && { kelas: kelas as any }),
      },
      orderBy: { urutan: 'asc' },
    });
  });

  return NextResponse.json(tugas);
}

const createTugasSchema = z.object({
  judul: z.string().min(1),
  slug: z.string().optional(),
  instruksi: z.string().min(1),
  fileInstruksiUrl: z.string().optional(),
  kelas: z.enum(['DASAR', 'MENENGAH', 'LANJUTAN']).default('DASAR'),
  isPremium: z.boolean().default(false),
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
      kelas: validated.kelas,
      isPremium: validated.isPremium,
      deadline: validated.deadline ? new Date(validated.deadline) : null,
      urutan: validated.urutan,
      published: validated.published,
    },
  });

  await invalidateCachePattern('tugas:list:*');

  return NextResponse.json(newTugas, { status: 201 });
}
