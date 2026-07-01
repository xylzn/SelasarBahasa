import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';
import { z } from 'zod';

// GET /api/materi/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const { id } = await params;

  const materi = await prisma.materi.findUnique({
    where: { id },
  });

  if (!materi) {
    return NextResponse.json({ error: 'Materi tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json(materi);
}

// PUT /api/materi/[id]
const updateMateriSchema = z.object({
  judul: z.string().min(1).optional(),
  slug: z.string().optional(),
  tipe: z.enum(['TEKS', 'VIDEO']).optional(),
  kelas: z.enum(['DASAR', 'MENENGAH', 'LANJUTAN']).optional(),
  pdfUrl: z.string().optional().nullable(),
  videoUrl: z.string().optional().nullable(),
  videoProvider: z.enum(['YOUTUBE', 'VIMEO']).optional().nullable(),
  isPremium: z.boolean().optional(),
  urutan: z.number().optional(),
  published: z.boolean().optional(),
  sumberDokumen: z.enum(['LINK', 'UPLOAD']).optional().nullable(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const { id } = await params;
  const body = await request.json();
  const validated = updateMateriSchema.parse(body);

  const materi = await prisma.materi.update({
    where: { id },
    data: validated,
  });

  return NextResponse.json(materi);
}

// DELETE /api/materi/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const { id } = await params;

  await prisma.materi.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
