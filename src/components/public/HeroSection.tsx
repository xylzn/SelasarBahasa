'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SafeImage from '@/components/shared/SafeImage';
import { Book, Globe, Award, MessageCircle, ChevronLeft, ChevronRight, Camera, Play } from 'lucide-react';
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

type AktivitasMedia = {
  id: string;
  url: string;
  tipe: 'FOTO' | 'VIDEO';
};

type Aktivitas = {
  id: string;
  judul: string;
  deskripsi: string;
  media: AktivitasMedia[];
  createdAt: Date;
};

type Slide = {
  id: string;
  type: 'aktivitas' | 'artikel' | 'video';
  data: any;
};

const AUTO_ADVANCE_MS = 5000;
const HARDCODED_VIDEO_URL = 'https://www.youtube.com/watch?v=xZNwe3qp6fA&t=940s';

export default function HeroSection({
  totalUsers,
  articles,
  aktivitas,
}: {
  totalUsers: number;
  articles: Article[];
  aktivitas: Aktivitas[];
}) {
  const { t, locale } = useLocale();

  // Build slides
  const slides: Slide[] = [
    ...aktivitas.map((a) => ({ id: `aktivitas-${a.id}`, type: 'aktivitas' as const, data: a })),
    ...articles.slice(0, 2).map((a) => ({ id: `artikel-${a.id}`, type: 'artikel' as const, data: a })),
    { id: 'video-hardcoded', type: 'video' as const, data: { url: HARDCODED_VIDEO_URL } },
  ];

  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userInteractedVideoRef = useRef(false);

  const total = slides.length;
  const slide = slides[current];

  const goTo = useCallback(
    (index: number) => {
      setCurrent(((index % total) + total) % total);
    },
    [total]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Auto-advance — tapi KALAU di slide VIDEO, jangan auto slide sama sekali.
  // Plus kalo user pernah ngeklik area video, autoplay dimatikan permanen di slide VIDEO.
  useEffect(() => {
    if (total <= 1) return;
    if (slide.type === 'video') return; // do not start timer on video slides
    timerRef.current = setTimeout(next, AUTO_ADVANCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, next, total, slide.type]);

  // Pause on hover / focus
  const pauseTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };
  const resumeTimer = () => {
    if (total <= 1) return;
    if (slide.type === 'video') return; // Jangan nyalain timer kalo di video slide.
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(next, AUTO_ADVANCE_MS);
  };

  // Function to get YouTube embed URL (iframe polos, controls=1, pasti ada tombol play).
  const getYouTubeEmbedUrl = (url: string) => {
    let videoId = '';
    const m1 = url.match(/youtube\.com\/watch\?v=([^&]+)/);
    const m2 = url.match(/youtu\.be\/([^?]+)/);
    const m3 = url.match(/youtube\.com\/embed\/([^?]+)/);
    const m4 = url.match(/youtube\.com\/shorts\/([^?]+)/);
    videoId = m1?.[1] || m2?.[1] || m3?.[1] || m4?.[1] || '';
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?controls=1&modestbranding=1&rel=0&playsinline=1`;
    }
    return url;
  };

  const handleVideoSlideClick = () => {
    // Kalo user klik area video -> pastiin timer mati.
    userInteractedVideoRef.current = true;
    pauseTimer();
  };

  return (
    <section className="relative bg-white overflow-hidden py-16 md:py-24">
      {/* Decorative blobs — very subtle, behind illustration */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-blue-light rounded-full blur-3xl opacity-40 -translate-y-1/4 translate-x-1/4 pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 right-1/4 w-72 h-72 bg-brand-orange-light rounded-full blur-3xl opacity-50 translate-y-1/4 pointer-events-none"
      />

      {/* Floating Icons — soft teal/orange on white bg */}
      <div
        className="absolute top-16 left-8 text-brand-blue/10 hidden lg:block animate-bounce"
        style={{ animationDuration: '3s' }}
      >
        <Book size={52} />
      </div>
      <div
        className="absolute bottom-16 left-16 text-brand-orange/10 hidden lg:block animate-bounce"
        style={{ animationDuration: '5s' }}
      >
        <MessageCircle size={56} />
      </div>
      <div className="absolute top-1/3 left-4 text-brand-blue/5 hidden lg:block">
        <Award size={68} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Mobile: stack illustration on top, then text below */}
        {/* Desktop: 2-column — text left 55%, illustration right 45% */}
        <div className="flex flex-col md:flex-row md:items-center md:gap-12 lg:gap-16">
          {/* LEFT — Text content */}
          <div className="md:w-[50%] text-center md:text-left mt-8 md:mt-0">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {t('hero.title1')}{' '}
              <span className="text-brand-blue font-extrabold">{t('hero.title2')}</span>{' '}
              {t('hero.title3')}{' '}
              <span className="text-brand-orange font-extrabold">{t('hero.title4')}</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-500 mb-8 max-w-xl mx-auto md:mx-0 leading-relaxed">
              {t('hero.subtitle')}
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center mb-10">
              <Link
                href="/register"
                className="w-full sm:w-auto bg-brand-blue text-white px-8 py-3.5 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-brand-blue/30 hover:bg-brand-blue/90 transition text-center"
              >
                {t('hero.ctaRegister')}
              </Link>
              <Link
                href="/artikel"
                className="w-full sm:w-auto bg-white text-brand-blue border-2 border-brand-blue px-8 py-3.5 rounded-2xl text-lg font-semibold hover:bg-brand-blue-light transition text-center"
              >
                {t('hero.ctaArticles')}
              </Link>
            </div>

            {/* Learner badge */}
            <div className="inline-flex items-center gap-3 bg-brand-blue-light border border-brand-blue/20 rounded-full px-4 py-2">
              {/* Mini avatar stack */}
              <div className="flex -space-x-2">
                {['bg-brand-blue', 'bg-brand-orange', 'bg-brand-blue-dark', 'bg-brand-orange-dark'].map(
                  (c, i) => (
                    <div
                      key={i}
                      className={`w-7 h-7 rounded-full ${c} border-2 border-white flex items-center justify-center text-white text-xs font-bold`}
                      aria-hidden="true"
                    >
                      {['A', 'B', 'C', 'D'][i]}
                    </div>
                  )
                )}
              </div>
              <p className="text-brand-blue-dark text-sm font-medium">
                {t('hero.usersJoined', {
                  count: totalUsers.toLocaleString(
                    locale === 'id' ? 'id-ID' : locale === 'de' ? 'de-DE' : 'en-US'
                  ),
                })}
              </p>
            </div>
          </div>

          {/* RIGHT — Slider */}
          <div className="md:w-[50%] flex justify-center relative">
            {/* Subtle ring behind illustration */}
            <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
              <div className="w-72 h-72 md:w-96 md:h-96 rounded-full border-2 border-brand-blue/10" />
            </div>
            <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
              <div className="w-52 h-52 md:w-72 md:h-72 rounded-full bg-brand-blue-light/50" />
            </div>

            {/* Globe floating icon on illustration side */}
            <div
              className="absolute top-4 right-4 text-brand-orange/20 hidden md:block animate-bounce"
              style={{ animationDuration: '4s' }}
            >
              <Globe size={48} />
            </div>

            {/* Slider */}
            {slides.length > 0 && (
              <div
                className="relative w-full max-w-md md:max-w-lg"
                onMouseEnter={pauseTimer}
                onMouseLeave={resumeTimer}
                onFocus={pauseTimer}
                onBlur={resumeTimer}
              >
                {/* Slide content */}
                <div className="overflow-hidden rounded-2xl shadow-lg border border-brand-blue-light/40 bg-white">
                  {/* Aktivitas Slide */}
                  {slide.type === 'aktivitas' && (
                    <div key={slide.id} className="animate-fade-in">
                      {slide.data.media[0] && slide.data.media[0].tipe === 'FOTO' ? (
                        <div className="relative w-full h-64 md:h-72">
                          <SafeImage
                            src={slide.data.media[0].url}
                            alt={slide.data.judul}
                            fill
                            className="object-cover"
                            placeholderClassName="absolute inset-0 bg-brand-blue-light"
                          />
                        </div>
                      ) : slide.data.media[0] ? (
                        <div className="relative w-full aspect-video">
                          <iframe
                            src={getYouTubeEmbedUrl(slide.data.media[0].url)}
                            className="w-full h-full"
                            title={slide.data.judul}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            frameBorder="0"
                          />
                        </div>
                      ) : (
                        <div className="relative w-full h-64 md:h-72 flex items-center justify-center bg-brand-blue-light">
                          <Camera size={64} className="text-brand-blue/40" />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-brand-orange text-white text-xs font-semibold rounded-full px-3 py-1 shadow flex items-center gap-1">
                            {slide.data.media[0]?.tipe === 'FOTO' ? <Camera size={12} /> : <Play size={12} />}
                            Aktivitas
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(slide.data.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{slide.data.judul}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">{slide.data.deskripsi}</p>
                      </div>
                    </div>
                  )}

                  {/* Artikel Slide */}
                  {slide.type === 'artikel' && (
                    <div key={slide.id} className="animate-fade-in">
                      <div className="relative w-full h-64 md:h-72 bg-brand-blue-light/30">
                        {slide.data.thumbnailUrl ? (
                          <SafeImage
                            src={slide.data.thumbnailUrl}
                            alt={slide.data.judul}
                            fill
                            className="object-cover"
                            placeholderClassName="absolute inset-0 bg-brand-blue-light/30"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Book size={64} className="text-brand-blue/20" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {slide.data.kategori && (
                            <span className="bg-brand-blue text-white text-xs font-semibold rounded-full px-3 py-1 shadow flex items-center gap-1">
                              <Book size={12} />
                              {slide.data.kategori}
                            </span>
                          )}
                          {slide.data.publishedAt && (
                            <span className="text-xs text-gray-400">
                              {new Date(slide.data.publishedAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{slide.data.judul}</h3>
                        {slide.data.ringkasan && (
                          <p className="text-sm text-gray-500 line-clamp-2">{slide.data.ringkasan}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Video Slide - IFRAME POLOS, controls=1 (PASTI ADA PLAY BUTTON) */}
                  {slide.type === 'video' && (
                    <div key={slide.id} className="animate-fade-in" onClickCapture={handleVideoSlideClick}>
                      <div className="relative w-full aspect-video bg-black">
                        <iframe
                          src={getYouTubeEmbedUrl(slide.data.url)}
                          className="w-full h-full"
                          title={t('publicPages.heroSection.videoTitle')}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          frameBorder="0"
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-red-600 text-white text-xs font-semibold rounded-full px-3 py-1 shadow flex items-center gap-1">
                            <Play size={12} />
                            Video
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{t('publicPages.heroSection.watchVideo')}</h3>
                        <p className="text-sm text-gray-500">
                          Pelajari bahasa Indonesia dengan cara yang menyenangkan!
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Prev / Next — only if more than 1 slide */}
                {total > 1 && (
                  <>
                    <button
                      onClick={prev}
                      aria-label={t('publicPages.heroSection.prevSlide')}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 border border-gray-200 shadow-sm rounded-full p-2 hover:bg-brand-blue-light transition"
                    >
                      <ChevronLeft size={18} className="text-brand-blue" />
                    </button>
                    <button
                      onClick={next}
                      aria-label={t('publicPages.heroSection.nextSlide')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 border border-gray-200 shadow-sm rounded-full p-2 hover:bg-brand-blue-light transition"
                    >
                      <ChevronRight size={18} className="text-brand-blue" />
                    </button>
                  </>
                )}

                {/* Dots indicator */}
                {total > 1 && (
                  <div className="flex justify-center gap-2 mt-3" role="tablist" aria-label={t('publicPages.heroSection.navLabel')}>
                    {slides.map((_, i) => (
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
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
