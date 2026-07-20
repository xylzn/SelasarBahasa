'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Book, Globe, Award, MessageCircle } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';

export default function HeroSection({ totalUsers }: { totalUsers: number }) {
  const { t, locale } = useLocale();

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
      <div className="absolute top-16 left-8 text-brand-blue/10 hidden lg:block animate-bounce" style={{ animationDuration: '3s' }}>
        <Book size={52} />
      </div>
      <div className="absolute bottom-16 left-16 text-brand-orange/10 hidden lg:block animate-bounce" style={{ animationDuration: '5s' }}>
        <MessageCircle size={56} />
      </div>
      <div className="absolute top-1/3 left-4 text-brand-blue/5 hidden lg:block">
        <Award size={68} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Mobile: stack illustration on top, then text below */}
        {/* Desktop: 2-column — text left 55%, illustration right 45% */}
        <div className="flex flex-col-reverse md:flex-row md:items-center md:gap-12 lg:gap-16">

          {/* LEFT — Text content */}
          <div className="md:w-[55%] text-center md:text-left mt-8 md:mt-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
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
                {['bg-brand-blue', 'bg-brand-orange', 'bg-brand-blue-dark', 'bg-brand-orange-dark'].map((c, i) => (
                  <div
                    key={i}
                    className={`w-7 h-7 rounded-full ${c} border-2 border-white flex items-center justify-center text-white text-xs font-bold`}
                    aria-hidden="true"
                  >
                    {['A', 'B', 'C', 'D'][i]}
                  </div>
                ))}
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

          {/* RIGHT — Illustration */}
          <div className="md:w-[45%] flex justify-center relative">
            {/* Subtle ring behind illustration */}
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-72 h-72 md:w-96 md:h-96 rounded-full border-2 border-brand-blue/10" />
            </div>
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-52 h-52 md:w-72 md:h-72 rounded-full bg-brand-blue-light/50" />
            </div>

            {/* Globe floating icon on illustration side */}
            <div className="absolute top-4 right-4 text-brand-orange/20 hidden md:block animate-bounce" style={{ animationDuration: '4s' }}>
              <Globe size={48} />
            </div>

            <Image
              src="/images/hero-illustration.svg"
              alt="Ilustrasi belajar bahasa online"
              width={520}
              height={420}
              className="relative z-10 w-full max-w-sm md:max-w-full drop-shadow-sm"
              priority
            />
          </div>

        </div>
      </div>
    </section>
  );
}
