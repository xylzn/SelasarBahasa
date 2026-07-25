import Link from 'next/link';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { BookOpen, PlayCircle, ClipboardList } from 'lucide-react';
import { parseTingkatSlug, canAccessTingkat, tipeToDisplay, tingkatToDisplay, generateTingkatSlug } from '@/lib/access';
import { notFound, redirect } from 'next/navigation';

export default async function TingkatDetailPage({ params }: { params: Promise<{ tingkatSlug: string }> }) {
  const session = await auth();
  const { tingkatSlug } = await params;
  const userId = session?.user?.id;
  const isAdmin = session?.user?.role === 'ADMIN';

  // Parse slug
  const parsed = parseTingkatSlug(tingkatSlug);
  if (!parsed) {
    notFound();
  }

  const { tipeKelas, tingkatBIPA } = parsed;

  // Check access
  if (!isAdmin && userId) {
    const hasAccess = await canAccessTingkat(userId, tipeKelas, tingkatBIPA);
    if (!hasAccess) {
      redirect('/dashboard/kelas');
    }
  }

  // Helper to build where clause: if tipeKelas is PRIVAT, include both PRIVAT and REGULER
  const buildWhereClause = (baseWhere: any) => {
    if (tipeKelas === 'PRIVAT') {
      return {
        ...baseWhere,
        OR: [{ tipeKelas: 'PRIVAT' }, { tipeKelas: 'REGULER' }],
      };
    }
    return {
      ...baseWhere,
      tipeKelas,
    };
  };

  // Count materi, video, tugas for this tipe + tingkat
  const [jumlahTeks, jumlahVideo, jumlahTugas] = await Promise.all([
    prisma.materi.count({
      where: buildWhereClause({
        tingkatBIPA,
        tipe: 'TEKS',
        published: true,
      }),
    }),
    prisma.materi.count({
      where: buildWhereClause({
        tingkatBIPA,
        tipe: 'VIDEO',
        published: true,
      }),
    }),
    prisma.tugas.count({
      where: buildWhereClause({
        tingkatBIPA,
        published: true,
      }),
    }),
  ]);

  const displayTipe = tipeToDisplay(tipeKelas);
  const displayTingkat = tingkatToDisplay(tingkatBIPA);

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href="/dashboard/kelas" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
          ← Kembali ke Pilih Kelas
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{displayTipe} — {displayTingkat}</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Materi Teks */}
        <Link href={`/dashboard/kelas/${tingkatSlug}/materi`}>
          <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition cursor-pointer">
            <div className="text-4xl mb-4">
              <BookOpen className="text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Materi</h2>
            <p className="text-gray-600 mb-4">Baca materi pembelajaran</p>
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {jumlahTeks} Materi
              </span>
              <span className="text-blue-600">Lihat →</span>
            </div>
          </div>
        </Link>

        {/* Modul Video */}
        <Link href={`/dashboard/kelas/${tingkatSlug}/video`}>
          <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition cursor-pointer">
            <div className="text-4xl mb-4">
              <PlayCircle className="text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Video</h2>
            <p className="text-gray-600 mb-4">Tonton video pembelajaran</p>
            <div className="flex items-center gap-2">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {jumlahVideo} Video
              </span>
              <span className="text-green-600">Lihat →</span>
            </div>
          </div>
        </Link>

        {/* Tugas */}
        <Link href={`/dashboard/kelas/${tingkatSlug}/tugas`}>
          <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition cursor-pointer">
            <div className="text-4xl mb-4">
              <ClipboardList className="text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Tugas</h2>
            <p className="text-gray-600 mb-4">Kerjakan tugas pembelajaran</p>
            <div className="flex items-center gap-2">
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                {jumlahTugas} Tugas
              </span>
              <span className="text-purple-600">Lihat →</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
