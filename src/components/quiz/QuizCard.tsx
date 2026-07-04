'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { PremiumLockModal } from '@/components/shared/PremiumLockModal';

interface QuizCardProps {
  id: string;
  judul: string;
  deskripsi: string;
  isPremium: boolean;
  userCanAccess: boolean;
}

export default function QuizCard({ id, judul, deskripsi, isPremium, userCanAccess }: QuizCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    if (isPremium && !userCanAccess) {
      setIsModalOpen(true);
    }
  };

  if (isPremium && !userCanAccess) {
    return (
      <>
        <div
          onClick={handleClick}
          className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-brand-orange" />
              <span className="bg-brand-orange-light text-brand-orange px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                Premium
              </span>
            </div>
          </div>
          <h3 className="font-bold text-brand-blue-dark mb-2 text-base leading-snug">{judul}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{deskripsi}</p>
        </div>
        <PremiumLockModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      </>
    );
  }

  return (
    <Link href={`/dashboard/quiz/${id}`} className="block">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          {isPremium && (
            <span className="bg-brand-orange-light text-brand-orange px-3 py-1 rounded-full text-xs font-bold tracking-wide">
              Premium
            </span>
          )}
        </div>
        <h3 className="font-bold text-brand-blue-dark mb-2 text-base leading-snug">{judul}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{deskripsi}</p>
      </div>
    </Link>
  );
}
