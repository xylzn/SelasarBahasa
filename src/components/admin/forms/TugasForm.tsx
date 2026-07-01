'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { uploadFileToSupabase } from '@/lib/supabase-storage';

const tugasSchema = z.object({
  judul: z.string().min(1, 'Judul harus diisi'),
  slug: z.string().optional(),
  instruksi: z.string().min(1, 'Instruksi harus diisi'),
  kelas: z.enum(['DASAR', 'MENENGAH', 'LANJUTAN']).default('DASAR'),
  isPremium: z.boolean().default(false),
  deadline: z.string().optional(),
  urutan: z.number().default(0),
  published: z.boolean().default(true),
});

type TugasFormValues = z.infer<typeof tugasSchema>;

interface TugasFormProps {
  initialData?: any;
}

export default function TugasForm({ initialData }: TugasFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [keepExistingFile, setKeepExistingFile] = useState(!!initialData?.fileInstruksiUrl);

  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<any>({
    resolver: zodResolver(tugasSchema as any),
    defaultValues: initialData ? {
      judul: initialData.judul,
      slug: initialData.slug,
      instruksi: initialData.instruksi,
      kelas: initialData.kelas,
      isPremium: initialData.isPremium,
      deadline: initialData.deadline ? new Date(initialData.deadline).toISOString().slice(0, 16) : '',
      urutan: initialData.urutan,
      published: initialData.published,
    } : {
      kelas: 'DASAR',
      isPremium: false,
      published: true,
      urutan: 0,
    },
  });

  const onSubmit = async (data: TugasFormValues) => {
    setIsLoading(true);
    setUploadProgress('Menyiapkan...');

    try {
      let fileInstruksiUrl = initialData?.fileInstruksiUrl || null;
      
      if (selectedFile) {
        setUploadProgress('Mengunggah file...');
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);
        
        const uploadRes = await fetch('/api/upload/tugas', {
          method: 'POST',
          body: uploadFormData,
        });
        
        if (!uploadRes.ok) {
          const errData = await uploadRes.json();
          throw new Error(errData.error || 'Gagal upload file');
        }
        
        const uploadResult = await uploadRes.json();
        fileInstruksiUrl = uploadResult.url;
      } else if (!keepExistingFile) {
        fileInstruksiUrl = null;
      }

      const tugasData = {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : null,
        fileInstruksiUrl,
      };

      const res = await fetch(isEditing ? `/api/tugas/${initialData.id}` : '/api/tugas', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tugasData),
      });

      if (res.ok) {
        setUploadProgress('Berhasil!');
        router.push('/admin/tugas');
        router.refresh();
      } else {
        const errData = await res.json();
        throw new Error(errData.error || `Gagal ${isEditing ? 'mengedit' : 'menambah'} tugas`);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
      setUploadProgress('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-6">{isEditing ? 'Edit Tugas' : 'Tambah Tugas Baru'}</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
          <input
            type="text"
            {...register('judul')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Masukkan judul tugas"
          />
          {errors.judul && (
            <p className="text-sm text-red-600 mt-1">{(errors.judul as any).message}</p>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline (opsional)</label>
            <input
              type="datetime-local"
              {...register('deadline')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Instruksi</label>
          <textarea
            {...register('instruksi')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-h-32"
            placeholder="Masukkan instruksi tugas"
          ></textarea>
          {errors.instruksi && (
            <p className="text-sm text-red-600 mt-1">{(errors.instruksi as any).message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">File Instruksi (opsional)</label>
          {initialData?.fileInstruksiUrl && (
            <div className="mb-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={keepExistingFile}
                  onChange={(e) => setKeepExistingFile(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Pertahankan file yang ada</span>
              </label>
              {keepExistingFile && (
                <a
                  href={initialData.fileInstruksiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm ml-6"
                >
                  Lihat file yang ada
                </a>
              )}
            </div>
          )}
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          {selectedFile && (
            <p className="text-sm text-gray-600 mt-1">File terpilih: {selectedFile.name}</p>
          )}
        </div>

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
              Tugas Premium
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

        {uploadProgress && (
          <div className="p-4 bg-blue-50 text-blue-700 rounded-lg">
            {uploadProgress}
          </div>
        )}

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
            {isLoading ? 'Saving...' : 'Simpan Tugas'}
          </button>
        </div>
      </form>
    </div>
  );
}
