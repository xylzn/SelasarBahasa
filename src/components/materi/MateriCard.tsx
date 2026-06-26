import Link from 'next/link';
import { BookOpen, PlayCircle, Lock } from 'lucide-react';

interface MateriCardProps {
  id: string;
  judul: string;
  slug: string;
  tipe: 'TEKS' | 'VIDEO' | 'CAMPURAN';
  isPremium: boolean;
  isLocked: boolean;
}

export default function MateriCard({ id, judul, slug, tipe, isPremium, isLocked }: MateriCardProps) {
  const Icon = tipe === 'VIDEO' || tipe === 'CAMPURAN' ? PlayCircle : BookOpen;

  return (
    <Link href={`/dashboard/materi/${slug}`} className="block">
      <div className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition ${isLocked ? 'opacity-75' : ''}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            {isLocked ? <Lock size={20} className="text-gray-400" /> : <Icon size={20} className="text-blue-600" />}
          </div>
          {isPremium && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
              Premium
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{judul}</h3>
        <p className="text-sm text-gray-500 capitalize">{tipe.toLowerCase()}</p>
      </div>
    </Link>
  );
}
