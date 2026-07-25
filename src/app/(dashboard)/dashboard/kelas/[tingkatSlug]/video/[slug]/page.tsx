import Link from 'next/link';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import VideoEmbed from '@/components/materi/VideoEmbed';
import { getCached } from '@/lib/cache';
import { CACHE_KEYS } from '@/lib/cache-keys';
import { canAccessContent } from '@/lib/access';
import MarkCompleteButton from '@/components/materi/MarkCompleteButton';

export default async function VideoMateriPage({ params }: { params: Promise<{ tingkatSlug: string; slug: string }> }) {
  const session = await auth();
  const { tingkatSlug, slug } = await params;
  const userId = session?.user?.id;
  const isAdmin = session?.user?.role === 'ADMIN';

  const materi = await getCached(CACHE_KEYS.materiDetail(slug), 1800, async () =>
    prisma.materi.findUnique({ where: { slug, published: true } })
  );
  if (!materi) return notFound();

  if (!isAdmin) {
    if (!userId) return notFound();
    const allowed = await canAccessContent(userId, {
      tipeKelas: materi.tipeKelas ?? null,
      tingkatBIPA: materi.tingkatBIPA ?? null,
    });
    if (!allowed) {
      return (
        <div className="p-8">
          <Link href={`/dashboard/kelas/${tingkatSlug}/video`} className="text-brand-blue hover:text-brand-blue/80 mb-4 inline-block text-sm">
            ← Kembali ke Video
          </Link>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center mt-8">
            <p className="text-amber-800 font-medium">Kamu tidak memiliki akses ke video ini.</p>
            <p className="text-amber-600 text-sm mt-1">Video ini bukan bagian dari kelasmu.</p>
          </div>
        </div>
      );
    }
  }

  const isCompleted = userId
    ? await prisma.materiProgress.findUnique({
        where: { userId_materiId: { userId, materiId: materi.id } },
      }) !== null
    : false;

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href={`/dashboard/kelas/${tingkatSlug}/video`} className="text-brand-blue hover:text-brand-blue/80 mb-4 inline-block text-sm">
          ← Kembali ke Video
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{materi.judul}</h1>
          <MarkCompleteButton materiId={materi.id} isCompleted={isCompleted} />
        </div>
      </div>

      {materi.videoUrl && materi.videoProvider ? (
        <VideoEmbed url={materi.videoUrl} provider={materi.videoProvider} />
      ) : (
        <div className="bg-gray-100 p-8 rounded-xl text-center">
          <p className="text-gray-600">Video materi ini belum tersedia.</p>
        </div>
      )}

      {materi.deskripsi && (
        <div className="mt-8 bg-gray-50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Deskripsi</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{materi.deskripsi}</p>
        </div>
      )}
    </div>
  );
}
