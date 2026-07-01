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
  options: z.array(quizOptionSchema).min(2, 'Setiap pertanyaan harus memiliki setidaknya 2 opsi').max(6),
});

const quizSchema = z.object({
  judul: z.string().min(1, 'Judul harus diisi'),
  deskripsi: z.string().min(1, 'Deskripsi harus diisi'),
  isPremium: z.boolean().default(false),
  published: z.boolean().default(true),
  questions: z.array(quizQuestionSchema).min(1, 'Quiz harus memiliki setidaknya 1 pertanyaan'),
});

type QuizFormValues = z.infer<typeof quizSchema>;

interface QuizFormProps {
  quizId?: string;
  initialData?: any;
}

export default function QuizForm({ quizId, initialData }: QuizFormProps) {
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
      judul: initialData?.judul || '',
      deskripsi: initialData?.deskripsi || '',
      isPremium: initialData?.isPremium || false,
      published: initialData?.published || true,
      questions: initialData?.questions || [
        {
          pertanyaan: '',
          urutan: 0,
          options: [
            { teks: '', isCorrect: true },
            { teks: '', isCorrect: false },
            { teks: '', isCorrect: false },
            { teks: '', isCorrect: false },
          ],
        },
      ],
    },
  });

  const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control,
    name: 'questions',
  });

  // Helper to get options array for a question
  const getQuestionOptions = (qIndex: number) => {
    const questions = watch('questions') || [];
    return questions[qIndex]?.options || [];
  };

  // Helper to add option to a question
  const addOption = (qIndex: number) => {
    const currentOptions = getQuestionOptions(qIndex);
    if (currentOptions.length >= 6) return;
    const newOptions = [...currentOptions, { teks: '', isCorrect: false }];
    setValue(`questions.${qIndex}.options`, newOptions);
  };

  // Helper to remove option from a question
  const removeOption = (qIndex: number, oIndex: number) => {
    const currentOptions = getQuestionOptions(qIndex);
    if (currentOptions.length <= 2) return;
    const newOptions = currentOptions.filter((_: any, idx: number) => idx !== oIndex);
    // If we removed the correct answer, make the first one correct
    if (currentOptions[oIndex]?.isCorrect && newOptions.length > 0) {
      newOptions[0].isCorrect = true;
    }
    setValue(`questions.${qIndex}.options`, newOptions);
  };

  const onSubmit = async (data: QuizFormValues) => {
    setIsLoading(true);
    try {
      const url = quizId ? `/api/quiz/${quizId}` : '/api/quiz';
      const method = quizId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
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
      <h2 className="text-xl font-bold text-gray-900 mb-6">{quizId ? 'Edit Quiz' : 'Tambah Quiz Baru'}</h2>
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
                appendQuestion({
                  pertanyaan: '',
                  urutan: questionFields.length,
                  options: [
                    { teks: '', isCorrect: true },
                    { teks: '', isCorrect: false },
                    { teks: '', isCorrect: false },
                    { teks: '', isCorrect: false },
                  ],
                })
              }
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              + Tambah Pertanyaan
            </button>
          </div>

          {questionFields.map((field, qIndex) => {
            const options = getQuestionOptions(qIndex);
            return (
              <div key={field.id} className="border border-gray-200 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Pertanyaan {qIndex + 1}</h4>
                  {questionFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
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
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Opsi Jawaban</label>
                    {options.length < 6 && (
                      <button
                        type="button"
                        onClick={() => addOption(qIndex)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        + Tambah Opsi
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {options.map((_: any, oIndex: number) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={watch(`questions.${qIndex}.options.${oIndex}.isCorrect`)}
                          onChange={() => {
                            const newOptions = options.map((opt: any, idx: number) => ({
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
                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(qIndex, oIndex)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-red-600 hover:bg-red-50"
                          >
                            x
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
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
