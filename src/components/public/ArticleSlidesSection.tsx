'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';

type Article = {
  id: string;
  judul: string;
  slug: string;
  ringkasan: string | null;
  thumbnailUrl: string | null;
  kategori: string | null;
  publishedAt: Date | null;
};

interface ArticleSlidesSectionProps {
  articles: Article[];
}

const AUTO_ADVANCE_MS = 5000;

export default function ArticleSlidesSection({ articles }: ArticleSlidesSectionProps) {
  const { t } = useLocale();
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = articles.length;

  const goTo = useCallback(
    (index: number) => {
      setCurrent(((index % total) + total) % total);
    },
    [total]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Auto-advance
  useEffect(() => {
    if (total <= 1) return;
    timerRef.current = setTimeout(next, AUTO_ADVANCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, next, total]);

  // Pause on hover / focus
  const pauseTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };
  const resumeTimer = () => {
    if (total <= 1) return;
    timerRef.current = setTimeout(next, AUTO_ADVANCE_MS);
  };

  if (!articles || articles.length === 0) return null;

  const article = articles[current];

  return (
    <section className="py-16 bg-white border-b border-brand-blue-light/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="text-center mb-8">
          <span className="inline-block bg-brand-blue-light text-brand-blue text-xs font-semibold uppercase tracking-widest rounded-full px-4 py-1.5 mb-3">
            Artikel
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t('publicPages.articleSlides.title')}</h2>
        </div>

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={pauseTimer}
          onMouseLeave={resumeTimer}
          onFocus={pauseTimer}
          onBlur={resumeTimer}
        >
          {/* Slide */}
          <div className="overflow-hidden rounded-2xl shadow-sm border border-brand-blue-light/40">
            <div
              key={article.id}
              className="flex flex-col md:flex-row min-h-[280px] md:min-h-[320px] bg-white animate-fade-in"
            >
              {/* Thumbnail */}
              <div className="relative w-full md:w-2/5 h-56 md:h-auto bg-brand-blue-light/30 flex-shrink-0 overflow-hidden rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none">
                {article.thumbnailUrl ? (
                  <Image
                    src={article.thumbnailUrl}
                    alt={article.judul}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 40vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen size={64} className="text-brand-blue/20" />
                  </div>
                )}
                {/* Kategori badge */}
                {article.kategori && (
                  <span className="absolute top-4 left-4 bg-brand-blue text-white text-xs font-semibold rounded-full px-3 py-1 shadow">
                    {article.kategori}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col justify-center p-8 md:p-12 flex-1">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight line-clamp-2">
                  {article.judul}
                </h3>
                {article.ringkasan && (
                  <p className="text-gray-500 mb-6 leading-relaxed line-clamp-3 text-base">
                    {article.ringkasan}
                  </p>
                )}
                <div className="flex items-center gap-4">
                  <Link
                    href={`/artikel/${article.slug}`}
                    className="inline-flex items-center gap-2 bg-brand-blue text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-brand-blue/90 transition text-sm"
                  >
                    Baca Selengkapnya
                    <ChevronRight size={16} />
                  </Link>
                  {article.publishedAt && (
                    <span className="text-xs text-gray-400">
                      {new Date(article.publishedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Prev / Next — only if more than 1 article */}
          {total > 1 && (
            <>
              <button
                onClick={prev}
                aria-label={t('publicPages.articleSlides.prevArticle')}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 shadow-sm rounded-full p-2 hover:bg-brand-blue-light transition"
              >
                <ChevronLeft size={20} className="text-brand-blue" />
              </button>
              <button
                onClick={next}
                aria-label={t('publicPages.articleSlides.nextArticle')}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 shadow-sm rounded-full p-2 hover:bg-brand-blue-light transition"
              >
                <ChevronRight size={20} className="text-brand-blue" />
              </button>
            </>
          )}
        </div>

        {/* Dots indicator */}
        {total > 1 && (
          <div className="flex justify-center gap-2 mt-5" role="tablist" aria-label={t('publicPages.articleSlides.navLabel')}>
            {articles.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === current}
                aria-label={`Slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-8 bg-brand-blue'
                    : 'w-2 bg-brand-blue/25 hover:bg-brand-blue/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
