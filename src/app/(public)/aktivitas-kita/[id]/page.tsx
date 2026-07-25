import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Share2, MessageCircle, Camera, Play } from 'lucide-react';
import CopyLinkButton from '@/components/public/CopyLinkButton';
import MediaCarousel from '@/components/shared/MediaCarousel';
import SafeImage from '@/components/shared/SafeImage';
import type { Metadata } from 'next';

export const revalidate = 3600;

async function getItem(id: string) {
  const item = await prisma.aktivitasKita.findUnique({ 
    where: { id },
    include: { media: true }
  });
  if (!item) notFound();
  return item;
}

async function getRelatedActivities(id: string) {
  try {
    return await prisma.aktivitasKita.findMany({
      where: { id: { not: id } },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: { media: true },
    });
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = await getItem(id);
  const firstImage = item.media.find(m => m.tipe === 'FOTO');
  return {
    title: `${item.judul} — Aktivitas Kita | SelasarBahasa`,
    description: item.deskripsi.slice(0, 160),
    openGraph: {
      title: item.judul,
      description: item.deskripsi.slice(0, 160),
      images: firstImage ? [{ url: firstImage.url }] : [],
      type: 'article',
      publishedTime: item.createdAt.toISOString(),
      url: `https://selasarbahasa.com/aktivitas-kita/${item.id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: item.judul,
      description: item.deskripsi.slice(0, 160),
      images: firstImage ? firstImage.url : undefined,
    },
    alternates: {
      canonical: `https://selasarbahasa.com/aktivitas-kita/${item.id}`,
    },
  };
}

export default async function AktivitasDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getItem(id);
  const relatedActivities = await getRelatedActivities(id);

  const activityUrl = `https://selasarbahasa.com/aktivitas-kita/${item.id}`;
  const waText = encodeURIComponent(`${item.judul} — ${activityUrl}`);

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back button */}
        <div className="mb-6">
          <Link
            href="/aktivitas-kita"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-blue font-medium text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            Kembali ke Aktivitas
          </Link>
        </div>

        {/* 2-column layout on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Main Content */}
          <article className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

              {/* Media Carousel */}
              <div className="p-0 m-0">
                <MediaCarousel
                  media={item.media.map(m => ({ id: m.id, url: m.url, tipe: m.tipe }))}
                  altTitle={item.judul}
                  heightClass="h-64 sm:h-80 md:h-96"
                />
              </div>

              <div className="p-6 sm:p-8">
                {/* Meta bar */}
                <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
                  <span className="inline-flex items-center gap-1.5 bg-brand-blue-light text-brand-blue px-3 py-1 rounded-full font-semibold text-xs">
                    <Camera size={12} />
                    {item.media.length} media
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-gray-500 text-xs">
                    <Calendar size={12} />
                    {new Date(item.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-blue-dark leading-tight mb-5">
                  {item.judul}
                </h1>

                {/* Share buttons */}
                <div className="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                  <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                    <Share2 size={13} /> Bagikan:
                  </span>
                  <CopyLinkButton url={activityUrl} />
                  <a
                    href={`https://wa.me/?text=${waText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold transition-all"
                  >
                    <MessageCircle size={13} />
                    WhatsApp
                  </a>
                </div>

                {/* Activity body */}
                <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap">
                  {item.deskripsi}
                </div>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:sticky lg:top-24">
              <h3 className="text-base font-bold text-brand-blue-dark mb-4">Aktivitas Terkait</h3>
              {relatedActivities.length > 0 ? (
                <ul className="space-y-4">
                  {relatedActivities.map((rel) => {
                    const firstMedia = rel.media[0];
                    return (
                      <li key={rel.id}>
                        <Link href={`/aktivitas-kita/${rel.id}`} className="flex gap-3 group">
                          {firstMedia ? (
                            firstMedia.tipe === 'FOTO' ? (
                              <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden">
                                <SafeImage
                                  src={firstMedia.url}
                                  alt={rel.judul}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  placeholderClassName="w-full h-full bg-gray-100"
                                />
                              </div>
                            ) : (
                              <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-brand-blue-light flex items-center justify-center">
                                <Play size={24} className="text-brand-blue" />
                              </div>
                            )
                          ) : (
                            <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center">
                              <Camera size={24} className="text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-brand-blue transition-colors leading-snug">
                              {rel.judul}
                            </p>
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                              <Calendar size={10} />
                              {new Date(rel.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">Belum ada aktivitas terkait.</p>
              )}

              <div className="mt-5 pt-4 border-t border-gray-100">
                <Link
                  href="/aktivitas-kita"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-semibold hover:bg-brand-blue/90 transition-colors"
                >
                  Semua Aktivitas
                </Link>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
