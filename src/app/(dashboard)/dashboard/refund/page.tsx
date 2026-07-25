'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const schema = z.object({
  alasan: z.string().min(10, 'Alasan minimal 10 karakter'),
  rekening: z.string().min(5, 'Isi informasi rekening / e-wallet untuk pengembalian dana'),
});
type FormValues = z.infer<typeof schema>;

export default function RefundPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setStatus('loading');
    const res = await fetch('/api/enrollment/refund', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alasan: data.alasan, rekening: data.rekening }),
    });
    if (res.ok) {
      setStatus('success');
    } else {
      const d = await res.json();
      setErrorMsg(d.error || 'Gagal mengirim pengajuan.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="max-w-lg mx-auto p-8">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 flex flex-col items-center text-center gap-4">
          <CheckCircle2 size={48} className="text-green-500" />
          <h2 className="text-xl font-bold text-gray-900">Pengajuan Refund Berhasil Dikirim</h2>
          <p className="text-gray-500 text-sm">
            Tim admin akan meninjau permintaanmu dan menghubungi melalui email.
          </p>
          <Link href="/dashboard" className="mt-2 px-6 py-2.5 bg-brand-blue text-white rounded-xl font-semibold text-sm hover:bg-brand-blue/90 transition">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Ajukan Refund</h1>
      <p className="text-gray-500 text-sm mb-8">
        Isi alasan refund. Admin akan menerima notifikasi dan menghubungimu segera.
      </p>

      {status === 'error' && (
        <div className="mb-5 p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-2 text-sm border border-red-100">
          <AlertCircle size={18} className="flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Alasan Refund
          </label>
          <textarea
            {...register('alasan')}
            rows={5}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none text-sm resize-none"
            placeholder="Jelaskan alasan kamu mengajukan refund..."
          />
          {errors.alasan && (
            <p className="text-xs text-red-600 mt-1">{errors.alasan.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Rekening / E-Wallet untuk Pengembalian Dana
          </label>
          <input
            {...register('rekening')}
            type="text"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none text-sm"
            placeholder="Contoh: BCA 1234567890 a.n. Nama Lengkap"
          />
          {errors.rekening && (
            <p className="text-xs text-red-600 mt-1">{errors.rekening.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full py-3.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50 text-sm"
        >
          {status === 'loading' ? 'Mengirim...' : 'Kirim Pengajuan Refund'}
        </button>
      </form>
    </div>
  );
}
