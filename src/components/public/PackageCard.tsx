'use client';

import { CheckCircle2 } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import { LOCALE_TO_CURRENCY, formatCurrency } from '@/lib/currency';

interface Package {
  id: string;
  nama: string;
  deskripsi: string;
  harga: number;
  fiturList: string[];
  isPopuler: boolean;
}

export default function PackageCard({
  pkg,
  exchangeRates,
}: {
  pkg: Package;
  exchangeRates: Record<string, number>;
}) {
  const { locale, t } = useLocale();
  const targetCurrency = LOCALE_TO_CURRENCY[locale] || 'IDR';

  const formattedPrice = formatCurrency(pkg.harga, targetCurrency, exchangeRates);
  const formattedIdr = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(pkg.harga);

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between reveal ${
        pkg.isPopuler ? 'border-brand-blue ring-4 ring-brand-blue-light/50' : 'border-gray-100'
      }`}
    >
      {pkg.isPopuler && (
        <div className="bg-brand-blue text-white text-center py-2.5 text-xs font-bold uppercase tracking-wider">
          {t('package.popular')}
        </div>
      )}
      <div className="p-8 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-2xl font-bold text-brand-blue-dark mb-2">{pkg.nama}</h3>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">{pkg.deskripsi}</p>
          <div className="mb-6">
            <div className="text-4xl font-extrabold text-brand-blue-dark mb-2">
              {formattedPrice}
            </div>
            {targetCurrency !== 'IDR' && (
              <div className="text-xs text-gray-500 space-y-1">
                <div>≈ {formattedIdr}</div>
                <div className="text-gray-400">Kurs saat ini, bisa berubah</div>
              </div>
            )}
          </div>
          <ul className="space-y-4 mb-8">
            {pkg.fiturList.map((fitur, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-gray-600">
                <CheckCircle2 size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span>{fitur}</span>
              </li>
            ))}
          </ul>
        </div>
        <a
          href="https://wa.me/6281234567890"
          target="_blank"
          rel="noopener noreferrer"
          className={`block w-full text-center py-3.5 rounded-xl font-bold transition-all text-sm ${
            pkg.isPopuler
              ? 'bg-brand-orange text-white hover:bg-brand-orange/95 btn-orange-animate'
              : 'bg-brand-blue-light text-brand-blue hover:bg-brand-blue-light/80 btn-animate'
          }`}
        >
          {t('package.contactUs')}
        </a>
      </div>
    </div>
  );
}
