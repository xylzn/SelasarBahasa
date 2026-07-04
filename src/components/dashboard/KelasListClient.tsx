'use client';

import KelasCardClient from './KelasCardClient';

interface KelasListClientProps {
  userCanAccessPremium: boolean;
  totalMateri: number;
}

export default function KelasListClient({ userCanAccessPremium, totalMateri }: KelasListClientProps) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Pilih Kelas</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KelasCardClient
          nama="Kelas Dasar"
          deskripsi="Materi dasar untuk pemula"
          icon="📚"
          badge={`${totalMateri} Konten`}
          isPremium={false}
          href="/dashboard/kelas/dasar"
        />
        <KelasCardClient
          nama="Kelas Menengah"
          deskripsi="Untuk tingkat menengah"
          icon="📖"
          badge="Akses Sekarang"
          isPremium={!userCanAccessPremium}
          href="/dashboard/kelas/menengah"
        />
        <KelasCardClient
          nama="Kelas Lanjutan"
          deskripsi="Untuk tingkat lanjutan"
          icon="🎓"
          badge="Akses Sekarang"
          isPremium={!userCanAccessPremium}
          href="/dashboard/kelas/lanjutan"
        />
      </div>
    </div>
  );
}
