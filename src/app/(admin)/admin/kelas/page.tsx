import Link from 'next/link';
import prisma from '@/lib/prisma';
import KelasTableClient from '@/components/admin/KelasTableClient';

export default async function AdminKelasPage() {
  const kelasList = await prisma.kelas.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { enrollments: true } } },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Manajemen Kelas</h1>
          <p className="text-gray-500 text-sm">Kelola batch/angkatan kelas BIPA.</p>
        </div>
        <Link href="/admin/kelas/create"
          className="bg-brand-blue text-white px-6 py-3 rounded-lg hover:bg-brand-blue/90 transition font-medium text-sm">
          + Tambah Kelas
        </Link>
      </div>
      <KelasTableClient kelasList={kelasList} />
    </div>
  );
}
