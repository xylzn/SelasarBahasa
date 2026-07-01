import prisma from '@/lib/prisma';
import UserTableClient from '@/components/admin/UserTableClient';

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

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Kelola Pengguna</h1>
          <p className="text-gray-600">Lihat dan kelola pengguna platform.</p>
        </div>
      </div>

      <UserTableClient users={users} />
    </div>
  );
}
