import prisma from '@/lib/prisma';
import DataTable from '@/components/admin/DataTable';

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      nama: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const columns = [
    { key: 'nama', header: 'Nama' },
    { key: 'email', header: 'Email' },
    {
      key: 'role',
      header: 'Peran',
      render: (role: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
          role === 'PREMIUM' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {role.toLowerCase()}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Bergabung',
      render: (date: Date) => new Date(date).toLocaleDateString('id-ID'),
    },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Kelola Pengguna</h1>
          <p className="text-gray-600">Lihat dan kelola pengguna platform.</p>
        </div>
      </div>
      <DataTable columns={columns} data={users} />
    </div>
  );
}
