'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import QuizRunner from '@/components/quiz/QuizRunner';
import QuizResult from '@/components/quiz/QuizResult';

interface QuizOption {
  id: string;
  teks: string;
}

interface QuizQuestion {
  id: string;
  pertanyaan: string;
  options: QuizOption[];
}

interface QuizData {
  id: string;
  judul: string;
  deskripsi: string;
  questions: QuizQuestion[];
}

interface QuizBreakdownItem {
  questionId: string;
  pertanyaan: string;
  jawabanUser: string | null;
  isCorrect: boolean;
  jawabanBenar: string;
}

interface QuizSubmitResponse {
  score: number;
  breakdown: QuizBreakdownItem[];
}

export default function QuizDetailPage({ params }: { params: { id: string } }) {
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [result, setResult] = useState<QuizSubmitResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`/api/quiz/${params.id}`);
        if (!res.ok) throw new Error('Quiz tidak ditemukan');
        const data = await res.json();
        setQuiz(data);
      } catch (err) {
        setError('Gagal memuat quiz');
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuiz();
  }, [params.id]);

  const handleSubmit = async (answers: Record<string, string>) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/quiz/${params.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jawaban: answers }),
      });
      if (!res.ok) throw new Error('Gagal menyimpan jawaban');
      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert('Gagal menyimpan jawaban, silakan coba lagi');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8">{error}</div>;
  if (!quiz) return notFound();

  if (result) {
    return (
      <div className="p-8">
        <QuizResult score={result.score} breakdown={result.breakdown} />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{quiz.judul}</h1>
        <p className="text-gray-600">{quiz.deskripsi}</p>
      </div>
      <QuizRunner
        questions={quiz.questions}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
}
