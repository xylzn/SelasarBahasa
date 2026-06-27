'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PremiumLockModal } from '@/components/shared/PremiumLockModal';

interface MateriCardProps {
  id: string;
  judul: string;
  slug: string;
  tipe: 'TEKS' | 'VIDEO';
  kelas: string;
  isPremium: boolean;
  userCanAccess: boolean;
}

export default function MateriCard({ id, judul, slug, tipe, kelas, isPremium, userCanAccess }: MateriCardProps) {
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
          className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition cursor-pointer"
        >
          <div className="flex items-start justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">
              {tipe === 'TEKS' ? 'Teks' : 'Video'}
            </span>
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
              Premium
            </span>
          </div>
          <h3 className="font-bold text-gray-900 mb-2">{judul}</h3>
        </div>
        <PremiumLockModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      </>
    );
  }

  return (
    <Link href={`/dashboard/kelas/${kelas.toLowerCase()}/${tipe.toLowerCase()}/${slug}`}>
      <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <span className="text-sm font-medium text-gray-500">
            {tipe === 'TEKS' ? 'Teks' : 'Video'}
          </span>
          {isPremium && (
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
              Premium
            </span>
          )}
        </div>
        <h3 className="font-bold text-gray-900">{judul}</h3>
      </div>
    </Link>
  );
}
