'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ChevronDown, FileQuestion, Eye, X } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';

// Exact string used to detect placement test need
const PLACEMENT_TEST_VALUE = 'Not Sure (needs placement test)';

function parseNotes(raw: string | null): Record<string, string> {
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

function needsPlacementTest(raw: string | null): boolean {
  const notes = parseNotes(raw);
  return notes['Preferred Level'] === PLACEMENT_TEST_VALUE;
}

interface Enrollment {
  id: string;
  status: EnrollmentStatus;
  notes: string | null;
  namaWali: string | null;
  umurAnak: number | null;
  createdAt: Date;
  user: { nama: string; email: string; noWhatsapp: string | null };
  kelas: { tipe: string; tingkat: string; nama?: string };
}

const STATUS_STYLE: Record<EnrollmentStatus, string> = {
  PENDING_PAYMENT:   'bg-amber-100 text-amber-800',
  WAITING:           'bg-blue-100 text-blue-800',
  ACTIVE:            'bg-green-100 text-green-800',
  COMPLETED:         'bg-gray-100 text-gray-600',
  REFUND_REQUESTED:  'bg-orange-100 text-orange-800',
  REFUNDED:          'bg-red-100 text-red-700',
};

const TIPE_LABEL: Record<string, string> = { REGULER: 'Reguler', PRIVAT: 'Privat', ANAK_REMAJA: 'Anak & Remaja' };
const ALL_STATUSES: EnrollmentStatus[] = ['PENDING_PAYMENT', 'WAITING', 'ACTIVE', 'COMPLETED', 'REFUND_REQUESTED', 'REFUNDED'];

type EnrollmentStatus = 'PENDING_PAYMENT' | 'WAITING' | 'ACTIVE' | 'COMPLETED' | 'REFUND_REQUESTED' | 'REFUNDED';

export default function EnrollmentTableClient({ enrollments }: { enrollments: Enrollment[] }) {
  const router = useRouter();
  const { t } = useLocale();
  const [loading, setLoading] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);

  // Fix: null-safe, case-insensitive search against name, email, tipe, tingkat, status, WA
  const filtered = search.trim()
    ? enrollments.filter((item) => {
        const s = search.toLowerCase();
        return (
          item.user?.nama?.toLowerCase().includes(s) ||
          item.user?.email?.toLowerCase().includes(s) ||
          (item.user?.noWhatsapp || '').toLowerCase().includes(s) ||
          (TIPE_LABEL[item.kelas?.tipe] || item.kelas?.tipe || '').toLowerCase().includes(s) ||
          (item.kelas?.tipe || '').toLowerCase().includes(s) ||
          (item.kelas?.tingkat || '').toLowerCase().includes(s) ||
          (item.kelas?.tingkat || '').replace('_', ' ').toLowerCase().includes(s) ||
          item.status.toLowerCase().includes(s) ||
          item.status.replace('_', ' ').toLowerCase().includes(s)
        );
      })
    : enrollments;

  const patch = async (id: string, status: EnrollmentStatus) => {
    setLoading(id);
    setOpenDropdown(null);
    await fetch(`/api/admin/enrollments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setLoading(null);
    router.refresh();
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('admin.enrollment.searchPlaceholder')}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent bg-white"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Tanggal', 'Nama Siswa', 'Email / WA', 'Kelas', 'Detail Singkat', 'Status', 'Aksi'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map(e => {
                const notes = parseNotes(e.notes);
                const entries = Object.entries(notes);
                // Show only first 2 notes for short preview
                const previewEntries = entries.slice(0, 2);
                
                return (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(e.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        {e.user.nama}
                        {needsPlacementTest(e.notes) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200">
                            <FileQuestion size={11} /> Ambil Ujian
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      <div>{e.user.email}</div>
                      {e.user.noWhatsapp && <div className="text-green-600">{e.user.noWhatsapp}</div>}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                      {TIPE_LABEL[e.kelas.tipe] ?? e.kelas.tipe}<br />
                      <span className="text-xs text-gray-400">{e.kelas.tingkat.replace('_', ' ')}</span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500 max-w-[200px]">
                      {entries.length === 0 ? '—' : (
                <ul className="space-y-0.5">
                  {previewEntries.map(([k, v]) => (
                    <li key={k}>
                      <span className="text-gray-400">{k}:</span> {typeof v === 'string' ? v.slice(0, 30) : v}
                      {typeof v === 'string' && v.length > 30 ? '...' : ''}
                    </li>
                  ))}
                </ul>
              )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[e.status]}`}>
                        {e.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {e.status === 'PENDING_PAYMENT' && (
                          <button
                            onClick={() => patch(e.id, e.kelas.tipe === 'PRIVAT' ? 'ACTIVE' : 'WAITING')}
                            disabled={loading === e.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue text-white text-xs font-semibold rounded-lg hover:bg-brand-blue/90 transition disabled:opacity-50"
                          >
                            <CheckCircle2 size={13} />
                            {loading === e.id ? 'Memproses...' : 'Verifikasi'}
                          </button>
                        )}
                        {e.status === 'REFUND_REQUESTED' && (
                          <button
                            onClick={() => patch(e.id, 'REFUNDED')}
                            disabled={loading === e.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                          >
                            {loading === e.id ? 'Memproses...' : 'Konfirmasi Refund'}
                          </button>
                        )}
                        {e.status !== 'PENDING_PAYMENT' && e.status !== 'REFUND_REQUESTED' && (
                          <div className="relative">
                            <button
                              onClick={() => setOpenDropdown(openDropdown === e.id ? null : e.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-gray-600 text-xs rounded-lg hover:bg-gray-50 transition"
                            >
                              Ubah <ChevronDown size={12} />
                            </button>
                            {openDropdown === e.id && (
                              <div className="absolute right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-10 py-1 min-w-[180px]">
                                {ALL_STATUSES.filter(s => s !== e.status).map(s => (
                                  <button
                                    key={s}
                                    onClick={() => patch(e.id, s)}
                                    className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 text-gray-700"
                                  >
                                    → {s.replace(/_/g, ' ')}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        {entries.length > 0 && (
                          <button
                            onClick={() => setSelectedEnrollment(e)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-gray-500 hover:text-gray-800 text-xs"
                          >
                            <Eye size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">
                  {search ? 'Tidak ada hasil pencarian.' : 'Belum ada pendaftaran.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedEnrollment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{t('admin.enrollment.detailTitle')}</h2>
              <button onClick={() => setSelectedEnrollment(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('admin.enrollment.siswa')}</h3>
                <div className="text-sm text-gray-900">{selectedEnrollment.user.nama}</div>
                <div className="text-xs text-gray-500">{selectedEnrollment.user.email}</div>
                {selectedEnrollment.user.noWhatsapp && <div className="text-xs text-green-600">{selectedEnrollment.user.noWhatsapp}</div>}
              </div>
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('admin.enrollment.kelas')}</h3>
                <div className="text-sm text-gray-900">
                  {TIPE_LABEL[selectedEnrollment.kelas.tipe] ?? selectedEnrollment.kelas.tipe}
                </div>
                <div className="text-xs text-gray-500">{selectedEnrollment.kelas.tingkat.replace('_', ' ')}</div>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('admin.enrollment.detailLengkap')}</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  {Object.entries(parseNotes(selectedEnrollment.notes)).map(([k, v]) => (
                    <div key={k} className="text-xs">
                      <span className="text-gray-400 font-medium">{k}:</span>
                      <span className="text-gray-800 ml-1">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
