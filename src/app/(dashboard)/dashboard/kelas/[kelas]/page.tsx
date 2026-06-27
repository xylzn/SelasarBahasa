import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { BookOpen, PlayCircle } from 'lucide-react';

const validKelas = ['dasar', 'menengah', 'lanjutan'] as const;
type ValidKelas = (typeof validKelas)[number];

const mapKelas = (kelas: string): ValidKelas => {
  const k = kelas.toLowerCase() as ValidKelas;
  if (validKelas.includes(k)) return k;
  throw new Error('Invalid kelas');
};

export default async function KelasDetailPage({ params }: { params: { kelas: string } }) {
  try {
    const kelas = mapKelas(params.kelas);
    
    if (kelas !== 'dasar') {
      notFound();
    }

    const [jumlahTeks, jumlahVideo] = await Promise.all([
      prisma.materi.count({
        where: { kelas: 'DASAR', tipe: 'TEKS', published: true }
      }),
      prisma.materi.count({
        where: { kelas: 'DASAR', tipe: 'VIDEO', published: true }
      })
    ]);

    return (
      <div className="p-8">
        <div className="mb-8">
          <Link href="/dashboard/kelas" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← Kembali ke Pilih Kelas
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Kelas Dasar</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Materi Teks */}
          <Link href="/dashboard/kelas/dasar/materi">
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition cursor-pointer">
              <div className="text-4xl mb-4">
                <BookOpen className="text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Materi</h2>
              <p className="text-gray-600 mb-4">Baca materi pembelajaran dalam bentuk teks</p>
              <div className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {jumlahTeks} Materi
                </span>
                <span className="text-blue-600">Lihat Materi →</span>
              </div>
            </div>
          </Link>

          {/* Modul Video */}
          <Link href="/dashboard/kelas/dasar/video">
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition cursor-pointer">
              <div className="text-4xl mb-4">
                <PlayCircle className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Modul Video</h2>
              <p className="text-gray-600 mb-4">Tonton video pembelajaran</p>
              <div className="flex items-center gap-2">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {jumlahVideo} Video
                </span>
                <span className="text-green-600">Lihat Video →</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    );
  } catch {
    notFound();
  }
}
