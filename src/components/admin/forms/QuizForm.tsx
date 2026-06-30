'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const quizOptionSchema = z.object({
  id: z.string().optional(),
  teks: z.string().min(1, 'Teks opsi harus diisi'),
  isCorrect: z.boolean().default(false),
});

const quizQuestionSchema = z.object({
  id: z.string().optional(),
  pertanyaan: z.string().min(1, 'Pertanyaan harus diisi'),
  urutan: z.number().default(0),
  options: z.array(quizOptionSchema).min(2, 'Setiap pertanyaan harus memiliki setidaknya 2 opsi'),
});

const quizSchema = z.object({
  judul: z.string().min(1, 'Judul harus diisi'),
  deskripsi: z.string().min(1, 'Deskripsi harus diisi'),
  isPremium: z.boolean().default(false),
  published: z.boolean().default(true),
  questions: z.array(quizQuestionSchema).min(1, 'Quiz harus memiliki setidaknya 1 pertanyaan'),
});

type QuizFormValues = z.infer<typeof quizSchema>;

export default function QuizForm() {
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
    resolver: zodResolver(quizSchema as any),
    defaultValues: {
      isPremium: false,
      published: true,
      questions: [
        {
          pertanyaan: '',
          urutan: 0,
          options: [
            { teks: '', isCorrect: true },
            { teks: '', isCorrect: false },
          ],
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  const onSubmit = async (data: QuizFormValues) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push('/admin/quiz');
        router.refresh();
      } else {
        throw new Error('Gagal membuat quiz');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Tambah Quiz Baru</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
          <input
            type="text"
            {...register('judul')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Masukkan judul quiz"
          />
          {errors.judul && (
            <p className="text-sm text-red-600 mt-1">{(errors.judul as any).message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
          <textarea
            {...register('deskripsi')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-h-20"
            placeholder="Deskripsi quiz"
          ></textarea>
          {errors.deskripsi && (
            <p className="text-sm text-red-600 mt-1">{(errors.deskripsi as any).message}</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="quiz-premium"
              {...register('isPremium')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="quiz-premium" className="text-sm font-medium text-gray-700">
              Quiz Premium
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="quiz-published"
              {...register('published')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="quiz-published" className="text-sm font-medium text-gray-700">
              Terbitkan
            </label>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Pertanyaan</h3>
            <button
              type="button"
              onClick={() =>
                append({
                  pertanyaan: '',
                  urutan: fields.length,
                  options: [
                    { teks: '', isCorrect: true },
                    { teks: '', isCorrect: false },
                  ],
                })
              }
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              + Tambah Pertanyaan
            </button>
          </div>

          {fields.map((field, qIndex) => (
            <div key={field.id} className="border border-gray-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Pertanyaan {qIndex + 1}</h4>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(qIndex)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Hapus
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teks Pertanyaan</label>
                <textarea
                  {...register(`questions.${qIndex}.pertanyaan`)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Masukkan pertanyaan"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opsi Jawaban</label>
                <div className="space-y-2">
                  {watch(`questions.${qIndex}.options`).map((_: any, oIndex: number) => (
                    <div key={oIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={watch(`questions.${qIndex}.options.${oIndex}.isCorrect`)}
                        onChange={() => {
                          const newOptions = watch(`questions.${qIndex}.options`).map((opt: any, idx: number) => ({
                            ...opt,
                            isCorrect: idx === oIndex,
                          }));
                          setValue(`questions.${qIndex}.options`, newOptions);
                        }}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        {...register(`questions.${qIndex}.options.${oIndex}.teks`)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder={`Opsi ${oIndex + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
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
            {isLoading ? 'Saving...' : 'Simpan Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
}
