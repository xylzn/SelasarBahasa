import prisma from '@/lib/prisma';
import AktivitasKitaClient from '@/components/public/AktivitasKitaClient';

export const revalidate = 3600;

export const metadata = {
  title: 'Aktivitas Kita — SelasarBahasa',
  description: 'Dokumentasi kegiatan dan aktivitas belajar bersama SelasarBahasa.',
};

export default async function AktivitasKitaPage() {
  const items = await prisma.aktivitasKita.findMany({
    orderBy: { createdAt: 'desc' },
    include: { media: true },
  });

  const serialized = items.map((it) => ({
    id: it.id,
    judul: it.judul,
    deskripsi: it.deskripsi ?? '',
    createdAt: it.createdAt.toISOString(),
    media: it.media.map((m) => ({ id: m.id, tipe: m.tipe, url: m.url })),
  }));

  return <AktivitasKitaClient items={serialized} />;
}
