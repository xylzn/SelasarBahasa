import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import KelasForm from '@/components/admin/forms/KelasForm';

export default async function EditKelasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const kelas = await prisma.kelas.findUnique({ where: { id } });
  if (!kelas) notFound();

  return (
    <KelasForm
      kelasId={kelas.id}
      initialData={{
        nama: kelas.nama,
        tipe: kelas.tipe,
        tingkat: kelas.tingkat,
        status: kelas.status,
        minKuota: kelas.minKuota,
      }}
    />
  );
}
