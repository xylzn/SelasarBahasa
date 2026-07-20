'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { AlertCircle, Upload, Link2, X } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import Tiptap editor to avoid SSR issues
const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="border border-gray-300 rounded-xl min-h-[280px] bg-gray-50 animate-pulse" />
  ),
});

// ── Helper: strip HTML tags and collapse whitespace ───────────────────────────
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

// ── Zod schema ────────────────────────────────────────────────────────────────
// isi is HTML from Tiptap — we validate that it has actual text content
const artikelSchema = z.object({
  judul: z.string().min(1, 'Judul harus diisi'),
  slug: z.string().min(1, 'Slug harus diisi'),
  ringkasan: z.string().max(300, 'Ringkasan maksimal 300 karakter').optional(),
  isi: z
    .string()
    .refine((val) => stripHtml(val).length > 0, {
      message: 'Isi artikel harus diisi',
    }),
  thumbnailUrl: z.string().optional(),
  kategori: z.string().optional(),
  metaTitle: z.string().max(60, 'Meta title maksimal 60 karakter').optional(),
  metaDescription: z.string().max(160, 'Meta description maksimal 160 karakter').optional(),
  published: z.boolean().optional().default(false),
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
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Thumbnail upload state ────────────────────────────────────────────────
  const [thumbnailPreview, setThumbnailPreview] = useState<string>(
    initialData?.thumbnailUrl || ''
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ArtikelFormValues>({
    resolver: zodResolver(artikelSchema),
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
  const isiValue = watch('isi');
  const thumbnailUrl = watch('thumbnailUrl');
  const [slugLocked, setSlugLocked] = useState(!!initialData);

  // Auto-generate slug from judul if not locked and not editing
  useEffect(() => {
    if (!slugLocked && judul && !articleId) {
      setValue('slug', slugify(judul));
    }
  }, [judul, slugLocked, setValue, articleId]);

  // Sync preview when URL field is changed manually
  useEffect(() => {
    if (thumbnailUrl) setThumbnailPreview(thumbnailUrl);
  }, [thumbnailUrl]);

  // ── Thumbnail file upload ─────────────────────────────────────────────────
  async function handleFileUpload(file: File) {
    setUploadError(null);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload/artikel-thumbnail', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal upload gambar');
      setValue('thumbnailUrl', data.url);
      setThumbnailPreview(data.url);
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
    }
  }

  function handleFileDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const onSubmit = async (data: ArtikelFormValues) => {
    setSubmitError(null);
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
    } catch (err: any) {
      setSubmitError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Collect zod field errors into a single banner message after submit attempt
  const fieldErrors = Object.values(errors)
    .map((e) => (e as any)?.message)
    .filter(Boolean) as string[];

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {articleId ? 'Edit Artikel' : 'Tambah Artikel Baru'}
      </h2>

      {/* ── Error banner (shown on submit-attempt with validation failures) */}
      {fieldErrors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl flex items-start gap-2 border border-red-100 text-sm font-medium">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-1">Mohon lengkapi semua field yang wajib diisi:</p>
            <ul className="list-disc list-inside space-y-0.5 text-xs">
              {fieldErrors.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── Server / network error from submit */}
      {submitError && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-2 border border-red-100 text-sm font-medium">
          <AlertCircle size={18} className="flex-shrink-0" />
          {submitError}
        </div>
      )}

      {/* noValidate: disable browser-native validation popups */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">

        {/* Judul */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
          <input
            type="text"
            {...register('judul')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
            placeholder="Masukkan judul artikel"
          />
          {errors.judul && (
            <p className="text-sm text-red-600 mt-1">{(errors.judul as any)?.message}</p>
          )}
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <div className="flex gap-2">
            <input
              type="text"
              {...register('slug')}
              disabled={slugLocked}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none disabled:opacity-50"
              placeholder="slug-artikel"
            />
            <button
              type="button"
              onClick={() => setSlugLocked(!slugLocked)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
            >
              {slugLocked ? 'Unlock' : 'Lock'}
            </button>
          </div>
          {errors.slug && (
            <p className="text-sm text-red-600 mt-1">{(errors.slug as any)?.message}</p>
          )}
        </div>

        {/* Ringkasan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ringkasan</label>
          <textarea
            {...register('ringkasan')}
            maxLength={300}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none min-h-24 resize-none"
            placeholder="Ringkasan artikel (max 300 karakter)"
          />
          {errors.ringkasan && (
            <p className="text-sm text-red-600 mt-1">{(errors.ringkasan as any)?.message}</p>
          )}
        </div>

        {/* Isi Artikel — RichTextEditor (Tiptap) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Isi Artikel</label>
          <RichTextEditor
            value={isiValue}
            onChange={(html) => setValue('isi', html, { shouldValidate: true })}
          />
          {/* Hidden input so react-hook-form tracks the value */}
          <input type="hidden" {...register('isi')} />
          {errors.isi && (
            <p className="text-sm text-red-600 mt-1">{(errors.isi as any)?.message}</p>
          )}
        </div>

        {/* Thumbnail Upload + URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thumbnail Artikel
          </label>

          {/* Preview */}
          {thumbnailPreview && (
            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 mb-3">
              <Image
                src={thumbnailPreview}
                alt="Preview thumbnail"
                fill
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={() => {
                  setValue('thumbnailUrl', '');
                  setThumbnailPreview('');
                }}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow border border-gray-200 hover:bg-red-50 transition"
                aria-label="Hapus gambar"
              >
                <X size={14} className="text-red-500" />
              </button>
            </div>
          )}

          {/* Drop zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl py-8 px-4 cursor-pointer transition ${
              isUploading
                ? 'border-brand-blue/50 bg-brand-blue-light/30'
                : 'border-gray-300 bg-gray-50 hover:border-brand-blue hover:bg-brand-blue-light/20'
            }`}
          >
            <Upload size={24} className="text-brand-blue mb-2" />
            <p className="text-sm font-medium text-gray-700">
              {isUploading ? 'Mengupload...' : 'Drag & drop atau klik untuk pilih gambar'}
            </p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — maks. 2MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Manual URL fallback */}
          <div className="mt-3 flex items-center gap-2">
            <Link2 size={14} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              {...register('thumbnailUrl')}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
              placeholder="Atau paste URL gambar langsung (opsional)"
            />
          </div>
          {uploadError && (
            <p className="text-sm text-red-600 mt-1">{uploadError}</p>
          )}
        </div>

        {/* Kategori */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
          <input
            type="text"
            {...register('kategori')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
            placeholder="Kategori artikel"
          />
        </div>

        {/* SEO */}
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none resize-none"
                placeholder="Meta description untuk SEO"
              />
              {errors.metaDescription && (
                <p className="text-sm text-red-600 mt-1">
                  {(errors.metaDescription as any)?.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Published */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="artikel-published"
            {...register('published')}
            className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
          />
          <label htmlFor="artikel-published" className="text-sm font-medium text-gray-700">
            Terbitkan
          </label>
        </div>

        {/* Actions */}
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
            disabled={isLoading || isUploading}
            className="px-6 py-3 rounded-lg bg-brand-blue text-white hover:bg-brand-blue/90 transition disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Simpan Artikel'}
          </button>
        </div>
      </form>
    </div>
  );
}
