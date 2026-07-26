'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

interface MateriCardProps {
  id: string;
  judul: string;
  slug: string;
  tipe: 'TEKS' | 'VIDEO';
  kelas: string;
  tingkatSlug: string;
  isCompleted: boolean;
  tipeKelas: string;
}

export default function MateriCard({ id, judul, slug, tipe, kelas, tingkatSlug, isCompleted, tipeKelas }: MateriCardProps) {
  return (
    <Link href={`/dashboard/kelas/${tingkatSlug}/${tipe.toLowerCase()}/${slug}`} className="block">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative">
        <div className="flex items-start justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            {tipe === 'TEKS' ? 'PDF' : 'Video'}
          </span>
          <div className="flex items-center gap-2">
            {tipeKelas === 'PRIVAT' && (
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                Eksklusif
              </span>
            )}
            {isCompleted && (
              <CheckCircle2 size={20} className="text-green-500" />
            )}
          </div>
        </div>
        <h3 className={`font-bold text-base leading-snug ${isCompleted ? 'text-gray-400 line-through' : 'text-green-800'}`}>{judul}</h3>
      </div>
    </Link>
  );
}
