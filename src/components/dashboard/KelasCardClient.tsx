'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { PremiumLockModal } from '@/components/shared/PremiumLockModal';

interface KelasCardProps {
  nama: string;
  deskripsi: string;
  icon: string;
  badge: string;
  isPremium: boolean;
  href: string;
}

export default function KelasCardClient({ nama, deskripsi, icon, badge, isPremium, href }: KelasCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isPremium) {
    return (
      <>
        <div
          onClick={() => setIsModalOpen(true)}
          className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition cursor-pointer opacity-80"
        >
          <div className="text-4xl mb-4 flex items-center gap-2">
            {icon}
            <Lock className="text-gray-400" size={20} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{nama}</h2>
          <p className="text-gray-600 mb-4">{deskripsi}</p>
          <div className="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
            Premium
          </div>
        </div>
        <PremiumLockModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      </>
    );
  }

  return (
    <Link href={href}>
      <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition cursor-pointer">
        <div className="text-4xl mb-4">{icon}</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{nama}</h2>
        <p className="text-gray-600 mb-4">{deskripsi}</p>
        <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {badge}
        </div>
      </div>
    </Link>
  );
}
