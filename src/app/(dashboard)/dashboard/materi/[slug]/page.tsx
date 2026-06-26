import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import VideoEmbed from '@/components/materi/VideoEmbed';

export default async function MateriDetailPage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role || 'USER';
  const isPremium = userRole === 'ADMIN' || userRole === 'PREMIUM';

  const materi = await prisma.materi.findUnique({
    where: { slug: params.slug, published: true },
  });

  if (!materi) {
    notFound();
  }

  if (materi.isPremium && !isPremium) {
    return (
      <div className="p-8">
        <div className="max-w-3xl mx-auto text-center py-16">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Materi Premium</h1>
          <p className="text-gray-600 mb-6">
            Materi ini hanya tersedia untuk pengguna premium. Hubungi kami untuk informasi lebih lanjut.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{materi.judul}</h1>
          {materi.isPremium && (
            <span className="inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
              Premium
            </span>
          )}
        </header>

        {materi.videoUrl && materi.videoProvider && (
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
