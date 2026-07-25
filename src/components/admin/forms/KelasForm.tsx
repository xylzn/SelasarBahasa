'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, X } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';

const schema = z.object({
  nama: z.string().min(1, 'Nama kelas harus diisi'),
  tipe: z.enum(['REGULER', 'PRIVAT', 'ANAK_REMAJA']),
  tingkat: z.enum(['BIPA_1', 'BIPA_2', 'BIPA_3', 'BIPA_4', 'BIPA_5', 'BIPA_6']),
  status: z.enum(['WAITING_LIST', 'ONGOING', 'COMPLETED']),
  minKuota: z.coerce.number().int().min(1, 'Minimal 1'),
});
type FormValues = z.infer<typeof schema>;

const SEL = 'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none text-sm bg-white';

export default function KelasForm({
  kelasId,
  initialData,
}: {
  kelasId?: string;
  initialData?: Partial<FormValues>;
}) {
  const router = useRouter();
  const { t } = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Inline confirmation modal state (replaces window.confirm)
  const [pendingData, setPendingData] = useState<FormValues | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      // Fix: always use initialData value so edit pre-populates correctly
      nama: initialData?.nama ?? '',
      tipe: initialData?.tipe ?? 'REGULER',
      tingkat: initialData?.tingkat ?? 'BIPA_1',
      status: initialData?.status ?? 'WAITING_LIST',
      minKuota: initialData?.minKuota ?? 5,
    },
  });

  const doSave = async (data: FormValues) => {
    setSubmitError(null);
    setIsLoading(true);
    try {
      const url = kelasId ? `/api/admin/kelas/${kelasId}` : '/api/admin/kelas';
      const res = await fetch(url, {
        method: kelasId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Gagal menyimpan'); }
      router.push('/admin/kelas');
      router.refresh();
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    // Intercept COMPLETED transition — show custom modal, no window.confirm()
    if (data.status === 'COMPLETED' && initialData?.status !== 'COMPLETED') {
      setPendingData(data);
      return;
    }
    await doSave(data);
  };

  return (
    <>
      <div className="max-w-lg mx-auto bg-white p-8 rounded-xl border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {kelasId ? 'Edit Kelas' : 'Tambah Kelas Baru'}
        </h2>

        {submitError && (
          <div className="mb-5 p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-2 text-sm border border-red-100">
            <AlertCircle size={16} /> {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.forms.kelas.namaKelas')}</label>
            <input type="text" {...register('nama')} className={SEL} placeholder={t('admin.forms.kelas.namaKelasPlaceholder')} />
            {errors.nama && <p className="text-xs text-red-600 mt-1">{errors.nama.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('adminShared.tipeKelas')}</label>
            <select {...register('tipe')} className={SEL}>
              <option value="REGULER">{t('adminShared.reguler')}</option>
              <option value="PRIVAT">{t('adminShared.privat')}</option>
              <option value="ANAK_REMAJA">{t('adminShared.anakRemaja')}</option>
            </select>
            {errors.tipe && <p className="text-xs text-red-600 mt-1">{errors.tipe.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('adminShared.tingkatBipa')}</label>
            <select {...register('tingkat')} className={SEL}>
              {['BIPA_1','BIPA_2','BIPA_3','BIPA_4','BIPA_5','BIPA_6'].map(v => (
                <option key={v} value={v}>{t(`adminShared.${v.toLowerCase().replace('_', '')}` as any)}</option>
              ))}
            </select>
            {errors.tingkat && <p className="text-xs text-red-600 mt-1">{errors.tingkat.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.status')}</label>
            <select {...register('status')} className={SEL}>
              <option value="WAITING_LIST">{t('admin.forms.kelas.waitingList')}</option>
              <option value="ONGOING">{t('admin.forms.kelas.ongoing')}</option>
              <option value="COMPLETED">{t('admin.forms.kelas.completed')}</option>
            </select>
            {errors.status && <p className="text-xs text-red-600 mt-1">{errors.status.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.forms.kelas.minimumKuota')}</label>
            <input type="number" {...register('minKuota')} min={1} className={SEL} />
            {errors.minKuota && <p className="text-xs text-red-600 mt-1">{errors.minKuota.message}</p>}
          </div>

          <div className="flex gap-4 pt-2">
            <button type="button" onClick={() => router.back()}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm">
              Batal
            </button>
            <button type="submit" disabled={isLoading}
              className="px-6 py-2.5 rounded-lg bg-brand-blue text-white hover:bg-brand-blue/90 transition disabled:opacity-50 text-sm font-semibold">
              {isLoading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>

      {/* Inline confirmation modal — replaces window.confirm() */}
      {pendingData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">{t('admin.forms.kelas.tutupKelasConfirm')}</h3>
              <button onClick={() => setPendingData(null)} className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 text-sm text-red-800">
              Menutup kelas ini akan mengubah status semua siswa aktif menjadi{' '}
              <strong>{t('admin.forms.kelas.lulusCompleted')}</strong>. Siswa hanya akan memiliki akses baca materi (Read-Only)
              dan tidak bisa lagi mengirim tugas. Lanjutkan?
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setPendingData(null)}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={() => { const d = pendingData; setPendingData(null); doSave(d); }}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold disabled:opacity-50"
              >
                {isLoading ? 'Menyimpan...' : 'Ya, Tutup Kelas'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
