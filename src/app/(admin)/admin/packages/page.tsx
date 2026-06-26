import Link from 'next/link';
import prisma from '@/lib/prisma';
import DataTable from '@/components/admin/DataTable';

export default async function AdminPackagesPage() {
  const packages = await prisma.package.findMany({
    orderBy: { urutan: 'asc' },
  });

  const columns = [
    { key: 'nama', header: 'Nama' },
    {
      key: 'harga',
      header: 'Harga',
      render: (harga: number) => `Rp ${harga.toLocaleString('id-ID')}`,
    },
    {
      key: 'isPopuler',
      header: 'Populer',
      render: (isPopuler: boolean) => (
        <span className={isPopuler ? 'text-yellow-600' : 'text-gray-500'}>
          {isPopuler ? 'Ya' : 'Tidak'}
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Kelola Paket</h1>
          <p className="text-gray-600">Tambah, edit, atau hapus paket.</p>
        </div>
        <Link
          href="#"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          + Tambah Paket
        </Link>
      </div>
      <DataTable columns={columns} data={packages} />
    </div>
  );
}
