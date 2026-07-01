'use client';

import Link from 'next/link';
import DataTable, { type Column } from './DataTable';
import DeleteButton from './DeleteButton';

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
  const columns: Column<any>[] = [
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
    {
      key: 'actions',
      header: 'Aksi',
      render: (value: any, item: any) => (
        <div className="flex gap-3">
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

  return <DataTable columns={columns} data={tugasList as any} />;
}
