'use client';

import { Lock } from 'lucide-react';
import Link from 'next/link';

interface KelasCardProps {
  nama: string;
  deskripsi: string;
  icon: string;
  badge: string;
  badgeStyle?: string;
  href: string;
  locked?: boolean;
}

export default function KelasCardClient({ nama, deskripsi, icon, badge, badgeStyle, href, locked = false }: KelasCardProps) {
  if (locked) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 opacity-80">
        <div className="text-4xl mb-4 flex items-center gap-2">
          {icon}
          <Lock className="text-yellow-500" size={20} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{nama}</h2>
        <p className="text-gray-600 mb-4">{deskripsi}</p>
        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${badgeStyle ?? 'bg-green-50 text-green-800'}`}>
          {badge}
        </div>
      </div>
    );
  }

  return (
    <Link href={href}>
      <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition cursor-pointer">
        <div className="text-4xl mb-4">{icon}</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{nama}</h2>
        <p className="text-gray-600 mb-4">{deskripsi}</p>
        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${badgeStyle ?? 'bg-green-50 text-green-800'}`}>
          {badge}
        </div>
      </div>
    </Link>
  );
}
