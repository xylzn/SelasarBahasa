'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import DeleteButton from '@/components/admin/DeleteButton';

interface MateriItem {
  id: string;
  judul: string;
  slug: string;
  tipe: string;
  tipeKelas: string;
  tingkatBIPA: string;
  published: boolean;
}

export default function AdminMateriPage() {
  const [materiList, setMateriList] = useState<MateriItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data on mount
  useEffect(() => {
    const fetchMateri = async () => {
      setIsLoading(true);
      const res = await fetch('/api/materi?admin=true');
      if (res.ok) {
        const data = await res.json();
        setMateriList(data);
      }
      setIsLoading(false);
    };
    fetchMateri();
  }, []);

  // Group materi by tipeKelas and tingkatBIPA
  const groupedMateri = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const filtered = materiList.filter((item) =>
      !q ||
      item.judul.toLowerCase().includes(q) ||
      item.slug.toLowerCase().includes(q) ||
      item.tipe.toLowerCase().includes(q) ||
      item.tipeKelas.toLowerCase().includes(q) ||
      item.tingkatBIPA.toLowerCase().includes(q) ||
      (item.published ? 'terbit' : 'draft').includes(q)
    );
    const groups: Record<string, MateriItem[]> = {};
    filtered.forEach((item) => {
      const key = `${item.tipeKelas}-${item.tingkatBIPA}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [materiList, searchQuery]);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Helper to format group key
  const formatGroupKey = (key: string) => {
    const [tipeKelas, tingkatBIPA] = key.split('-');
    return `${tipeKelas} · ${tingkatBIPA.replace('_', ' ')}`;
  };

  return (
    <div className="p-8">
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Kelola Materi</h1>
            <p className="text-gray-600">Tambah, edit, atau hapus materi.</p>
          </div>
          <Link
            href="/admin/materi/create"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            + Tambah Materi
          </Link>
        </div>
        <div className="max-w-md">
          <input
            type="text"
            placeholder="Cari materi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="space-y-8">
        {Object.keys(groupedMateri).length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-500">Tidak ada materi ditemukan.</p>
          </div>
        ) : (
          Object.keys(groupedMateri).sort().map((groupKey) => (
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
                        Slug
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipe
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {groupedMateri[groupKey].map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.judul}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.slug}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.tipe.toLowerCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.published ? 'Terbit' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-3">
                          <Link
                            href={`/admin/materi/edit/${item.id}`}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Edit
                          </Link>
                          <DeleteButton id={item.id} apiPath="/api/materi" />
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
    </div>
  );
}
