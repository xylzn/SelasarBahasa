'use client';

import KelasCardClient from './KelasCardClient';
import { useLocale } from '@/components/providers/LocaleProvider';
import { translateTipeKelas, translateTingkatBipa, translateKelasStatus } from '@/lib/i18n-format';

interface KelasEnrollment {
  id: string;
  kelas: {
    id: string;
    tipe: string;
    tingkat: string;
    nama: string | null;
  };
  status: string;
}

interface KelasListClientProps {
  totalMateri: number;
  enrollments?: KelasEnrollment[];
}

// Helper to generate slug gabungan tipeKelas-tingkatBIPA
const generateSlug = (tipe: string, tingkat: string) => {
  const tipeSlug = tipe.toLowerCase().replace('_', '-');
  const tingkatSlug = tingkat.toLowerCase().replace('_', '-');
  return `${tipeSlug}-${tingkatSlug}`;
};

// All possible combinations for locked cards
const ALL_TIPE = ['REGULER', 'PRIVAT', 'ANAK_REMAJA'];
const ALL_BIPA_LEVELS = ['BIPA_1', 'BIPA_2', 'BIPA_3', 'BIPA_4', 'BIPA_5', 'BIPA_6'];

export default function KelasListClient({ totalMateri, enrollments = [] }: KelasListClientProps) {
  const { t } = useLocale();
  // Create a map of accessible tingkat + tipe
  const accessible = new Map<string, KelasEnrollment>();
  enrollments.forEach(e => {
    const key = `${e.kelas.tipe}-${e.kelas.tingkat}`;
    accessible.set(key, e);
  });

  // Prepare cards: show all accessible
  const cards: {
    nama: string;
    deskripsi: string;
    icon: string;
    badge: string;
    badgeStyle?: string;
    href: string;
    locked: boolean;
  }[] = [];

  // Add accessible cards
  enrollments.forEach(enrollment => {
    const namaTipe = translateTipeKelas(enrollment.kelas.tipe, t);
    const namaTingkat = translateTingkatBipa(enrollment.kelas.tingkat, t);
    const isWaiting = enrollment.status === 'WAITING';
    const isCompleted = enrollment.status === 'COMPLETED';
    cards.push({
      nama: `${namaTipe} — ${namaTingkat}`,
      deskripsi: enrollment.kelas.nama ?? (isWaiting ? t('dashboard.waitingDesc') : 'Kelas pembelajaran bahasa Indonesia'),
      icon: '📚',
      badge: translateKelasStatus(enrollment.status, t),
      badgeStyle: enrollment.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : enrollment.status === 'WAITING' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600',
      href: `/dashboard/kelas/${generateSlug(enrollment.kelas.tipe, enrollment.kelas.tingkat)}`,
      locked: isWaiting,
    });
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{t('dashboard.kelasList.choose')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <KelasCardClient
            key={card.nama + index}
            nama={card.nama}
            deskripsi={card.deskripsi}
            icon={card.icon}
            badge={card.badge}
            badgeStyle={card.badgeStyle}
            href={card.href}
            locked={card.locked}
          />
        ))}
      </div>
    </div>
  );
}
