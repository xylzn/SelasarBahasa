'use client';

import Link from 'next/link';
import SafeImage from '@/components/shared/SafeImage';
import { Calendar, Play, Camera } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import { formatDate } from '@/lib/i18n-format';

interface MediaItem {
  id: string;
  tipe: 'FOTO' | 'VIDEO';
  url: string;
}

interface AktivitasItem {
  id: string;
  judul: string;
  deskripsi: string;
  createdAt: string;
  media: MediaItem[];
}

interface AktivitasKitaClientProps {
  items: AktivitasItem[];
}

export default function AktivitasKitaClient({ items }: AktivitasKitaClientProps) {
  const { t, locale } = useLocale();

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-brand-blue-dark mb-3">{t('publicPages.aktivitasKita.title')}</h1>
          <p className="text-gray-500 text-lg">{t('publicPages.aktivitasKita.subtitle')}</p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24 text-gray-400">{t('publicPages.aktivitasKita.empty')}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => {
              const firstMedia = item.media[0];
              return (
                <Link
                  key={item.id}
                  href={`/aktivitas-kita/${item.id}`}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Thumbnail */}
                  <div className="relative w-full h-52 bg-brand-blue-light">
                    {firstMedia ? (
                      firstMedia.tipe === 'FOTO' ? (
                        <SafeImage
                          src={firstMedia.url}
                          alt={item.judul}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          placeholderClassName="absolute inset-0 bg-brand-blue-light"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-brand-blue-dark/80">
                          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                            <Play size={28} className="text-white ml-1" />
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Camera size={48} className="text-brand-blue/20" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 bg-brand-blue text-white text-xs font-semibold rounded-full px-3 py-1">
                      {t('publicPages.aktivitasKita.mediaCount', { count: item.media.length })}
                    </span>
                  </div>

                  <div className="p-5">
                    <h2 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-brand-blue transition-colors">
                      {item.judul}
                    </h2>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{item.deskripsi}</p>
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                      <Calendar size={12} />
                      {formatDate(item.createdAt, locale)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
