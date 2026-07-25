import Link from 'next/link';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import MateriCard from '@/components/materi/MateriCard';
import { parseTingkatSlug, canAccessTingkat } from '@/lib/access';
import { notFound, redirect } from 'next/navigation';

export default async function VideoListPage({ params }: { params: Promise<{ tingkatSlug: string }> }) {
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

  // Filter video: if tipeKelas is PRIVAT, include both PRIVAT and REGULER
  const whereClause: any = {
    tipe: 'VIDEO',
    published: true,
    tingkatBIPA,
  };

  if (tipeKelas === 'PRIVAT') {
    whereClause.OR = [{ tipeKelas: 'PRIVAT' }, { tipeKelas: 'REGULER' }];
  } else {
    whereClause.tipeKelas = tipeKelas;
  }

  const videos = await prisma.materi.findMany({
    where: whereClause,
    orderBy: { urutan: 'asc' },
  });

  const userProgress = userId
    ? await prisma.materiProgress.findMany({ where: { userId }, select: { materiId: true } })
    : [];
  const completedIds = new Set(userProgress.map(p => p.materiId));
  const completedCount = videos.filter(v => completedIds.has(v.id)).length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href={`/dashboard/kelas/${tingkatSlug}`} className="text-brand-blue hover:text-brand-blue/80 mb-4 inline-block text-sm">
          ← Kembali ke Kelas
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Modul Video</h1>
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <span>{completedCount} dari {videos.length} video selesai</span>
          {videos.length > 0 && (
            <div className="flex-1 max-w-md bg-gray-200 rounded-full h-2 ml-4">
              <div className="bg-brand-blue h-2 rounded-full transition-all" style={{ width: `${(completedCount / videos.length) * 100}%` }} />
            </div>
          )}
        </div>
      </div>

      {videos.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">Belum ada video untuk kelasmu.</p>
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
            kelas={video.tipeKelas ?? ''}
            tingkatSlug={tingkatSlug}
            isCompleted={completedIds.has(video.id)}
            tipeKelas={video.tipeKelas ?? ''}
          />
        ))}
      </div>
    </div>
  );
}
