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
    <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Hubungi Kami</h3>

      {status === 'success' && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
          <CheckCircle2 size={20} />
          Pesan berhasil dikirim! Kami akan segera menghubungi Anda.
        </div>
      )}

      {status === 'error' && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          Gagal mengirim pesan. Silakan coba lagi.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
          <input
            {...register('nama')}
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Masukkan nama Anda"
          />
          {errors.nama && (
            <p className="text-sm text-red-600 mt-1">{errors.nama.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            {...register('email')}
            type="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Masukkan email Anda"
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pesan</label>
          <textarea
            {...register('pesan')}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Tulis pesan Anda..."
          />
          {errors.pesan && (
            <p className="text-sm text-red-600 mt-1">{errors.pesan.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Mengirim...' : 'Kirim Pesan'}
        </button>
      </form>
    </div>
  );
}
