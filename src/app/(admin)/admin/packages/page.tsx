import Link from 'next/link';
import prisma from '@/lib/prisma';
import PackageTableClient from '@/components/admin/PackageTableClient';

export default async function AdminPackagesPage() {
  const packages = await prisma.package.findMany({
    orderBy: { urutan: 'asc' },
  });

  // Convert Decimal to number
  const packagesWithNumberHarga = packages.map((pkg) => ({
    ...pkg,
    harga: Number(pkg.harga),
  }));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Kelola Paket</h1>
          <p className="text-gray-600">Tambah, edit, atau hapus paket.</p>
        </div>
        <Link
          href="/admin/packages/create"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          + Tambah Paket
        </Link>
      </div>

      <PackageTableClient packages={packagesWithNumberHarga} />
    </div>
  );
}