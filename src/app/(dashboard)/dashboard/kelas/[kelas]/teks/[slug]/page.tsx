import Link from 'next/link';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { PremiumLockModal } from '@/components/shared/PremiumLockModal';
import { getCached } from '@/lib/cache';
import { CACHE_KEYS } from '@/lib/cache-keys';
import { hasActivePremiumAccess } from '@/lib/access';
import MarkCompleteButton from '@/components/materi/MarkCompleteButton';

export default async function TeksMateriPage({ params }: { params: Promise<{ kelas: string; slug: string }> }) {
  const session = await auth();
  const { kelas, slug } = await params;
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

  const materi = await getCached(CACHE_KEYS.materiDetail(slug), 1800, async () => {
    return prisma.materi.findUnique({
      where: { slug, published: true },
    });
  });

  if (!materi) return notFound();

  const userCanAccessPremium = hasActivePremiumAccess({
    role: session?.user?.role || 'USER',
    premiumExpiresAt: session?.user?.premiumExpiresAt ? new Date(session.user.premiumExpiresAt) : null,
  });

  if (materi.isPremium && !userCanAccessPremium) {
    return (
      <div className="p-8">
        <Link href={`/dashboard/kelas/${kelasSlug}/materi`} className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
          ← Kembali ke Materi {kelasDisplay}
        </Link>
        <PremiumLockModal open={true} onOpenChange={() => {}} />
      </div>
    );
  }

  // Check if user has completed this materi
  const isCompleted = session?.user?.id
    ? await prisma.materiProgress.findUnique({
        where: {
          userId_materiId: {
            userId: session.user.id,
            materiId: materi.id,
          },
        },
      }) !== null
    : false;

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href={`/dashboard/kelas/${kelasSlug}/materi`} className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
          ← Kembali ke Materi {kelasDisplay}
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{materi.judul}</h1>
          <MarkCompleteButton materiId={materi.id} isCompleted={isCompleted} />
        </div>
      </div>
      
      {materi.pdfUrl ? (
        <div className="aspect-video w-full rounded-xl overflow-hidden border border-gray-200">
          <iframe 
            src={materi.pdfUrl} 
            className="w-full h-full"
            title={materi.judul}
          />
        </div>
      ) : (
        <div className="bg-gray-100 p-8 rounded-xl text-center">
          <p className="text-gray-600">Materi teks ini belum tersedia</p>
        </div>
      )}
    </div>
  );
}
