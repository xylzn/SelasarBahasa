import Link from 'next/link';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { Lock } from 'lucide-react';

export default async function KelasPage() {
  const session = await auth();
  const userRole = session?.user?.role || 'USER';

  const totalMateri = await prisma.materi.count({
    where: { published: true }
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Pilih Kelas</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kelas Dasar */}
        <Link href="/dashboard/kelas/dasar">
          <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition cursor-pointer">
            <div className="text-4xl mb-4">📚</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Kelas Dasar</h2>
            <p className="text-gray-600 mb-4">Materi dasar untuk pemula</p>
            <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {totalMateri} Konten
            </div>
          </div>
        </Link>

        {/* Kelas Menengah */}
        <Link href="/dashboard/kelas/menengah">
          <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition cursor-pointer">
            <div className="text-4xl mb-4">📖</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Kelas Menengah</h2>
            <p className="text-gray-600 mb-4">Untuk tingkat menengah</p>
            <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Akses Sekarang
            </div>
          </div>
        </Link>

        {/* Kelas Lanjutan */}
        <Link href="/dashboard/kelas/lanjutan">
          <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition cursor-pointer">
            <div className="text-4xl mb-4">🎓</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Kelas Lanjutan</h2>
            <p className="text-gray-600 mb-4">Untuk tingkat lanjutan</p>
            <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Akses Sekarang
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
