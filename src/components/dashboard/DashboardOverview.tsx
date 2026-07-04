'use client';

import { BookOpen, FileQuestion, CheckCircle2, TrendingUp, HelpCircle, ArrowRight, Crown, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from '@/components/providers/LocaleProvider';
import { useSession } from 'next-auth/react';

interface DashboardOverviewProps {
  totalMateri: number;
  totalQuiz: number;
  recentAttempts: any[];
  completedMateriCount: number;
}

export default function DashboardOverview({
  totalMateri,
  totalQuiz,
  recentAttempts,
  completedMateriCount,
}: DashboardOverviewProps) {
  const { t } = useLocale();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const premiumExpiresAt = session?.user?.premiumExpiresAt
    ? new Date(session.user.premiumExpiresAt)
    : null;

  // Days remaining for premium
  const daysLeft = premiumExpiresAt
    ? Math.ceil((premiumExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  // Calculate progress percentage
  const progressPercentage = totalMateri > 0 ? Math.round((completedMateriCount / totalMateri) * 100) : 0;

  // Get score badge color
  const getScoreBadgeClass = (score: number | null) => {
    if (score === null) return 'bg-gray-100 text-gray-600';
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{t('dashboard.title')}</h1>
        <p className="text-gray-600">{t('dashboard.subtitle')}</p>
      </div>

      {/* Premium Status Badge — shown for PREMIUM and USER roles only */}
      {role === 'PREMIUM' && (
        <div className="mb-6 flex items-center gap-4 bg-gradient-to-r from-brand-orange/10 to-amber-50 border border-brand-orange/30 rounded-2xl p-5">
          <div className="flex-shrink-0 p-3 rounded-xl bg-brand-orange/15">
            <Crown size={24} className="text-brand-orange" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-base">Kamu Premium 🎉</p>
            {premiumExpiresAt ? (
              <p className="text-sm text-gray-600 mt-0.5">
                Berlaku hingga{' '}
                <span className="font-semibold text-gray-800">
                  {premiumExpiresAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                {daysLeft !== null && daysLeft <= 30 && daysLeft > 0 && (
                  <span className="ml-2 text-amber-600 font-semibold">({daysLeft} hari lagi)</span>
                )}
                {daysLeft !== null && daysLeft <= 0 && (
                  <span className="ml-2 text-red-500 font-semibold">(sudah habis)</span>
                )}
              </p>
            ) : (
              <p className="text-sm text-gray-600 mt-0.5">Berlaku selamanya</p>
            )}
          </div>
        </div>
      )}

      {role === 'USER' && (
        <div className="mb-6 flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-2xl p-5">
          <div className="flex-shrink-0 p-3 rounded-xl bg-brand-blue/10">
            <Sparkles size={24} className="text-brand-blue" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 text-sm">Upgrade ke Premium untuk akses penuh</p>
            <p className="text-xs text-gray-500 mt-0.5">Buka semua materi, quiz, dan tugas eksklusif.</p>
          </div>
          <Link
            href="/#packages"
            className="flex-shrink-0 px-4 py-2 bg-brand-orange text-white text-sm font-bold rounded-xl hover:bg-brand-orange/90 transition-colors"
          >
            Lihat Paket
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Total Materi */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-brand-blue/10">
              <BookOpen size={24} className="text-brand-blue" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{totalMateri}</p>
          <p className="text-sm text-gray-500 mt-1">{t('dashboard.totalMaterials')}</p>
        </div>

        {/* Total Quiz */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-brand-orange/10">
              <FileQuestion size={24} className="text-brand-orange" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{totalQuiz}</p>
          <p className="text-sm text-gray-500 mt-1">{t('dashboard.totalQuizzes')}</p>
        </div>

        {/* Quiz Diambil */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-green-100">
              <CheckCircle2 size={24} className="text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{recentAttempts.length}</p>
          <p className="text-sm text-gray-500 mt-1">{t('dashboard.quizzesTaken')}</p>
        </div>

        {/* Materi Selesai */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-purple-100">
              <TrendingUp size={24} className="text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">
            {completedMateriCount} <span className="text-lg font-medium text-gray-500">/ {totalMateri}</span>
          </p>
          <p className="text-sm text-gray-500 mt-1 mb-3">{t('dashboard.completedMaterials')}</p>
          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-blue rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recent Quizzes or Empty State */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.recentQuizzes')}</h2>

        {recentAttempts.length > 0 ? (
          <div className="space-y-3">
            {recentAttempts.map((attempt) => (
              <div key={attempt.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                    <HelpCircle size={20} className="text-brand-blue" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{attempt.quiz.judul}</p>
                    <p className="text-sm text-gray-500">
                      {attempt.completedAt ? new Date(attempt.completedAt).toLocaleDateString('id-ID') : 'Belum selesai'}
                    </p>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-bold ${getScoreBadgeClass(attempt.score)}`}>
                  {attempt.score ?? '-'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <HelpCircle size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">{t('dashboard.noQuizzes')}</p>
            <Link href="/dashboard/quiz" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-blue/90 transition-colors">
              {t('dashboard.takeQuiz')}
              <ArrowRight size={20} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
