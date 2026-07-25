'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Camera, Play } from 'lucide-react';
import SafeImage from './SafeImage';
import { useLocale } from '@/components/providers/LocaleProvider';

interface MediaItem {
  id?: string;
  url: string;
  tipe: 'FOTO' | 'VIDEO';
}

function getYouTubeEmbedUrl(url: string) {
  let videoId = '';
  const match1 = url.match(/youtube\.com\/watch\?v=([^&]+)/);
  const match2 = url.match(/youtu\.be\/([^?]+)/);
  if (match1) videoId = match1[1];
  else if (match2) videoId = match2[1];
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?controls=0&modestbranding=1&rel=0&disablekb=1`;
  }
  return url;
}

export default function MediaCarousel({
  media,
  altTitle,
  heightClass = 'h-64 sm:h-80 md:h-96',
}: {
  media: MediaItem[];
  altTitle: string;
  heightClass?: string;
}) {
  const { t } = useLocale();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!media || media.length === 0) {
    return (
      <div className={`relative w-full ${heightClass} bg-brand-blue-light flex items-center justify-center rounded-2xl`}>
        <Camera size={64} className="text-brand-blue/40" />
      </div>
    );
  }

  if (media.length === 1) {
    const single = media[0];
    return (
      <div className={`relative w-full ${heightClass} overflow-hidden rounded-2xl`}>
        {single.tipe === 'FOTO' ? (
          <SafeImage
            src={single.url}
            alt={altTitle}
            fill
            className="object-cover"
            placeholderClassName="absolute inset-0 bg-brand-blue-light"
            priority
          />
        ) : (
          <div className="aspect-video w-full h-full bg-black" onContextMenu={(e) => e.preventDefault()}>
            <iframe
              src={getYouTubeEmbedUrl(single.url)}
              className="w-full h-full"
              title={altTitle}
              allowFullScreen
            />
          </div>
        )}
      </div>
    );
  }

  const goPrev = () => setCurrentIndex((i) => (i - 1 + media.length) % media.length);
  const goNext = () => setCurrentIndex((i) => (i + 1) % media.length);
  const current = media[currentIndex];

  return (
    <div className="relative">
      {/* Slide container */}
      <div className={`relative w-full ${heightClass} overflow-hidden rounded-2xl`}>
        {/* Slides */}
        <div
          className="flex transition-transform duration-500 ease-out h-full w-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {media.map((item, index) => (
            <div
              key={item.id ?? index}
              className="w-full h-full flex-shrink-0 relative"
            >
              {item.tipe === 'FOTO' ? (
                <SafeImage
                  src={item.url}
                  alt={altTitle}
                  fill
                  className="object-cover"
                  placeholderClassName="absolute inset-0 bg-brand-blue-light"
                  priority={index === 0}
                />
              ) : (
                <div className="aspect-video w-full h-full bg-black" onContextMenu={(e) => e.preventDefault()}>
                  <iframe
                    src={getYouTubeEmbedUrl(item.url)}
                    className="w-full h-full"
                    title={altTitle}
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Prev/Next buttons */}
        <button
          type="button"
          onClick={goPrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center text-brand-blue-dark hover:text-brand-blue transition-all z-10"
          aria-label={t('shared.mediaCarousel.prev')}
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          onClick={goNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center text-brand-blue-dark hover:text-brand-blue transition-all z-10"
          aria-label={t('shared.mediaCarousel.next')}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Dots indicator */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {media.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'w-8 bg-brand-blue'
                : 'w-2 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
