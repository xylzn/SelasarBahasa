'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const artikelSchema = z.object({
  judul: z.string().min(1, 'Judul harus diisi'),
  slug: z.string().min(1, 'Slug harus diisi'),
  ringkasan: z.string().max(300, 'Ringkasan maksimal 300 karakter').optional(),
  isi: z.string().min(1, 'Isi artikel harus diisi'),
  thumbnailUrl: z.string().optional(),
  kategori: z.string().optional(),
  metaTitle: z.string().max(60, 'Meta title maksimal 60 karakter').optional(),
  metaDescription: z.string().max(160, 'Meta description maksimal 160 karakter').optional(),
  published: z.boolean().default(false),
});

type ArtikelFormValues = z.infer<typeof artikelSchema>;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

interface ArtikelFormProps {
  articleId?: string;
  initialData?: any;
}

export default function ArtikelForm({ articleId, initialData }: ArtikelFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<any>({
    resolver: zodResolver(artikelSchema as any),
    defaultValues: {
      judul: initialData?.judul || '',
      slug: initialData?.slug || '',
      ringkasan: initialData?.ringkasan || '',
      isi: initialData?.isi || '',
      thumbnailUrl: initialData?.thumbnailUrl || '',
      kategori: initialData?.kategori || '',
      metaTitle: initialData?.metaTitle || '',
      metaDescription: initialData?.metaDescription || '',
      published: initialData?.published || false,
    },
  });

  const judul = watch('judul');
  const slug = watch('slug');
  const [slugLocked, setSlugLocked] = useState(false);

  // Auto-generate slug from judul if not locked
  useEffect(() => {
    if (!slugLocked && judul && !articleId) {
      setValue('slug', slugify(judul));
    }
  }, [judul, slugLocked, setValue, articleId]);

  // If we have initialData, lock the slug
  useEffect(() => {
    if (initialData) {
      setSlugLocked(true);
    }
  }, [initialData]);

  const onSubmit = async (data: ArtikelFormValues) => {
    setIsLoading(true);
    try {
      const url = articleId ? `/api/artikel/${articleId}` : '/api/artikel';
      const method = articleId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push('/admin/artikel');
        router.refresh();
      } else {
        const errData = await res.json();
        throw new Error(errData.error || 'Gagal menyimpan artikel');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {articleId ? 'Edit Artikel' : 'Tambah Artikel Baru'}
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
          <input
            type="text"
            {...register('judul')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Masukkan judul artikel"
          />
          {errors.judul && (
            <p className="text-sm text-red-600 mt-1">{(errors.judul as any)?.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <div className="flex gap-2">
            <input
              type="text"
              {...register('slug')}
              disabled={slugLocked}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50"
              placeholder="slug-artikel"
            />
            <button
              type="button"
              onClick={() => setSlugLocked(!slugLocked)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              {slugLocked ? 'Unlock' : 'Lock'}
            </button>
          </div>
          {errors.slug && (
            <p className="text-sm text-red-600 mt-1">{(errors.slug as any)?.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ringkasan</label>
          <textarea
            {...register('ringkasan')}
            maxLength={300}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-h-24"
            placeholder="Ringkasan artikel (max 300 karakter)"
          ></textarea>
          {errors.ringkasan && (
            <p className="text-sm text-red-600 mt-1">{(errors.ringkasan as any)?.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Isi Artikel</label>
          <textarea
            {...register('isi')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-h-64"
            placeholder="Tulis isi artikel di sini (Markdown didukung)"
          ></textarea>
          {errors.isi && (
            <p className="text-sm text-red-600 mt-1">{(errors.isi as any)?.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
            <input
              type="text"
              {...register('thumbnailUrl')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <input
              type="text"
              {...register('kategori')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Kategori artikel"
            />
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Title
                <span className={`ml-2 text-xs ${
                  (watch('metaTitle')?.length || 0) > 60 ? 'text-red-600' : 'text-gray-400'
                }`}>
                  {watch('metaTitle')?.length || 0}/60
                </span>
              </label>
              <input
                type="text"
                {...register('metaTitle')}
                maxLength={60}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Meta title untuk SEO"
              />
              {errors.metaTitle && (
                <p className="text-sm text-red-600 mt-1">{(errors.metaTitle as any)?.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description
                <span className={`ml-2 text-xs ${
                  (watch('metaDescription')?.length || 0) > 160 ? 'text-red-600' : 'text-gray-400'
                }`}>
                  {watch('metaDescription')?.length || 0}/160
                </span>
              </label>
              <textarea
                {...register('metaDescription')}
                maxLength={160}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Meta description untuk SEO"
              ></textarea>
              {errors.metaDescription && (
                <p className="text-sm text-red-600 mt-1">{(errors.metaDescription as any)?.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="artikel-published"
            {...register('published')}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="artikel-published" className="text-sm font-medium text-gray-700">
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
            {isLoading ? 'Saving...' : 'Simpan Artikel'}
          </button>
        </div>
      </form>
    </div>
  );
}
