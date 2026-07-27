'use client';

import Link from 'next/link';
import { useLocale } from '@/components/providers/LocaleProvider';

export default function AboutUsSection() {
  const { t } = useLocale();

  return (
    <section className="py-24" id="tentang-kami">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 reveal">
          <span className="inline-block bg-brand-blue-light text-brand-blue text-xs font-semibold uppercase tracking-widest rounded-full px-4 py-1.5 mb-4">
            {t('aboutUs.eyebrow')}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-brand-blue-dark mb-4">
            {t('aboutUs.title')}
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-10 text-gray-600 leading-relaxed text-lg reveal text-center">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-brand-blue mb-4">
              {t('aboutUs.storyHeading')}
            </h3>
            <div className="space-y-5">
              <p>{t('aboutUs.paragraph1')}</p>
              <p>{t('aboutUs.paragraph2Short')}</p>
            </div>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold text-brand-blue mb-4">
              {t('aboutUs.founderHeading')}
            </h3>
            <p>{t('aboutUs.founderIntro')}</p>
          </div>

          <Link
            href="/about-us"
            className="inline-block mt-4 px-8 py-3 bg-brand-blue text-white rounded-xl font-semibold hover:bg-brand-blue-dark transition-all btn-animate"
          >
            {t('aboutUs.ctaButton')}
          </Link>
        </div>
      </div>
    </section>
  );
}
