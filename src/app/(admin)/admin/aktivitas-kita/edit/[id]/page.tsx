import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import AktivitasForm from '@/components/admin/forms/AktivitasForm';

export default async function EditAktivitasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await prisma.aktivitasKita.findUnique({ 
    where: { id },
    include: { media: true }
  });
  if (!item) notFound();

  return (
    <AktivitasForm
      itemId={item.id}
      initialData={{
        judul: item.judul,
        deskripsi: item.deskripsi,
        media: item.media.map(m => ({ url: m.url, tipe: m.tipe })),
      }}
    />
  );
}
