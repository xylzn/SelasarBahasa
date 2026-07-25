'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import DeleteButton from '@/components/admin/DeleteButton';
import type { TipeKelas, TingkatBIPA } from '@prisma/client';
import { useLocale } from '@/components/providers/LocaleProvider';

interface QuizWithCount {
  id: string;
  judul: string;
  deskripsi: string;
  tipeKelas: TipeKelas | null;
  tingkatBIPA: TingkatBIPA | null;
  published: boolean;
  createdAt: Date;
  _count: { questions: number };
}

interface QuizTableClientProps {
  quizzes: QuizWithCount[];
}

export default function QuizTableClient({ quizzes }: QuizTableClientProps) {
  const { t } = useLocale();
  const [searchQuery, setSearchQuery] = useState('');

  // Group quizzes by tipeKelas and tingkatBIPA
  const groupedQuizzes = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const filtered = quizzes.filter((item) =>
      !q ||
      item.judul.toLowerCase().includes(q) ||
      item.deskripsi.toLowerCase().includes(q) ||
      (item.tipeKelas || '').toLowerCase().includes(q) ||
      (item.tingkatBIPA || '').toLowerCase().includes(q) ||
      (item.published ? 'terbit' : 'draft').includes(q) ||
      item._count.questions.toString().includes(q)
    );
    const groups: Record<string, QuizWithCount[]> = {};
    filtered.forEach((item) => {
      const key = `${item.tipeKelas}-${item.tingkatBIPA}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [quizzes, searchQuery]);

  // Helper to format group key
  const formatGroupKey = (key: string) => {
    const [tipeKelas, tingkatBIPA] = key.split('-');
    return `${tipeKelas} · ${tingkatBIPA.replace('_', ' ')}`;
  };

  return (
    <div className="space-y-8">
      <div className="max-w-md">
        <input
          type="text"
          placeholder={t('admin.quizTable.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
        />
      </div>
      {Object.keys(groupedQuizzes).length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-gray-500">{t('admin.quizTable.empty')}</p>
        </div>
      ) : (
        Object.keys(groupedQuizzes).sort().map((groupKey) => (
          <div key={groupKey} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">{formatGroupKey(groupKey)}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Judul
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jumlah Soal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {groupedQuizzes[groupKey].map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.judul}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item._count.questions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.published ? 'Terbit' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-3">
                        <Link
                          href={`/admin/quiz/edit/${item.id}`}
                          className="text-brand-blue hover:text-brand-blue-dark font-medium"
                        >
                          Edit
                        </Link>
                        <DeleteButton id={item.id} apiPath="/api/quiz" itemName={item.judul} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}