'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import DataTable, { type Column } from './DataTable';
import DeleteButton from './DeleteButton';
import type { TipeKelas, TingkatBIPA } from '@prisma/client';
import { useLocale } from '@/components/providers/LocaleProvider';

interface TugasWithSubmissions {
  id: string;
  judul: string;
  slug: string;
  tipeKelas: TipeKelas | null;
  tingkatBIPA: TingkatBIPA | null;
  published: boolean;
  _count: { submissions: number };
}

interface TugasTableClientProps {
  tugasList: TugasWithSubmissions[];
}

export default function TugasTableClient({ tugasList }: TugasTableClientProps) {
  const { t } = useLocale();
  const [searchQuery, setSearchQuery] = useState('');

  // Group tugas by tipeKelas and tingkatBIPA
  const groupedTugas = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const filtered = tugasList.filter((item) =>
      !q ||
      item.judul.toLowerCase().includes(q) ||
      item.slug.toLowerCase().includes(q) ||
      (item.tipeKelas || '').toLowerCase().includes(q) ||
      (item.tingkatBIPA || '').toLowerCase().includes(q) ||
      (item.published ? 'terbit' : 'draft').includes(q) ||
      item._count.submissions.toString().includes(q)
    );
    const groups: Record<string, TugasWithSubmissions[]> = {};
    filtered.forEach((item) => {
      const key = `${item.tipeKelas}-${item.tingkatBIPA}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [tugasList, searchQuery]);

  // Helper to format group key
  const formatGroupKey = (key: string) => {
    const [tipeKelas, tingkatBIPA] = key.split('-');
    return `${tipeKelas} · ${tingkatBIPA.replace('_', ' ')}`;
  };

  const columns: Column<any>[] = [
    { key: 'judul', header: 'Judul' },
    {
      key: '_count',
      header: 'Submissions',
      render: (value: any, item: any) => (
        <Link
          href={`/admin/tugas/${item.id}/submissions`}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          {value.submissions}
        </Link>
      ),
    },
    {
      key: 'published',
      header: 'Status',
      render: (value: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {value ? 'Terbit' : 'Draft'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (value: any, item: any) => (
        <div className="flex gap-3">
          <Link
            href={`/admin/tugas/${item.id}/submissions`}
            className="text-green-600 hover:text-green-700 font-medium text-sm"
          >
            Submissions
          </Link>
          <Link
            href={`/admin/tugas/edit/${item.id}`}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Edit
          </Link>
          <DeleteButton id={item.id} apiPath="/api/tugas" itemName={item.judul} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="max-w-md">
        <input
          type="text"
          placeholder={t('admin.tugasTable.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>
      {Object.keys(groupedTugas).length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-gray-500">{t('admin.tugasTable.empty')}</p>
        </div>
      ) : (
        Object.keys(groupedTugas).sort().map((groupKey) => (
          <div key={groupKey} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">{formatGroupKey(groupKey)}</h3>
            </div>
            <DataTable columns={columns} data={groupedTugas[groupKey] as any} />
          </div>
        ))
      )}
    </div>
  );
}
