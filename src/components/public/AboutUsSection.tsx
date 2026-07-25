'use client';

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

        <div className="max-w-3xl mx-auto space-y-5 text-gray-600 leading-relaxed text-lg reveal">
          <p>{t('aboutUs.paragraph1')}</p>
          <p>{t('aboutUs.paragraph2')}</p>
          <p>{t('aboutUs.paragraph3')}</p>

          <div className="pt-6 text-brand-blue-dark italic">
            <p>{t('aboutUs.signOff')}</p>
            <p className="font-bold mt-1 not-italic">
              {t('aboutUs.signOffName')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
