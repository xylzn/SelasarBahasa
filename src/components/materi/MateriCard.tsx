'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { PremiumLockModal } from '@/components/shared/PremiumLockModal';

interface MateriCardProps {
  id: string;
  judul: string;
  slug: string;
  tipe: 'TEKS' | 'VIDEO';
  kelas: string;
  isPremium: boolean;
  userCanAccess: boolean;
  isCompleted: boolean;
}

export default function MateriCard({ id, judul, slug, tipe, kelas, isPremium, userCanAccess, isCompleted }: MateriCardProps) {
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
          className="bg-white p-6 rounded-2xl border border-gray-150 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative reveal"
        >
          <div className="flex items-start justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              {tipe === 'TEKS' ? 'PDF' : 'Video'}
            </span>
            <span className="bg-brand-orange-light text-brand-orange px-3 py-1 rounded-full text-xs font-bold tracking-wide">
              Premium
            </span>
          </div>
          <h3 className="font-bold text-brand-blue-dark mb-2 text-base leading-snug">{judul}</h3>
        </div>
        <PremiumLockModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      </>
    );
  }

  return (
    <Link href={`/dashboard/kelas/${kelas.toLowerCase()}/${tipe.toLowerCase()}/${slug}`} className="block reveal">
      <div className="bg-white p-6 rounded-2xl border border-gray-150 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative">
        <div className="flex items-start justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            {tipe === 'TEKS' ? 'PDF' : 'Video'}
          </span>
          <div className="flex items-center gap-2">
            {isPremium && (
              <span className="bg-brand-orange-light text-brand-orange px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                Premium
              </span>
            )}
            {isCompleted && (
              <CheckCircle2 size={20} className="text-green-500" />
            )}
          </div>
        </div>
        <h3 className={`font-bold text-base leading-snug ${isCompleted ? 'text-gray-400 line-through' : 'text-brand-blue-dark'}`}>{judul}</h3>
      </div>
    </Link>
  );
}
