'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X, AlertCircle, Plus, Play, Camera } from 'lucide-react';
import Image from 'next/image';
import SafeImage from '@/components/shared/SafeImage';
import { useLocale } from '@/components/providers/LocaleProvider';

// Define media schema
const mediaSchema = z.object({
  url: z.string().min(1, 'URL media harus diisi'),
  tipe: z.enum(['FOTO', 'VIDEO']),
});

const schema = z.object({
  judul: z.string().min(1, 'Judul harus diisi'),
  deskripsi: z.string().min(1, 'Deskripsi harus diisi'),
  media: z.array(mediaSchema).min(1, 'Minimal satu media harus diisi'),
});
type FormValues = z.infer<typeof schema>;

interface AktivitasFormProps {
  itemId?: string;
  initialData?: Partial<FormValues & {
    media?: { url: string; tipe: 'FOTO' | 'VIDEO' }[];
  }>;
}

// Helper to get YouTube embed URL
function getYouTubeEmbedUrl(url: string) {
  let videoId = '';
  const match1 = url.match(/youtube\.com\/watch\?v=([^&]+)/);
  const match2 = url.match(/youtu\.be\/([^?]+)/);
  if (match1) videoId = match1[1];
  else if (match2) videoId = match2[1];
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?controls=0&modestbranding=1&rel=0&disablekb=1`;
  }
  return url;
}

export default function AktivitasForm({ itemId, initialData }: AktivitasFormProps) {
  const router = useRouter();
  const { t } = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue, control, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      judul: initialData?.judul ?? '',
      deskripsi: initialData?.deskripsi ?? '',
      media: initialData?.media ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'media',
  });

  async function handleFileUpload(file: File) {
    setUploadError(null);
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload/aktivitas-media', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload gagal');
      
      // Auto-detect type from mime
      const tipe = file.type.startsWith('video/') ? 'VIDEO' : 'FOTO';
      append({ url: data.url, tipe });
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
    }
  }

  function handleAddVideoUrl(url: string) {
    append({ url, tipe: 'VIDEO' });
  }

  const onSubmit = async (data: FormValues) => {
    setSubmitError(null);
    setIsLoading(true);
    try {
      const url = itemId ? `/api/admin/aktivitas-kita/${itemId}` : '/api/admin/aktivitas-kita';
      const method = itemId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? 'Gagal menyimpan');
      }
      router.push('/admin/aktivitas-kita');
      router.refresh();
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {itemId ? 'Edit Aktivitas' : 'Tambah Aktivitas Kita'}
      </h2>

      {submitError && (
        <div className="mb-5 p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-2 text-sm border border-red-100">
          <AlertCircle size={16} /> {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Judul */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin.forms.aktivitas.judul')}</label>
          <input
            type="text"
            {...register('judul')}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none text-sm"
            placeholder={t('admin.forms.aktivitas.judulPlaceholder')}
          />
          {errors.judul && <p className="text-xs text-red-600 mt-1">{errors.judul.message}</p>}
        </div>

        {/* Deskripsi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('common.description')}</label>
          <textarea
            {...register('deskripsi')}
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none text-sm resize-none"
            placeholder={t('admin.forms.aktivitas.deskripsiPlaceholder')}
          />
          {errors.deskripsi && <p className="text-xs text-red-600 mt-1">{errors.deskripsi.message}</p>}
        </div>

        {/* Media List */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin.forms.aktivitas.media')}</label>
          
          {/* Existing media */}
          <div className="space-y-3 mb-4">
            {fields.map((field, index) => {
              const mediaItem = watch(`media.${index}`);
              const spanClass = mediaItem?.tipe === "FOTO"
                ? "bg-brand-blue-light text-brand-blue"
                : "bg-brand-orange-light text-brand-orange";
              return (
                <div key={field.id} className="border border-gray-200 rounded-xl p-3 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${spanClass}`}>
                      {mediaItem?.tipe === "FOTO" ? <Camera size={10} /> : <Play size={10} />}
                      {mediaItem?.tipe === "FOTO" ? "Foto" : "Video"}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  {/* Media preview */}
                  {mediaItem?.tipe === "FOTO" ? (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden">
                      <SafeImage src={mediaItem.url} alt={t('admin.forms.aktivitas.preview')} fill className="object-cover" unoptimized />
                    </div>
                  ) : (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                      <iframe
                        src={getYouTubeEmbedUrl(mediaItem?.url || "")}
                        className="w-full h-full"
                        title={t('admin.forms.aktivitas.videoPreview')}
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Upload Foto */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin.forms.aktivitas.tambahFoto')}</label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f); }}
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl py-6 cursor-pointer hover:border-brand-blue hover:bg-brand-blue-light/20 transition bg-gray-50"
            >
              <Upload size={20} className="text-brand-blue mb-2" />
              <p className="text-sm text-gray-600 font-medium">
                {isUploading ? "Mengupload..." : "Drag & drop atau klik untuk pilih foto"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPG, PNG, WEBP — maks. 2MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
              />
            </div>
            {uploadError && <p className="text-xs text-red-600 mt-1">{uploadError}</p>}
          </div>

          {/* Tambah Video URL */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin.forms.aktivitas.tambahLinkVideo')}</label>
            <div className="flex gap-2">
              <input
                ref={(input) => {
                  if (input) {
                    (input as any).handleAdd = (url: string) => handleAddVideoUrl(url);
                  }
                }}
                type="url"
                placeholder={t('admin.forms.aktivitas.videoUrlPlaceholder')}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const input = e.target as HTMLInputElement;
                    if (input.value) {
                      handleAddVideoUrl(input.value);
                      input.value = "";
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  const input = (e.target as HTMLButtonElement).parentElement?.querySelector('input')!;
                  if (input.value) {
                    handleAddVideoUrl(input.value);
                    input.value = "";
                  }
                }}
                className="px-4 py-3 bg-brand-blue text-white rounded-xl hover:bg-brand-blue/90 transition text-sm font-semibold flex items-center gap-1"
              >
                <Plus size={16} /> Tambah
              </button>
            </div>
          </div>

          {errors.media && <p className="text-xs text-red-600 mt-1">{errors.media.message}</p>}
        </div>

        <div className="flex gap-4 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isLoading || isUploading}
            className="px-6 py-3 rounded-lg bg-brand-blue text-white hover:bg-brand-blue/90 transition disabled:opacity-50 text-sm font-semibold"
          >
            {isLoading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}
