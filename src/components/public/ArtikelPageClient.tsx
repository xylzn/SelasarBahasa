'use client';

import Link from 'next/link';
import SafeImage from '@/components/shared/SafeImage';
import ArticleCard from '@/components/public/ArticleCard';
import { Calendar, ArrowRight } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import { formatDate } from '@/lib/i18n-format';

interface Article {
  id: string;
  judul: string;
  slug: string;
  ringkasan: string;
  thumbnailUrl: string | null;
  coverUrl: string | null;
  kategori: string | null;
  publishedAt: string | null;
}

interface ArtikelPageClientProps {
  articles: Article[];
  categories: string[];
  activeCategory: string | null;
}

export default function ArtikelPageClient({
  articles,
  categories,
  activeCategory,
}: ArtikelPageClientProps) {
  const { t, locale } = useLocale();
  const featured = !activeCategory ? (articles[0] ?? null) : null;
  const gridArticles = !activeCategory ? articles.slice(1) : articles;

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-brand-blue-dark mb-3">{t('publicPages.artikel.title')}</h1>
          <p className="text-gray-500 text-lg">{t('publicPages.artikel.subtitle')}</p>
        </div>

        {/* Category Filter Pills */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            <Link
              href="/artikel"
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                !activeCategory
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-blue hover:text-brand-blue'
              }`}
            >
              {t('publicPages.artikel.allCategories')}
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/artikel?kategori=${encodeURIComponent(cat)}`}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-brand-blue text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-blue hover:text-brand-blue'
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        )}

        {/* Empty state */}
        {articles.length === 0 && (
          <div className="text-center py-24">
            <p className="text-gray-400 text-lg">
              {activeCategory
                ? t('publicPages.artikel.emptyCategory', { kategori: activeCategory })
                : t('publicPages.artikel.emptyAll')}
            </p>
            {activeCategory && (
              <Link href="/artikel" className="mt-4 inline-block text-brand-blue font-semibold hover:underline">
                {t('publicPages.artikel.viewAllArticles')}
              </Link>
            )}
          </div>
        )}

        {/* Featured Post — only shown when not filtering */}
        {featured && (
          <Link href={`/artikel/${featured.slug}`} className="block group mb-12">
            <div className="relative w-full h-72 sm:h-96 lg:h-[480px] rounded-3xl overflow-hidden shadow-lg">
              {featured.coverUrl || featured.thumbnailUrl ? (
                <SafeImage
                  src={(featured.coverUrl || featured.thumbnailUrl) as string}
                  alt={featured.judul}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  placeholderClassName="absolute inset-0 bg-gradient-to-br from-brand-blue to-brand-blue-dark"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue to-brand-blue-dark" />
              )}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="bg-brand-orange text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    {t('publicPages.artikel.featured')}
                  </span>
                  {featured.kategori && (
                    <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {featured.kategori}
                    </span>
                  )}
                  {featured.publishedAt && (
                    <span className="flex items-center gap-1 text-white/70 text-xs">
                      <Calendar size={12} />
                      {formatDate(featured.publishedAt, locale)}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-2 group-hover:text-brand-orange/90 transition-colors line-clamp-2">
                  {featured.judul}
                </h2>
                <p className="text-white/80 text-sm sm:text-base line-clamp-2 max-w-2xl mb-4">
                  {featured.ringkasan}
                </p>
                <span className="inline-flex items-center gap-2 text-brand-orange font-semibold text-sm group-hover:gap-3 transition-all">
                  {t('publicPages.artikel.readMore')} <ArrowRight size={16} />
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* Articles grid */}
        {gridArticles.length > 0 && (
          <>
            <h2 className="text-xl font-bold text-brand-blue-dark mb-6">
              {activeCategory
                ? t('publicPages.artikel.categoryTitle', { kategori: activeCategory })
                : t('publicPages.artikel.latest')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gridArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
