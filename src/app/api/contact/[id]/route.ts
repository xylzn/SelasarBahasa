import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';

// PATCH /api/contact/[id]
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  await requireAdmin();
  const message = await prisma.contactMessage.findUnique({
    where: { id: params.id },
  });

  if (!message) {
    return NextResponse.json({ error: 'Pesan tidak ditemukan' }, { status: 404 });
  }

  const updated = await prisma.contactMessage.update({
    where: { id: params.id },
    data: { isRead: !message.isRead },
  });

  return NextResponse.json(updated);
}

// DELETE /api/contact/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  await requireAdmin();
  await prisma.contactMessage.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ message: 'Pesan dihapus' });
}
