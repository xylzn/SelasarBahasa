'use client';

import Link from 'next/link';
import SafeImage from '@/components/shared/SafeImage';
import { Calendar, Tag } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';

interface Article {
  id: string;
  judul: string;
  slug: string;
  ringkasan: string;
  thumbnailUrl: string | null;
  kategori: string | null;
  publishedAt: Date | null;
}

export default function ArticleCard({ article }: { article: Article }) {
  const { locale } = useLocale();

  return (
    <Link href={`/artikel/${article.slug}`} className="block group reveal">
      <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-brand-blue-light transition-all duration-300 h-full flex flex-col">
        {article.thumbnailUrl && (
          <div className="relative h-48 w-full overflow-hidden">
            <SafeImage
              src={article.thumbnailUrl}
              alt={article.judul}
              width={400}
              height={200}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              placeholderClassName="w-full h-full bg-gray-100"
            />
          </div>
        )}
        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-4 mb-3 text-xs font-semibold text-gray-500">
              {article.kategori && (
                <span className="flex items-center gap-1 bg-brand-blue-light text-brand-blue px-2.5 py-1 rounded-lg">
                  <Tag size={12} />
                  {article.kategori}
                </span>
              )}
              {article.publishedAt && (
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(article.publishedAt).toLocaleDateString(
                    locale === 'id' ? 'id-ID' : locale === 'de' ? 'de-DE' : 'en-US',
                    {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    }
                  )}
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-brand-blue-dark mb-2 group-hover:text-brand-blue transition-colors leading-snug">
              {article.judul}
            </h3>
            <p className="text-gray-600 line-clamp-2 text-sm leading-relaxed mb-4">{article.ringkasan}</p>
          </div>
        </div>
      </article>
    </Link>
  );
}
