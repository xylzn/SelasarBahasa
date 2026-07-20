'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const contactFormSchema = z.object({
  nama: z.string().min(1, 'Nama harus diisi'),
  email: z.string().email('Email tidak valid'),
  pesan: z.string().min(1, 'Pesan harus diisi'),
});

type FormValues = z.infer<typeof contactFormSchema>;

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(contactFormSchema),
  });

  // Logic tidak diubah sama sekali
  const onSubmit = async (data: FormValues) => {
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Gagal mengirim pesan');

      setStatus('success');
      reset();
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    // Tidak ada card wrapper di sini — dikelola oleh ContactSection
    <div>
      {status === 'success' && (
        <div className="mb-5 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2 text-sm">
          <CheckCircle2 size={18} />
          Pesan berhasil dikirim! Kami akan segera menghubungi Anda.
        </div>
      )}

      {status === 'error' && (
        <div className="mb-5 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle size={18} />
          Gagal mengirim pesan. Silakan coba lagi.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama</label>
          <input
            {...register('nama')}
            type="text"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition text-sm"
            placeholder="Masukkan nama Anda"
          />
          {errors.nama && (
            <p className="text-xs text-red-600 mt-1">{errors.nama.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input
            {...register('email')}
            type="email"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition text-sm"
            placeholder="Masukkan email Anda"
          />
          {errors.email && (
            <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Pesan</label>
          <textarea
            {...register('pesan')}
            rows={5}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition text-sm resize-none"
            placeholder="Tulis pesan Anda..."
          />
          {errors.pesan && (
            <p className="text-xs text-red-600 mt-1">{errors.pesan.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-brand-blue text-white py-3.5 rounded-xl font-semibold hover:bg-brand-blue/90 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {status === 'loading' ? 'Mengirim...' : 'Kirim Pesan'}
        </button>
      </form>
    </div>
  );
}
