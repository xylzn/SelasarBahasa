'use client';

import Link from 'next/link';

interface QuizCardProps {
  id: string;
  judul: string;
  deskripsi: string;
}

export default function QuizCard({ id, judul, deskripsi }: QuizCardProps) {
  return (
    <Link href={`/dashboard/quiz/${id}`} className="block">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
        <h3 className="font-bold text-brand-blue-dark mb-2 text-base leading-snug">{judul}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{deskripsi}</p>
      </div>
    </Link>
  );
}
