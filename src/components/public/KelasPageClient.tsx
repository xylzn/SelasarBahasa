'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Clock, Users, DollarSign, RotateCcw, BookOpen, ChevronRight } from 'lucide-react';
import ClassInfoPanel from '@/components/dashboard/registration/ClassInfoPanel';
import { useLocale } from '@/components/providers/LocaleProvider';
import { translateTipeKelas, translateTingkatBipa } from '@/lib/i18n-format';

type TipeKelas = 'REGULER' | 'PRIVAT' | 'ANAK_REMAJA';

interface KelasOption {
  id: string;
  tingkat: string;
  nama: string | null;
  minKuota: number;
  enrolledCount: number;
  status: 'WAITING_LIST' | 'ONGOING' | 'COMPLETED';
}

interface KelasPageClientProps {
  regulerKelas: KelasOption[];
  privatKelas: KelasOption[];
  anakKelas: KelasOption[];
}

const TIPE_ROUTE: Record<TipeKelas, string> = {
  REGULER: '/register-package/reguler',
  PRIVAT: '/register-package/privat',
  ANAK_REMAJA: '/register-package/anak',
};

const CLASS_IMAGE: Record<TipeKelas, string> = {
  REGULER: '/images/kelas/reguler.jpeg',
  PRIVAT: '/images/kelas/privat.jpeg',
  ANAK_REMAJA: '/images/kelas/remaja.jpeg',
};

const PAGE_BG = 'bg-brand-orange-light';

