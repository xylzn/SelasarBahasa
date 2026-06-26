interface QuizBreakdownItem {
  questionId: string;
  pertanyaan: string;
  jawabanUser: string | null;
  isCorrect: boolean;
  jawabanBenar: string;
}

interface QuizResultProps {
  score: number;
  breakdown: QuizBreakdownItem[];
}

export default function QuizResult({ score, breakdown }: QuizResultProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <div className="text-7xl font-bold text-blue-600 mb-4">{score}</div>
        <p className="text-xl text-gray-600">
          {score >= 80 ? 'Luar biasa!' : score >= 60 ? 'Bagus!' : score >= 40 ? 'Lumayan!' : 'Masih bisa belajar lebih lagi!'}
        </p>
      </div>

      <div className="space-y-6">
        {breakdown.map((item, index) => (
          <div
            key={item.questionId}
            className={`p-6 rounded-xl border ${item.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                {index + 1}. {item.pertanyaan}
              </h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${item.isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                {item.isCorrect ? 'Benar' : 'Salah'}
              </span>
            </div>
            <div className="space-y-2">
              {item.jawabanUser && (
                <p className="text-sm text-gray-600">
                  Jawabanmu: <span className={item.isCorrect ? 'text-green-700' : 'text-red-700'}>{item.jawabanUser}</span>
                </p>
              )}
              {!item.isCorrect && (
                <p className="text-sm text-green-700">
                  Jawaban benar: {item.jawabanBenar}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
