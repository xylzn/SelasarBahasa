import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';
import { getCached, invalidateCache } from '@/lib/cache';
import { CACHE_KEYS } from '@/lib/cache-keys';
import { z } from 'zod';

const packageSchema = z.object({
  nama: z.string().min(1),
  deskripsi: z.string().min(1),
  harga: z.number().int(),
  fiturList: z.array(z.string()),
  isPopuler: z.boolean().default(false),
  urutan: z.number().default(0),
  published: z.boolean().default(true),
});

// GET /api/admin/packages
export async function GET() {
  const cacheKey = CACHE_KEYS.packageList();
  
  const packages = await getCached(cacheKey, 600, async () => {
    return await prisma.package.findMany({
      where: { published: true },
      orderBy: { urutan: 'asc' },
    });
  });

  return NextResponse.json(packages);
}

// POST /api/admin/packages
export async function POST(request: Request) {
  await requireAdmin();
  const body = await request.json();
  const validated = packageSchema.parse(body);

  const pkg = await prisma.package.create({
    data: validated,
  });

  await invalidateCache(CACHE_KEYS.packageList());

  return NextResponse.json(pkg, { status: 201 });
}
