'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const packageSchema = z.object({
  nama: z.string().min(1, 'Nama harus diisi'),
  deskripsi: z.string().min(1, 'Deskripsi harus diisi'),
  harga: z.number().int().min(0, 'Harga harus positif'),
  durasiBulan: z.number().int().min(1, 'Durasi minimal 1 bulan'),
  fiturList: z.array(z.string().min(1, 'Fitur harus diisi')).min(1, 'Minimal 1 fitur'),
  isPopuler: z.boolean().default(false),
  urutan: z.number().default(0),
  published: z.boolean().default(true),
});

type PackageFormValues = z.infer<typeof packageSchema>;

interface PackageFormProps {
  packageId?: string;
  initialData?: any;
}

export default function PackageForm({ packageId, initialData }: PackageFormProps) {
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
    resolver: zodResolver(packageSchema as any),
    defaultValues: {
      nama: initialData?.nama || '',
      deskripsi: initialData?.deskripsi || '',
      harga: initialData?.harga || 0,
      durasiBulan: initialData?.durasiBulan || 1,
      fiturList: initialData?.fiturList || [''],
      isPopuler: initialData?.isPopuler || false,
      urutan: initialData?.urutan || 0,
      published: initialData?.published || true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'fiturList',
  });

  // Watch harga for live preview
  const harga = watch('harga');

  // Fetch existing package for edit mode
  useEffect(() => {
    async function fetchPackage() {
      if (packageId) {
        const res = await fetch(`/api/admin/packages/${packageId}`);
        if (res.ok) {
          const pkg = await res.json();
          setValue('nama', pkg.nama);
          setValue('deskripsi', pkg.deskripsi);
          setValue('harga', pkg.harga);
          setValue('durasiBulan', pkg.durasiBulan);
          setValue('fiturList', pkg.fiturList);
          setValue('isPopuler', pkg.isPopuler);
          setValue('urutan', pkg.urutan);
          setValue('published', pkg.published);
        }
      }
    }
    fetchPackage();
  }, [packageId, setValue]);

  const onSubmit = async (data: PackageFormValues) => {
    setIsLoading(true);
    try {
      // Filter out empty fitur
      const filteredFiturList = data.fiturList.filter((f) => f.trim() !== '');

      const payload = {
        ...data,
        fiturList: filteredFiturList,
        isActive: true,
      };

      const url = packageId ? `/api/admin/packages/${packageId}` : '/api/admin/packages';
      const method = packageId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push('/admin/packages');
        router.refresh();
      } else {
        const errData = await res.json();
        throw new Error(errData.error || 'Gagal menyimpan paket');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {packageId ? 'Edit Paket' : 'Tambah Paket Baru'}
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Paket</label>
          <input
            type="text"
            {...register('nama')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Nama paket"
          />
          {errors.nama && (
            <p className="text-sm text-red-600 mt-1">{(errors.nama as any)?.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
          <textarea
            {...register('deskripsi')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-h-24"
            placeholder="Deskripsi paket"
          ></textarea>
          {errors.deskripsi && (
            <p className="text-sm text-red-600 mt-1">{(errors.deskripsi as any)?.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Harga</label>
            <input
              type="number"
              {...register('harga', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="150000"
            />
            {harga && (
              <p className="text-sm text-gray-600 mt-1">Preview: {formatRupiah(harga)}</p>
            )}
            {errors.harga && (
              <p className="text-sm text-red-600 mt-1">{(errors.harga as any)?.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Durasi (Bulan)</label>
            <input
              type="number"
              {...register('durasiBulan', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="1"
            />
            {errors.durasiBulan && (
              <p className="text-sm text-red-600 mt-1">{(errors.durasiBulan as any)?.message}</p>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Fitur</label>
            <button
              type="button"
              onClick={() => append('')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              + Tambah Fitur
            </button>
          </div>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <input
                  type="text"
                  {...register(`fiturList.${index}`)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder={`Fitur ${index + 1}`}
                />
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-red-600 hover:bg-red-50 transition"
                  >
                    x
                  </button>
                )}
              </div>
            ))}
          </div>
          {errors.fiturList && (
            <p className="text-sm text-red-600 mt-1">{(errors.fiturList as any)?.message}</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="package-populer"
              {...register('isPopuler')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="package-populer" className="text-sm font-medium text-gray-700">
              Paket Populer
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="package-published"
              {...register('published')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="package-published" className="text-sm font-medium text-gray-700">
              Terbitkan
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
          <input
            type="number"
            {...register('urutan', { valueAsNumber: true })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="0"
          />
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
            {isLoading ? 'Saving...' : 'Simpan Paket'}
          </button>
        </div>
      </form>
    </div>
  );
}
