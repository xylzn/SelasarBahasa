import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';
import { getCached, invalidateCache } from '@/lib/cache';
import { CACHE_KEYS } from '@/lib/cache-keys';
import { z } from 'zod';

const packageSchema = z.object({
  nama: z.string().min(1),
  deskripsi: z.string().min(1),
  harga: z.union([z.number().min(0), z.string().transform((val) => parseFloat(val))]),
  durasiBulan: z.number().int(),
  fiturList: z.array(z.string()),
  isPopuler: z.boolean().default(false),
  isActive: z.boolean().default(true),
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

  // Convert Decimal to number for client
  const packagesWithNumberHarga = packages.map((pkg) => ({
    ...pkg,
    harga: Number(pkg.harga),
  }));

  return NextResponse.json(packagesWithNumberHarga);
}

// POST /api/admin/packages
export async function POST(request: Request) {
  const authResult = await requireAdmin();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const body = await request.json();
  const validated = packageSchema.parse(body);
  
  // Filter out empty fitur
  const filteredFiturList = validated.fiturList.filter((f) => f.trim() !== '');

  const pkg = await prisma.$transaction(async (tx) => {
    // If isPopuler is true, unset all other packages
    if (validated.isPopuler) {
      await tx.package.updateMany({
        where: { isPopuler: true },
        data: { isPopuler: false },
      });
    }

    return tx.package.create({
      data: {
        ...validated,
        fiturList: filteredFiturList,
        harga: new Prisma.Decimal(validated.harga),
      },
    });
  });

  await invalidateCache(CACHE_KEYS.packageList());

  return NextResponse.json({ ...pkg, harga: Number(pkg.harga) }, { status: 201 });
}
