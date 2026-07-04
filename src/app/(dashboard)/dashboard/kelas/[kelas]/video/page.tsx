import Link from 'next/link';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import MateriCard from '@/components/materi/MateriCard';
import { hasActivePremiumAccess } from '@/lib/access';

export default async function VideoListPage({ params }: { params: Promise<{ kelas: string }> }) {
  const session = await auth();
  const userCanAccessPremium = hasActivePremiumAccess({
    role: session?.user?.role || 'USER',
    premiumExpiresAt: session?.user?.premiumExpiresAt ? new Date(session.user.premiumExpiresAt) : null,
  });
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
      published: true,
    },
    orderBy: { urutan: 'asc' }
  });

  // Get user's progress
  const userId = session?.user?.id;
  const userProgress = userId
    ? await prisma.materiProgress.findMany({
        where: { userId },
        select: { materiId: true },
      })
    : [];

  const completedMateriIds = new Set(userProgress.map(p => p.materiId));
  const completedCount = videos.filter(m => completedMateriIds.has(m.id)).length;
  const totalCount = videos.length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href={`/dashboard/kelas/${kelasSlug}`} className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
          ← Kembali ke {kelasDisplay}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Modul Video {kelasDisplay}</h1>
        <div className="flex items-center gap-2 text-gray-600">
          <span>
            {completedCount} dari {totalCount} video selesai
          </span>
          {totalCount > 0 && (
            <div className="flex-1 max-w-md bg-gray-200 rounded-full h-2 ml-4">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>
      
      {totalCount === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">Belum ada video untuk kelas ini.</p>
        </div>
      )}
      
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
            isCompleted={completedMateriIds.has(video.id)}
          />
        ))}
      </div>
    </div>
  );
}
