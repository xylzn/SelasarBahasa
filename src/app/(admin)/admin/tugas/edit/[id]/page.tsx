import Link from 'next/link';
import prisma from '@/lib/prisma';
import TugasForm from '@/components/admin/forms/TugasForm';
import { notFound } from 'next/navigation';

export default async function EditTugasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const tugas = await prisma.tugas.findUnique({
    where: { id },
  });

  if (!tugas) return notFound();

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href="/admin/tugas" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
          ← Kembali ke Daftar Tugas
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Tugas</h1>
      </div>
      <TugasForm initialData={tugas} />
    </div>
  );
}
