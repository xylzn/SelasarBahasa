import Link from 'next/link';
import prisma from '@/lib/prisma';
import TugasTableClient from '@/components/admin/TugasTableClient';

export default async function AdminTugasPage() {
  const tugasList = await prisma.tugas.findMany({
    include: { _count: { select: { submissions: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Kelola Tugas</h1>
          <p className="text-gray-600">Tambah, edit, atau hapus tugas.</p>
        </div>
        <Link
          href="/admin/tugas/create"
          className="bg-brand-blue text-white px-6 py-3 rounded-lg hover:bg-brand-blue/90 transition font-medium"
        >
          + Tambah Tugas
        </Link>
      </div>

      <TugasTableClient tugasList={tugasList as any} />
    </div>
  );
}
