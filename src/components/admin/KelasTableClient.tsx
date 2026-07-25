'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Play, X } from 'lucide-react';
import DeleteButton from '@/components/admin/DeleteButton';
import { useLocale } from '@/components/providers/LocaleProvider';

const TIPE_LABEL: Record<string, string> = { REGULER: 'Reguler', PRIVAT: 'Privat', ANAK_REMAJA: 'Anak & Remaja' };
const STATUS_STYLE: Record<string, string> = {
  WAITING_LIST: 'bg-yellow-100 text-yellow-800',
  ONGOING: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-gray-100 text-gray-600',
};
const STATUS_LABEL: Record<string, string> = {
  WAITING_LIST: 'Waiting List',
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
};

interface Kelas {
  id: string;
  nama: string;
  tipe: string;
  tingkat: string;
  status: string;
  minKuota: number;
  createdAt: Date;
  _count: { enrollments: number };
}

export default function KelasTableClient({ kelasList }: { kelasList: Kelas[] }) {
  const router = useRouter();
  const { t } = useLocale();
  const [confirmKelas, setConfirmKelas] = useState<Kelas | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [search, setSearch] = useState('');

  const handleStart = async () => {
    if (!confirmKelas) return;
    setIsStarting(true);
    try {
      await fetch(`/api/admin/kelas/${confirmKelas.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ONGOING' }),
      });
      setConfirmKelas(null);
      router.refresh();
    } finally {
      setIsStarting(false);
    }
  };

  // Group and filter kelas
  const groupedKelas = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = kelasList.filter(k => {
      return !q ||
        (k.nama ?? '').toLowerCase().includes(q) ||
        (TIPE_LABEL[k.tipe] ?? '').toLowerCase().includes(q) ||
        k.tipe.toLowerCase().includes(q) ||
        (STATUS_LABEL[k.status] ?? '').toLowerCase().includes(q) ||
        k.status.toLowerCase().includes(q) ||
        k.tingkat.toLowerCase().includes(q) ||
        k.tingkat.replace('_', ' ').toLowerCase().includes(q) ||
        k._count.enrollments.toString().includes(q) ||
        k.minKuota.toString().includes(q);
    });

    const groups: Record<string, Kelas[]> = {};
    filtered.forEach(k => {
      const key = `${k.tipe}-${k.tingkat}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(k);
    });

    return groups;
  }, [kelasList, search]);

  // Helper to format group key
  const formatGroupKey = (key: string) => {
    const [tipeKelas, tingkatBIPA] = key.split('-');
    return `${TIPE_LABEL[tipeKelas]} · ${tingkatBIPA.replace('_', ' ')}`;
  };

  return (
    <>
      {/* Search */}
      <div className="max-w-md mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('admin.kelasTable.searchPlaceholder')}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent bg-white"
        />
      </div>

      {Object.keys(groupedKelas).length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-gray-500">{t('admin.kelasTable.empty')}</p>
        </div>
      ) : (
        Object.keys(groupedKelas).sort().map(groupKey => (
          <div key={groupKey} className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">{formatGroupKey(groupKey)}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white border-b border-gray-200">
                  <tr>
                    {['Nama Kelas', 'Tipe', 'Tingkat', 'Status', 'Pendaftar / Min. Kuota', 'Dibuat', 'Aksi'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {groupedKelas[groupKey].map(k => (
                    <tr key={k.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{k.nama || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{TIPE_LABEL[k.tipe]}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{k.tingkat.replace('_', ' ')}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[k.status]}`}>
                          {STATUS_LABEL[k.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={k._count.enrollments >= k.minKuota ? 'text-green-600 font-semibold' : 'text-gray-700'}>
                          {k._count.enrollments}
                        </span>
                        <span className="text-gray-400"> / {k.minKuota}</span>
                        {k._count.enrollments < k.minKuota && (
                          <span className="ml-1 text-xs text-amber-500">({k.minKuota - k._count.enrollments} lagi)</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(k.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-3">
                          {k.status === 'WAITING_LIST' && (
                            <button
                              onClick={() => setConfirmKelas(k)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition"
                            >
                              <Play size={12} /> Mulai Kelas
                            </button>
                          )}
                          <Link href={`/admin/kelas/edit/${k.id}`}
                            className="text-brand-blue hover:text-brand-blue/80 font-medium text-sm">{t('common.edit')}</Link>
                          <DeleteButton id={k.id} apiPath="/api/admin/kelas" itemName={`${TIPE_LABEL[k.tipe]} ${k.tingkat}`} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      {/* Confirmation dialog */}
      {confirmKelas && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">{t('admin.kelasTable.startClassConfirmTitle')}</h3>
              <button onClick={() => setConfirmKelas(null)} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-sm text-amber-800">
              Memulai kelas akan otomatis mengubah status semua siswa yang sudah terdaftar{' '}
              (<strong>{t('admin.kelasTable.waitingToActive')}</strong>) agar mereka bisa mengakses materi. Lanjutkan?
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Kelas: <strong>{TIPE_LABEL[confirmKelas.tipe]} — {confirmKelas.tingkat.replace('_', ' ')}</strong>
              <br />
              Siswa akan diaktifkan: <strong className="text-green-600">{confirmKelas._count.enrollments} orang</strong>
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmKelas(null)} disabled={isStarting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm disabled:opacity-50">
                Batal
              </button>
              <button onClick={handleStart} disabled={isStarting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold disabled:opacity-50 inline-flex items-center gap-2">
                <Play size={14} />
                {isStarting ? 'Memulai...' : 'Ya, Mulai Kelas'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
