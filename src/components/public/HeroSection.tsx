'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Book, Globe, Award, MessageCircle } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';

export default function HeroSection({ totalUsers }: { totalUsers: number }) {
  const { t, locale } = useLocale();

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-16">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1920&q=80"
          alt="Orang belajar bahasa"
          fill
          className="object-cover"
          priority
        />
        {/* Modern Rich Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue-dark/95 via-brand-blue/80 to-brand-orange-dark/40" />
      </div>

      {/* Decorative Organic Blurs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-brand-blue-light/10 rounded-full blur-3xl pointer-events-none hidden lg:block animate-pulse" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-orange-light/10 rounded-full blur-3xl pointer-events-none hidden lg:block animate-pulse duration-5000" />

      {/* Floating Icons */}
      <div className="absolute top-12 left-12 text-white/10 hidden lg:block animate-bounce duration-3000">
        <Book size={56} />
      </div>
      <div className="absolute bottom-16 right-16 text-white/10 hidden lg:block animate-bounce duration-5000">
        <Globe size={56} />
      </div>
      <div className="absolute top-1/3 right-12 text-white/5 hidden lg:block">
        <Award size={72} />
      </div>
      <div className="absolute bottom-24 left-16 text-white/5 hidden lg:block">
        <MessageCircle size={64} />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 z-10 text-center">
        {/* Glassmorphic Container Card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-8 md:p-12 rounded-3xl shadow-2xl reveal">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {t('hero.title1')}{' '}
            <span className="text-brand-orange font-extrabold">{t('hero.title2')}</span>{' '}
            {t('hero.title3')}{' '}
            <span className="text-brand-orange font-extrabold">{t('hero.title4')}</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-50 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-brand-orange text-white px-8 py-3.5 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-brand-orange/30 btn-orange-animate hover:bg-brand-orange/90 text-center"
            >
              {t('hero.ctaRegister')}
            </Link>
            <Link
              href="/artikel"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-3.5 rounded-2xl text-lg font-semibold border border-white/30 btn-animate text-center"
            >
              {t('hero.ctaArticles')}
            </Link>
          </div>
          <div className="mt-10 border-t border-white/10 pt-6">
            <p className="text-blue-200 text-sm font-medium">
              {t('hero.usersJoined', {
                count: totalUsers.toLocaleString(locale === 'id' ? 'id-ID' : locale === 'de' ? 'de-DE' : 'en-US'),
              })}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
