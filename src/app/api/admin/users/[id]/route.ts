import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';
import { sendAccountDeletedEmail } from '@/lib/email';
import { z } from 'zod';

const updateUserSchema = z.object({
  nama: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(['STUDENT', 'ADMIN']).optional(),
  bio: z.string().max(160).optional().nullable(),
  negara: z.string().max(50).optional().nullable(),
  instansi: z.string().max(100).optional().nullable(),
});

// PUT /api/admin/users/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
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
      bio: true,
      negara: true,
      instansi: true,
      fotoProfil: true,
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
  const authResult = await requireAdmin();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const { id } = await params;

  const userToDelete = await prisma.user.findUnique({
    where: { id },
    select: { email: true, nama: true },
  });

  if (!userToDelete) {
    return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
  }

  await prisma.user.delete({ where: { id } });

  sendAccountDeletedEmail(userToDelete.email, userToDelete.nama, 'admin').catch((err) => {
    console.error('Gagal kirim email notifikasi delete:', err);
  });

  return NextResponse.json({ message: 'User dihapus' });
}
