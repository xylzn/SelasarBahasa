import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';
import { invalidateCache } from '@/lib/cache';
import { CACHE_KEYS } from '@/lib/cache-keys';
import { z } from 'zod';

const updatePackageSchema = z.object({
  nama: z.string().min(1).optional(),
  deskripsi: z.string().min(1).optional(),
  harga: z.number().int().optional(),
  fiturList: z.array(z.string()).optional(),
  isPopuler: z.boolean().optional(),
  urutan: z.number().optional(),
  published: z.boolean().optional(),
});

// PUT /api/admin/packages/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  await requireAdmin();
  const body = await request.json();
  const validated = updatePackageSchema.parse(body);

  const pkg = await prisma.package.update({
    where: { id: params.id },
    data: validated,
  });

  await invalidateCache(CACHE_KEYS.packageList());

  return NextResponse.json(pkg);
}

// DELETE /api/admin/packages/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  await requireAdmin();
  await prisma.package.delete({
    where: { id: params.id },
  });

  await invalidateCache(CACHE_KEYS.packageList());

  return NextResponse.json({ message: 'Package dihapus' });
}
