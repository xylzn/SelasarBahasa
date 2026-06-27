'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const materiSchema = z.object({
  judul: z.string().min(1, 'Judul harus diisi'),
  slug: z.string().optional(),
  tipe: z.enum(['TEKS', 'VIDEO']),
  kelas: z.enum(['DASAR', 'MENENGAH', 'LANJUTAN']).default('DASAR'),
  kontenTeks: z.string().optional(),
  videoUrl: z.string().url('URL video tidak valid').optional(),
  isPremium: z.boolean().default(false),
  urutan: z.number().default(0),
  published: z.boolean().default(true),
});

type MateriFormValues = z.infer<typeof materiSchema>;

export default function MateriForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTipe, setSelectedTipe] = useState<'TEKS' | 'VIDEO'>('TEKS');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<MateriFormValues>({
    resolver: zodResolver(materiSchema),
    defaultValues: {
      tipe: 'TEKS',
      kelas: 'DASAR',
      isPremium: false,
      published: true,
      urutan: 0,
    },
  });

  const watchedTipe = watch('tipe');

  const onSubmit = async (data: MateriFormValues) => {
    setIsLoading(true);

    try {
      const res = await fetch('/api/materi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push('/admin/materi');
        router.refresh();
      } else {
        throw new Error('Gagal menambah materi');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Tambah Materi Baru</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
          <input
            type="text"
            {...register('judul')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Masukkan judul materi"
          />
          {errors.judul && (
            <p className="text-sm text-red-600 mt-1">{errors.judul.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug (opsional)</label>
          <input
            type="text"
            {...register('slug')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Slug URL (auto-generated jika kosong)"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
            <select
              {...register('tipe')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              onChange={(e) => setSelectedTipe(e.target.value as 'TEKS' | 'VIDEO')}
            >
              <option value="TEKS">Teks</option>
              <option value="VIDEO">Video</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
            <select
              {...register('kelas')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="DASAR">Dasar</option>
              <option value="MENENGAH">Menengah</option>
              <option value="LANJUTAN">Lanjutan</option>
            </select>
          </div>
        </div>

        {watchedTipe === 'TEKS' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Konten Teks</label>
            <textarea
              {...register('kontenTeks')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-h-32"
              placeholder="Masukkan konten materi dalam bentuk HTML"
            ></textarea>
            {errors.kontenTeks && (
              <p className="text-sm text-red-600 mt-1">{errors.kontenTeks.message}</p>
            )}
          </div>
        )}

        {watchedTipe === 'VIDEO' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL Video</label>
            <input
              type="url"
              {...register('videoUrl')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="https://www.youtube.com/watch?v=..."
            />
            {errors.videoUrl && (
              <p className="text-sm text-red-600 mt-1">{errors.videoUrl.message}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
            <input
              type="number"
              {...register('urutan', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="0"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="premium"
              {...register('isPremium')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="premium" className="text-sm font-medium text-gray-700">
              Materi Premium
            </label>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="published"
            {...register('published')}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="published" className="text-sm font-medium text-gray-700">
            Terbitkan
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Simpan Materi'}
          </button>
        </div>
      </form>
    </div>
  );
}
