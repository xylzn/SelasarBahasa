import Link from 'next/link';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import MateriCard from '@/components/materi/MateriCard';
import { getCached } from '@/lib/cache';
import { CACHE_KEYS } from '@/lib/cache-keys';
import { hasActivePremiumAccess } from '@/lib/access';

export default async function MateriListPage({ params }: { params: Promise<{ kelas: string }> }) {
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

  const materis = await getCached(CACHE_KEYS.materiListByKelas(kelasEnum, userCanAccessPremium, 'TEKS'), 1800, async () => {
    return prisma.materi.findMany({
      where: {
        kelas: kelasEnum,
        tipe: 'TEKS',
        published: true,
        ...(!userCanAccessPremium && { isPremium: false }),
      },
      orderBy: { urutan: 'asc' }
    });
  });

  // Get user's progress
  const userId = session?.user?.id;
  const userProgress = userId
    ? await getCached(CACHE_KEYS.userMateriProgress(userId), 60, async () => {
        return prisma.materiProgress.findMany({
          where: { userId },
          select: { materiId: true },
        });
      })
    : [];

  const completedMateriIds = new Set(userProgress.map(p => p.materiId));
  const completedCount = materis.filter(m => completedMateriIds.has(m.id)).length;
  const totalCount = materis.length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href={`/dashboard/kelas/${kelasSlug}`} className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
          ← Kembali ke {kelasDisplay}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Materi {kelasDisplay}</h1>
        <div className="flex items-center gap-2 text-gray-600">
          <span>
            {completedCount} dari {totalCount} materi selesai
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materis.map((materi) => (
          <MateriCard
            key={materi.id}
            id={materi.id}
            judul={materi.judul}
            slug={materi.slug}
            tipe={materi.tipe}
            kelas={materi.kelas}
            isPremium={materi.isPremium}
            userCanAccess={userCanAccessPremium}
            isCompleted={completedMateriIds.has(materi.id)}
          />
        ))}
      </div>
    </div>
  );
}
