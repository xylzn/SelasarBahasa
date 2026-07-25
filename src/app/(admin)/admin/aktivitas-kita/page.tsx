import Link from 'next/link';
import prisma from '@/lib/prisma';
import DeleteButton from '@/components/admin/DeleteButton';

export default async function AdminAktivitasPage() {
  const items = await prisma.aktivitasKita.findMany({ 
    orderBy: { createdAt: 'desc' },
    include: {
      media: true,
    },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Kelola Aktivitas Kita</h1>
          <p className="text-gray-500 text-sm">Tambah foto dan video kegiatan.</p>
        </div>
        <Link
          href="/admin/aktivitas-kita/create"
          className="bg-brand-blue text-white px-6 py-3 rounded-lg hover:bg-brand-blue/90 transition font-medium text-sm"
        >
          + Tambah Aktivitas
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Judul', 'Media', 'Tanggal', 'Aksi'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.judul.length > 40 ? item.judul.slice(0, 40) + '…' : item.judul}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {item.media.length} media
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-sm flex gap-3">
                    <Link
                      href={`/admin/aktivitas-kita/edit/${item.id}`}
                      className="text-brand-blue hover:text-brand-blue/80 font-medium"
                    >
                      Edit
                    </Link>
                    <DeleteButton
                      id={item.id}
                      apiPath="/api/admin/aktivitas-kita"
                      itemName={item.judul}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
