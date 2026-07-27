'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';

const FOUNDER_PHOTO_PATH = '/images/brand/ellis-artyana.jpg';

export default function AboutUsPageClient() {
  const { t } = useLocale();
  const highlights = t('publicPages.aboutUsPage.founderHighlights', undefined, true) as string[];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-brand-blue-light via-brand-blue-light/60 to-white pt-20 pb-20 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-white border border-brand-blue/20 text-brand-blue rounded-full text-xs font-bold uppercase tracking-widest mb-5 shadow-sm">
            {t('publicPages.aboutUsPage.heroEyebrow')}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-blue-dark mb-5 leading-tight">
            {t('publicPages.aboutUsPage.heroTitle')}
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            {t('publicPages.aboutUsPage.metaDescription')}
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-1.5 bg-brand-blue rounded-full" />
            <h2 className="text-2xl md:text-3xl font-bold text-brand-blue-dark">
              {t('publicPages.aboutUsPage.storyHeading')}
            </h2>
          </div>
          <div className="space-y-5 text-gray-700 leading-relaxed text-base md:text-lg text-left">
            <p>{t('publicPages.aboutUsPage.storyParagraph1')}</p>
            <p>{t('publicPages.aboutUsPage.storyParagraph2')}</p>
          </div>
        </div>
      </section>

      {/* Meet Our Founder */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-stone-100/60 border-t border-b border-stone-200/70">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <div className="h-10 w-1.5 bg-brand-blue rounded-full" />
            <h2 className="text-2xl md:text-3xl font-bold text-brand-blue-dark">
              {t('publicPages.aboutUsPage.founderHeading')}
            </h2>
          </div>

          {/* Persona-style 2-card grid */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 lg:gap-8">
            {/* LEFT CARD: Foto + biodata rows */}
            <div className="lg:col-span-4 bg-white rounded-3xl shadow-sm border border-stone-200/70 overflow-hidden flex flex-col">
              {/* Foto full-width atas */}
              <div className="relative w-full aspect-[4/5] bg-gradient-to-br from-brand-blue-light via-white to-white">
                <Image
                  src={FOUNDER_PHOTO_PATH}
                  alt={t('publicPages.aboutUsPage.founderPhotoAlt')}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Biodata rows */}
              <div className="p-6 sm:p-8 space-y-5">
                <div className="grid grid-cols-[100px_1fr] gap-x-3 gap-y-4 text-left">
                  <div>
                    <span className="text-xs sm:text-sm text-gray-500 font-semibold tracking-wide">
                      {t('publicPages.aboutUsPage.founderBio.fullNameLabel')}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm sm:text-base font-semibold text-gray-900">
                      {t('publicPages.aboutUsPage.founderBio.fullNameValue')}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs sm:text-sm text-gray-500 font-semibold tracking-wide">
                      {t('publicPages.aboutUsPage.founderBio.roleLabel')}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm sm:text-base text-gray-800">
                      {t('publicPages.aboutUsPage.founderBio.roleValue')}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs sm:text-sm text-gray-500 font-semibold tracking-wide">
                      {t('publicPages.aboutUsPage.founderBio.experienceLabel')}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm sm:text-base text-gray-800">
                      {t('publicPages.aboutUsPage.founderBio.experienceValue')}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs sm:text-sm text-gray-500 font-semibold tracking-wide">
                      {t('publicPages.aboutUsPage.founderBio.basedInLabel')}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm sm:text-base text-gray-800">
                      {t('publicPages.aboutUsPage.founderBio.basedInValue')}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-200">
                  <p className="text-xs sm:text-sm text-gray-500 font-semibold tracking-wide mb-2">
                    {t('publicPages.aboutUsPage.founderBio.statementLabel')}
                  </p>
                  <p className="text-sm sm:text-base italic text-gray-800 leading-relaxed">
                    &ldquo;{t('publicPages.aboutUsPage.founderBio.statementValue')}&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT CARD: 2x2 grid 4 sections */}
            <div className="lg:col-span-6 bg-stone-50/80 rounded-3xl shadow-sm border border-stone-200/70 p-6 sm:p-8 md:p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 h-full">
                {/* Section 1: About */}
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
                    {t('publicPages.aboutUsPage.founderSections.aboutTitle')}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed text-left">
                    {t('publicPages.aboutUsPage.founderIntro')}
                  </p>
                </div>

                {/* Section 2: Career Journey (bullets 0-2) */}
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
                    {t('publicPages.aboutUsPage.founderSections.careerTitle')}
                  </h3>
                  <ul className="space-y-2.5">
                    {Array.isArray(highlights) && highlights.slice(0, 3).map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-left">
                        <span className="text-brand-blue font-bold mt-1 leading-none">&bull;</span>
                        <span className="text-sm md:text-base text-gray-600 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Section 3: Key Contributions (bullets 3-5) */}
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
                    {t('publicPages.aboutUsPage.founderSections.contributionsTitle')}
                  </h3>
                  <ul className="space-y-2.5">
                    {Array.isArray(highlights) && highlights.slice(3, 6).map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-left">
                        <span className="text-brand-blue font-bold mt-1 leading-none">&bull;</span>
                        <span className="text-sm md:text-base text-gray-600 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Section 4: Teaching Approach */}
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
                    {t('publicPages.aboutUsPage.founderSections.approachTitle')}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed text-left">
                    {t('publicPages.aboutUsPage.founderApproach')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Philosophy */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-brand-blue-light/40 rounded-3xl p-8 md:p-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-1.5 bg-brand-blue rounded-full" />
              <h2 className="text-2xl md:text-3xl font-bold text-brand-blue-dark">
                {t('publicPages.aboutUsPage.philosophyHeading')}
              </h2>
            </div>
            <div className="space-y-5 text-gray-700 leading-relaxed text-base md:text-lg text-left">
              <p>{t('publicPages.aboutUsPage.philosophyParagraph1')}</p>
              <p>{t('publicPages.aboutUsPage.philosophyParagraph2')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <Link
            href="/kelas"
            className="inline-flex items-center gap-2 px-10 py-4 bg-brand-blue text-white rounded-2xl font-bold text-base md:text-lg shadow-lg shadow-brand-blue/15 hover:bg-brand-blue-dark hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-blue/20 transition-all btn-animate"
          >
            {t('publicPages.aboutUsPage.closingCta')}
            <ChevronRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
