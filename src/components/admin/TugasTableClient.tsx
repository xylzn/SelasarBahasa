'use client';

import Link from 'next/link';
import DataTable, { type Column } from './DataTable';

interface TugasWithSubmissions {
  id: string;
  judul: string;
  slug: string;
  kelas: string;
  isPremium: boolean;
  published: boolean;
  _count: { submissions: number };
}

interface TugasTableClientProps {
  tugasList: TugasWithSubmissions[];
}

export default function TugasTableClient({ tugasList }: TugasTableClientProps) {
  const columns: Column<TugasWithSubmissions>[] = [
    { key: 'judul', header: 'Judul' },
    { key: 'kelas', header: 'Kelas' },
    {
      key: 'isPremium',
      header: 'Premium',
      render: (value: any) => (
        <span className={value ? 'text-yellow-600' : 'text-gray-500'}>
          {value ? 'Ya' : 'Tidak'}
        </span>
      ),
    },
    {
      key: '_count',
      header: 'Submissions',
      render: (value: any) => value.submissions,
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
  ];

  return <DataTable columns={columns} data={tugasList as any} />;
}
