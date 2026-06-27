import Link from 'next/link';
import prisma from '@/lib/prisma';
import DataTable from '@/components/admin/DataTable';

export default async function AdminMateriPage() {
  const materiList = await prisma.materi.findMany({
    orderBy: { urutan: 'asc' },
  });

  const columns = [
    { key: 'judul', header: 'Judul' },
    { key: 'slug', header: 'Slug' },
    {
      key: 'tipe',
      header: 'Tipe',
      render: (tipe: string) => tipe.toLowerCase(),
    },
    {
      key: 'isPremium',
      header: 'Premium',
      render: (isPremium: boolean) => (
        <span className={isPremium ? 'text-yellow-600' : 'text-gray-500'}>
          {isPremium ? 'Ya' : 'Tidak'}
        </span>
      ),
    },
    {
      key: 'published',
      header: 'Status',
      render: (published: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {published ? 'Terbit' : 'Draft'}
        </span>
      ),
    },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Kelola Materi</h1>
          <p className="text-gray-600">Tambah, edit, atau hapus materi.</p>
        </div>
        <Link
          href="/admin/materi/create"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          + Tambah Materi
        </Link>
      </div>
      <DataTable columns={columns} data={materiList} />
    </div>
  );
}
