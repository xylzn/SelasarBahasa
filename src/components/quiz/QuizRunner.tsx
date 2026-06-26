'use client';

import { useState } from 'react';

interface QuizOption {
  id: string;
  teks: string;
}

interface QuizQuestion {
  id: string;
  pertanyaan: string;
  options: QuizOption[];
}

interface QuizRunnerProps {
  questions: QuizQuestion[];
  onSubmit: (answers: Record<string, string>) => Promise<void>;
  isLoading: boolean;
}

export default function QuizRunner({ questions, onSubmit, isLoading }: QuizRunnerProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Pertanyaan {currentIndex + 1} dari {questions.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {currentQuestion.pertanyaan}
        </h2>
        <div className="space-y-3">
          {currentQuestion.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelectOption(currentQuestion.id, option.id)}
              disabled={isLoading}
              className={`w-full text-left p-4 rounded-lg border-2 transition ${
                answers[currentQuestion.id] === option.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {option.teks}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0 || isLoading}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sebelumnya
        </button>
        {currentIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? 'Menyimpan...' : 'Selesai'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={isLoading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Selanjutnya
          </button>
        )}
      </div>
    </div>
  );
}
