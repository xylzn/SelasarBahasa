import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const mediaSchema = z.object({
  url: z.string().min(1, 'URL media harus diisi'),
  tipe: z.enum(['FOTO', 'VIDEO']),
});

const schema = z.object({
  judul: z.string().min(1, 'Judul harus diisi'),
  deskripsi: z.string().min(1, 'Deskripsi harus diisi'),
  media: z.array(mediaSchema).min(1, 'Minimal satu media harus diisi'),
});

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const item = await prisma.aktivitasKita.create({
    data: {
      judul: parsed.data.judul,
      deskripsi: parsed.data.deskripsi,
      media: {
        create: parsed.data.media,
      },
    },
    include: { media: true },
  });
  revalidatePath('/aktivitas-kita');
  return NextResponse.json(item, { status: 201 });
}
