import Link from 'next/link';
import { HelpCircle, Lock } from 'lucide-react';

interface QuizCardProps {
  id: string;
  judul: string;
  deskripsi: string;
  isPremium: boolean;
  isLocked: boolean;
}

export default function QuizCard({ id, judul, deskripsi, isPremium, isLocked }: QuizCardProps) {
  return (
    <Link href={`/dashboard/quiz/${id}`} className="block">
      <div className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition ${isLocked ? 'opacity-75' : ''}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
            {isLocked ? <Lock size={20} className="text-gray-400" /> : <HelpCircle size={20} className="text-purple-600" />}
          </div>
          {isPremium && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
              Premium
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{judul}</h3>
        <p className="text-sm text-gray-500 line-clamp-2">{deskripsi}</p>
      </div>
    </Link>
  );
}
