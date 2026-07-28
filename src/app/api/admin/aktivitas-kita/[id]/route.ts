import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { deleteFile } from '@/lib/supabase-storage';

const mediaSchema = z.object({
  url: z.string().min(1, 'URL media harus diisi'),
  tipe: z.enum(['FOTO', 'VIDEO']),
});

const schema = z.object({
  judul: z.string().min(1).optional(),
  deskripsi: z.string().min(1).optional(),
  media: z.array(mediaSchema).min(1, 'Minimal satu media harus diisi').optional(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  // Prepare data for update
  const updateData: any = {};
  if (parsed.data.judul) updateData.judul = parsed.data.judul;
  if (parsed.data.deskripsi) updateData.deskripsi = parsed.data.deskripsi;
  
  // If media is provided, replace existing media (delete FOTO storage first)
  if (parsed.data.media) {
    try {
      const oldMedia = await prisma.aktivitasMedia.findMany({
        where: { aktivitasId: id },
        select: { id: true, url: true, tipe: true },
      });
      await Promise.allSettled(
        oldMedia
          .filter((m) => m.tipe === 'FOTO')
          .map(async (m) => {
            const r = await deleteFile(m.url, 'pengumuman');
            if ('error' in r) console.error(`storage: delete aktivitas foto ${m.id}:`, r.error);
          })
      );
    } catch (e) { console.error('storage: fetch old aktivitas media:', e); }

    updateData.media = {
      deleteMany: {},
      create: parsed.data.media,
    };
  }

  const item = await prisma.aktivitasKita.update({ 
    where: { id }, 
    data: updateData,
    include: { media: true },
  });
  revalidatePath('/aktivitas-kita');
  return NextResponse.json(item);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;

  try {
    const oldMedia = await prisma.aktivitasMedia.findMany({
      where: { aktivitasId: id },
      select: { id: true, url: true, tipe: true },
    });
    await Promise.allSettled(
      oldMedia
        .filter((m) => m.tipe === 'FOTO')
        .map(async (m) => {
          const r = await deleteFile(m.url, 'pengumuman');
          if ('error' in r) console.error(`storage: delete aktivitas foto ${m.id}:`, r.error);
        })
    );
  } catch (e) { console.error('storage: fetch aktivitas media before delete:', e); }

  await prisma.aktivitasKita.delete({ where: { id } });
  revalidatePath('/aktivitas-kita');
  return NextResponse.json({ ok: true });
}
