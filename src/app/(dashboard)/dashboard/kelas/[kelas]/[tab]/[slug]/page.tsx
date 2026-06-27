import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import VideoEmbed from '@/components/materi/VideoEmbed';

const validKelas = ['dasar', 'menengah', 'lanjutan'] as const;
const validTabs = ['materi', 'video'] as const;

export default async function MateriDetailPage({
  params,
}: {
  params: { kelas: string; tab: string; slug: string };
}) {
  const session = await auth();
  const userRole = session?.user?.role || 'USER';
  const userCanAccessPremium = userRole === 'ADMIN' || userRole === 'PREMIUM';

  if (!validKelas.includes(params.kelas as any) || !validTabs.includes(params.tab as any)) {
    notFound();
  }

  const materi = await prisma.materi.findUnique({
    where: { slug: params.slug, published: true },
  });

  if (!materi) {
    notFound();
  }

  if (materi.isPremium && !userCanAccessPremium) {
    return (
      <div className="p-8">
        <div className="max-w-3xl mx-auto text-center py-16">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Konten Premium</h1>
          <p className="text-gray-600 mb-6">
            Materi ini hanya tersedia untuk pengguna premium. Hubungi kami untuk informasi lebih lanjut.
          </p>
          <Link href="/#packages" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Lihat Paket Premium
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href={`/dashboard/kelas/${params.kelas}/${params.tab}`}
          className="text-blue-600 hover:text-blue-700 mb-6 inline-block"
        >
          ← Kembali
        </Link>

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{materi.judul}</h1>
          {materi.isPremium && (
            <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
              Premium
            </span>
          )}
        </header>

        {materi.tipe === 'VIDEO' && materi.videoUrl && materi.videoProvider && (
          <div className="mb-8">
            <VideoEmbed url={materi.videoUrl} provider={materi.videoProvider} />
          </div>
        )}

        {materi.kontenTeks && (
          <div
            className="prose prose-lg max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: materi.kontenTeks }}
          />
        )}
      </div>
    </div>
  );
}