function KelasCard({
  kelas,
  tipe,
}: {
  kelas: KelasOption;
  tipe: TipeKelas;
}) {
  const router = useRouter();
  const { t, locale } = useLocale();
  const route = TIPE_ROUTE[tipe];
  const tingkatDisplay = translateTingkatBipa(kelas.tingkat, t);
  const preferredLevel = kelas.tingkat;
  const nama = kelas.nama || tingkatDisplay;
  const kuotaFull = kelas.enrolledCount >= kelas.minKuota;
  const isOngoing = kelas.status === 'ONGOING';

  const handleRegister = () => {
    const params = new URLSearchParams();
    params.set('kelasId', kelas.id);
    params.set('preferredLevel', preferredLevel);
    if (tipe === 'REGULER' && kelas.tingkat === 'BIPA_1') {
      params.set('ability', 'Beginner');
    } else if (tipe === 'REGULER' && kelas.tingkat === 'BIPA_6') {
      params.set('ability', 'Advanced');
    }
    router.push(`${route}?${params.toString()}`);
  };

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition-all ${
        isOngoing ? 'border-green-200' : 'border-brand-orange/10 hover:-translate-y-0.5'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={16} className="text-brand-orange" />
            <span className="text-xs font-semibold text-brand-orange uppercase tracking-wider">
              {tingkatDisplay}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 leading-tight">{nama}</h3>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
            isOngoing
              ? 'bg-green-100 text-green-700'
              : kuotaFull
                ? 'bg-orange-100 text-orange-700'
                : 'bg-green-50 text-green-700'
          }`}
        >
          {isOngoing
            ? t('publicPages.kelas.sedangBerjalan')
            : kuotaFull
              ? t('publicPages.kelas.penuh')
              : `${kelas.enrolledCount}/${kelas.minKuota}`}
        </span>
      </div>

      <div className="space-y-1.5 mb-5 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          {isOngoing ? (
            <>
              <Users size={12} className="text-gray-400" />
              <span>{t('publicPages.kelas.siswaOngoing', { count: kelas.enrolledCount })}</span>
            </>
          ) : (
            <>
              <Users size={12} className="text-gray-400" />
              <span>{t('publicPages.kelas.kuotaMin', { count: kelas.minKuota })}</span>
            </>
          )}
        </div>
      </div>

      {isOngoing ? (
        <Link
          href="/#contact"
          className="w-full py-2.5 border-2 border-brand-orange text-brand-orange rounded-xl font-semibold hover:bg-brand-orange-light transition-all text-sm flex items-center justify-center gap-1.5"
        >
          {t('publicPages.kelas.hubungiKami')} <ChevronRight size={14} />
        </Link>
      ) : (
        <button
          onClick={handleRegister}
          className="w-full py-2.5 bg-brand-orange text-white rounded-xl font-semibold hover:bg-brand-orange-dark transition-all text-sm flex items-center justify-center gap-1.5 btn-animate"
        >
          {t('publicPages.kelas.daftarSekarang')} <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}

export default function KelasPageClient({
  regulerKelas,
  privatKelas,
  anakKelas,
}: KelasPageClientProps) {
  const { t, locale } = useLocale();
  const [activeTab, setActiveTab] = useState<TipeKelas>('REGULER');

  const TABS: { key: TipeKelas; label: string }[] = [
    { key: 'REGULER', label: translateTipeKelas('REGULER', t) },
    { key: 'PRIVAT', label: translateTipeKelas('PRIVAT', t) },
    { key: 'ANAK_REMAJA', label: translateTipeKelas('ANAK_REMAJA', t) },
  ];

  const CLASS_IMAGE_ALT: Record<TipeKelas, string> = {
    REGULER: translateTipeKelas('REGULER', t),
    PRIVAT: translateTipeKelas('PRIVAT', t),
    ANAK_REMAJA: translateTipeKelas('ANAK_REMAJA', t),
  };

  const getActiveKelas = (): KelasOption[] => {
    switch (activeTab) {
      case 'REGULER':
        return regulerKelas;
      case 'PRIVAT':
        return privatKelas;
      case 'ANAK_REMAJA':
        return anakKelas;
    }
  };

  const showCards = activeTab !== 'PRIVAT';
  const router = useRouter();

  return (
    <div className={`py-16 ${PAGE_BG} min-h-screen`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-white border border-brand-orange/20 text-brand-orange rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            {t('publicPages.kelas.headerEyebrow')}
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-orange-dark mb-4 leading-tight">
            {t('publicPages.kelas.headerTitle')}
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            {t('publicPages.kelas.headerSubtitle')}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-8 py-3 rounded-full border-2 font-bold text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-orange border-brand-orange text-white shadow-lg shadow-brand-orange/20'
                    : 'bg-white/60 border-brand-orange/40 text-brand-orange-dark hover:bg-white hover:border-brand-orange'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content: Image + Class Info */}
        <div className="max-w-5xl mx-auto mb-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border-4 border-white">
              {TABS.map((tab) => (
                <Image
                  key={tab.key}
                  src={CLASS_IMAGE[tab.key]}
                  alt={CLASS_IMAGE_ALT[tab.key]}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority={tab.key === 'REGULER'}
                  className={`object-cover transition-opacity duration-500 ${
                    activeTab === tab.key ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-orange-dark/25 via-transparent to-transparent pointer-events-none" />
            </div>

            <div key={activeTab + '-info'} className="animate-fade-in">
              <ClassInfoPanel tipe={activeTab} theme="orange" />
            </div>
          </div>
        </div>

        {/* Privat: just a big register button */}
        {!showCards && (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <button
              onClick={() => router.push(TIPE_ROUTE.PRIVAT)}
              className="px-10 py-4 bg-brand-orange text-white rounded-2xl font-bold text-base shadow-lg shadow-brand-orange/20 hover:shadow-xl hover:-translate-y-0.5 transition-all btn-animate flex items-center gap-2"
            >
              {t('publicPages.kelas.daftarPrivat')} <ChevronRight size={18} />
            </button>
            <p className="text-xs text-gray-500 text-center max-w-md">
              {t('publicPages.kelas.privatDesc')}
            </p>
          </div>
        )}

        {/* Reguler & Anak Remaja: show class cards */}
        {showCards && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {t('publicPages.kelas.openNowTitle')}
              </h2>
              <span className="text-xs text-gray-500">
                {t('publicPages.kelas.programTersedia', { count: getActiveKelas().length })}
              </span>
            </div>

            {getActiveKelas().length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getActiveKelas().map((kelas) => (
                  <KelasCard
                    key={kelas.id}
                    kelas={kelas}
                    tipe={activeTab}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-brand-orange/10 p-12 text-center">
                <BookOpen size={48} className="text-brand-orange/30 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t('publicPages.kelas.empty')}</h3>
                <p className="text-sm text-gray-500 mb-5">
                  {t('publicPages.kelas.emptyDesc')}
                </p>
                <Link
                  href={`${TIPE_ROUTE[activeTab]}?notify=true`}
                  className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-brand-orange text-brand-orange rounded-xl font-semibold hover:bg-brand-orange-light transition-all text-sm"
                >
                  {t('publicPages.kelas.notifyMe')} <ChevronRight size={14} />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
