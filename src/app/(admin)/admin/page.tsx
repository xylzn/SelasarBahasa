import prisma from '@/lib/prisma';
import { getCached } from '@/lib/cache';
import { CACHE_KEYS } from '@/lib/cache-keys';

export default async function AdminDashboardPage() {
  const stats = await getCached(CACHE_KEYS.adminStats(), 120, async () => {
    const [
      totalUsers,
      totalMateri,
      totalQuiz,
      totalArtikel,
      unreadMessages,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.materi.count({ where: { published: true } }),
      prisma.quiz.count({ where: { published: true } }),
      prisma.article.count({ where: { published: true } }),
      prisma.contactMessage.count({ where: { isRead: false } }),
    ]);

    return { totalUsers, totalMateri, totalQuiz, totalArtikel, unreadMessages };
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Admin</h1>
        <p className="text-gray-600">Selamat datang di panel administrasi.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Pengguna</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Materi</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalMateri}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Quiz</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalQuiz}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Artikel</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalArtikel}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Pesan Belum Dibaca</h3>
          <p className="text-3xl font-bold text-red-600">{stats.unreadMessages}</p>
        </div>
      </div>
    </div>
  );
}
