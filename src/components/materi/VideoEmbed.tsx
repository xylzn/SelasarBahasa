'use client';

import { useEffect, useState } from 'react';
import { useLocale } from '@/components/providers/LocaleProvider';

interface VideoEmbedProps {
  url: string;
  provider: 'YOUTUBE' | 'VIMEO';
}

export default function VideoEmbed({ url, provider }: VideoEmbedProps) {
  const { t } = useLocale();
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (provider === 'YOUTUBE') {
      const videoIdMatch = url.match(
        /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([^?&]+)/
      );
      if (videoIdMatch) {
        const finalUrl = `https://www.youtube.com/embed/${videoIdMatch[1]}?controls=1&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1`;
        setEmbedUrl(finalUrl);
      } else {
        setError('Gagal mengekstrak ID video YouTube. Pastikan link kamu benar!');
      }
    } else if (provider === 'VIMEO') {
      const videoIdMatch = url.match(/vimeo\.com\/(\d+)/);
      if (videoIdMatch) {
        const finalUrl = `https://player.vimeo.com/video/${videoIdMatch[1]}`;
        setEmbedUrl(finalUrl);
      } else {
        setError('Gagal mengekstrak ID video Vimeo. Pastikan link kamu benar!');
      }
    }
  }, [url, provider]);

  if (error) {
    return (
      <div className="aspect-video w-full rounded-xl bg-red-50 border border-red-200 flex items-center justify-center p-6 text-center">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  if (!embedUrl) {
    return (
      <div className="aspect-video w-full rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center">
        <p className="text-gray-500">{t('materi.videoEmbed.loading')}</p>
      </div>
    );
  }

  return (
    <div
      className="aspect-video w-full rounded-xl overflow-hidden select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      <iframe
        src={embedUrl}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        className="w-full h-full"
        title={t('materi.videoEmbed.iframeTitle')}
        allowFullScreen
      />
    </div>
  );
}
