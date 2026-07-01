import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';
import { invalidateCache } from '@/lib/cache';
import { CACHE_KEYS } from '@/lib/cache-keys';
import { z } from 'zod';

const updatePackageSchema = z.object({
  nama: z.string().min(1).optional(),
  deskripsi: z.string().min(1).optional(),
  harga: z.union([z.number().min(0), z.string().transform((val) => parseFloat(val))]).optional(),
  fiturList: z.array(z.string()).optional(),
  isPopuler: z.boolean().optional(),
  urutan: z.number().optional(),
  published: z.boolean().optional(),
});

// GET /api/admin/packages/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;
  const pkg = await prisma.package.findUnique({ where: { id } });
  if (!pkg) return NextResponse.json({ error: 'Paket tidak ditemukan' }, { status: 404 });
  return NextResponse.json({ ...pkg, harga: Number(pkg.harga) });
}

// PUT /api/admin/packages/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const body = await request.json();
  const validated = updatePackageSchema.parse(body);
  const { id } = await params;

  const pkg = await prisma.$transaction(async (tx) => {
    // If isPopuler is true, unset all other packages
    if (validated.isPopuler) {
      await tx.package.updateMany({
        where: { isPopuler: true, NOT: { id } },
        data: { isPopuler: false },
      });
    }

    const updateData: any = { ...validated };
    if (validated.harga !== undefined) {
      updateData.harga = new Prisma.Decimal(validated.harga);
    }

    return tx.package.update({
      where: { id },
      data: updateData,
    });
  });

  await invalidateCache(CACHE_KEYS.packageList());

  return NextResponse.json({ ...pkg, harga: Number(pkg.harga) });
}

// DELETE /api/admin/packages/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;

  await prisma.package.delete({
    where: { id },
  });

  await invalidateCache(CACHE_KEYS.packageList());

  return NextResponse.json({ message: 'Package dihapus' });
}
