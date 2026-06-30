import Link from 'next/link';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import MateriCard from '@/components/materi/MateriCard';

export default async function VideoListPage({ params }: { params: Promise<{ kelas: string }> }) {
  const session = await auth();
  const userRole = session?.user?.role || 'USER';
  const userCanAccessPremium = userRole === 'ADMIN' || userRole === 'PREMIUM';
  const { kelas } = await params;
  const kelasSlug = kelas.toLowerCase();
  
  let kelasEnum = 'DASAR' as 'DASAR' | 'MENENGAH' | 'LANJUTAN';
  let kelasDisplay = 'Kelas Dasar';
  if (kelasSlug === 'menengah') {
    kelasEnum = 'MENENGAH';
    kelasDisplay = 'Kelas Menengah';
  } else if (kelasSlug === 'lanjutan') {
    kelasEnum = 'LANJUTAN';
    kelasDisplay = 'Kelas Lanjutan';
  }

  const videos = await prisma.materi.findMany({
    where: {
      kelas: kelasEnum,
      tipe: 'VIDEO',
      published: true
    },
    orderBy: { urutan: 'asc' }
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href={`/dashboard/kelas/${kelasSlug}`} className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
          ← Kembali ke {kelasDisplay}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Modul Video {kelasDisplay}</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <MateriCard
            key={video.id}
            id={video.id}
            judul={video.judul}
            slug={video.slug}
            tipe={video.tipe}
            kelas={video.kelas}
            isPremium={video.isPremium}
            userCanAccess={userCanAccessPremium}
          />
        ))}
      </div>
    </div>
  );
}
