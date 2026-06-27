import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';
import { z } from 'zod';

const updateUserSchema = z.object({
  nama: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(['USER', 'PREMIUM', 'ADMIN']).optional(),
});

// PUT /api/admin/users/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const body = await request.json();
  const validated = updateUserSchema.parse(body);
  const { id } = await params;

  const user = await prisma.user.update({
    where: { id },
    data: validated,
    select: {
      id: true,
      nama: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user);
}

// DELETE /api/admin/users/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;

  await prisma.user.delete({
    where: { id },
  });

  return NextResponse.json({ message: 'User dihapus' });
}
