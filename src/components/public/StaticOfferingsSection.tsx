'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';

const P = 'publicPages.staticOfferings';

export default function StaticOfferingsSection() {
  const { t } = useLocale();

  const OFFERINGS = [
    {
      key: 'reguler',
      href: '/register-package/reguler',
      isPopuler: false,
    },
    {
      key: 'privat',
      href: '/register-package/privat',
      isPopuler: true,
    },
    {
      key: 'anakRemaja',
      href: '/register-package/anak',
      isPopuler: false,
    },
  ];

  return (
    <section className="py-20" id="packages">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t(`${P}.title`)}
          </h2>
          <p className="text-gray-600">{t(`${P}.subtitle`)}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {OFFERINGS.map((offer) => (
            <div
              key={offer.key}
              className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${
                offer.isPopuler ? 'border-brand-blue ring-4 ring-brand-blue-light/50' : 'border-gray-100'
              }`}
            >
              {offer.isPopuler && (
                <div className="bg-brand-blue text-white text-center py-2.5 text-xs font-bold uppercase tracking-wider">
                  {t(`${P}.popular`)}
                </div>
              )}
              <div className="p-8 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-brand-blue-dark mb-2">
                    {t(`${P}.${offer.key}.title`)}
                  </h3>
                  <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                    {t(`${P}.${offer.key}.desc`)}
                  </p>
                  <ul className="space-y-3 mb-8">
                    {(['f1', 'f2', 'f3', 'f4'] as const).map((fKey) => (
                      <li key={fKey} className="flex items-start gap-3 text-sm text-gray-600">
                        <CheckCircle2 size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{t(`${P}.${offer.key}.${fKey}`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href={offer.href}
                  className={`block w-full text-center py-3.5 rounded-xl font-bold transition-all text-sm ${
                    offer.isPopuler
                      ? 'bg-brand-orange text-white hover:bg-brand-orange/95 btn-orange-animate'
                      : 'bg-brand-blue-light text-brand-blue hover:bg-brand-blue-light/80 btn-animate'
                  }`}
                >
                  {t(`${P}.cta`)}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
