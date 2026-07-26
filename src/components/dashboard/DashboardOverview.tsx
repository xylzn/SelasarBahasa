'use client';

import { useEffect, useState } from 'react';
import {
  BookOpen, FileQuestion, CheckCircle2, TrendingUp,
  HelpCircle, ArrowRight, Clock, Users, AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useLocale } from '@/components/providers/LocaleProvider';
import { translateTipeKelas, translateTingkatBipa, formatDate } from '@/lib/i18n-format';

interface Kelas {
  id: string;
  nama?: string;
  tipe: 'REGULER' | 'PRIVAT' | 'ANAK_REMAJA';
  tingkat: string;
  status: 'WAITING_LIST' | 'ONGOING' | 'COMPLETED';
  minKuota: number;
}

interface Enrollment {
  id: string;
  status: 'PENDING_PAYMENT' | 'WAITING' | 'ACTIVE' | 'COMPLETED' | 'REFUND_REQUESTED' | 'REFUNDED';
  kelas: Kelas;
}

interface DashboardOverviewProps {
  totalMateri: number;
  totalQuiz: number;
  recentAttempts: any[];
  completedMateriCount: number;
  enrolledCount?: number; // total students in same kelas
}

const getScoreBadgeClass = (score: number | null) => {
  if (score === null) return 'bg-gray-100 text-gray-600';
  if (score >= 80) return 'bg-green-100 text-green-700';
  if (score >= 60) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
};

export default function DashboardOverview({
  totalMateri,
  totalQuiz,
  recentAttempts,
  completedMateriCount,
  enrolledCount = 0,
}: DashboardOverviewProps) {
  const { t, locale } = useLocale();
  const [enrollment, setEnrollment] = useState<Enrollment | null | undefined>(undefined);

  useEffect(() => {
    fetch('/api/enrollment/me')
      .then((r) => r.json())
      .then((data) => setEnrollment(data.enrollment ?? null))
      .catch(() => setEnrollment(null));
  }, []);

  const progressPercentage =
    totalMateri > 0 ? Math.round((completedMateriCount / totalMateri) * 100) : 0;

  // Still loading enrollment
  if (enrollment === undefined) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── NO ENROLLMENT ──────────────────────────────────────────────────────────
  if (enrollment === null) {    return (
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{t('dashboard.title')}</h1>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
            <BookOpen size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{t('dashboard.noEnrollment')}</h2>
          <p className="text-gray-500 max-w-sm text-sm">{t('dashboard.noEnrollmentDesc')}</p>
          <Link
            href="/#packages"
            className="mt-2 inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-600/90 transition-colors"
          >
            {t('dashboard.choosePlan')}
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  const tipeLabel = translateTipeKelas(enrollment.kelas.tipe, t);
  const tingkatLabel = translateTingkatBipa(enrollment.kelas.tingkat, t);
  const kelasLabel = `${tipeLabel} — ${tingkatLabel}`;

  // ── PENDING_PAYMENT ────────────────────────────────────────────────────────
  if (enrollment.status === 'PENDING_PAYMENT') {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{t('dashboard.title')}</h1>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-green-100 flex-shrink-0">
              <AlertCircle size={24} className="text-green-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-base">{t('dashboard.overview.waitingPayment')}</p>
              <p className="text-sm text-gray-600 mt-1">
                Kelas: <strong>{kelasLabel}</strong>
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {t('dashboard.overview.waitingPaymentDesc')}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/refund"
            className="self-start inline-flex items-center gap-2 px-4 py-2.5 border border-red-300 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors"
          >
            <AlertCircle size={16} />
            {t('dashboard.requestRefund')}
          </Link>
        </div>
      </div>
    );
  }

  // ── WAITING ────────────────────────────────────────────────────────────────
  if (enrollment.status === 'WAITING') {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{t('dashboard.title')}</h1>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-amber-100 flex-shrink-0">
              <Clock size={24} className="text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-base">
                {t('dashboard.waitingTitle', { kelas: kelasLabel })}
              </p>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                <Users size={16} className="text-amber-500" />
                <span>
                  {t('dashboard.waitingQuota', {
                    current: enrolledCount,
                    min: enrollment.kelas.minKuota,
                  })}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{t('dashboard.waitingDesc')}</p>
            </div>
          </div>

          <Link
            href="/dashboard/refund"
            className="self-start inline-flex items-center gap-2 px-4 py-2.5 border border-red-300 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors"
          >
            <AlertCircle size={16} />
            {t('dashboard.requestRefund')}
          </Link>
        </div>
      </div>
    );
  }

  // ── COMPLETED (Alumni) ─────────────────────────────────────────────────────
  if (enrollment.status === 'COMPLETED') {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{t('dashboard.title')}</h1>
        </div>

        {/* Congratulatory banner */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl flex-shrink-0">🎉</div>
            <div>
              <p className="font-extrabold text-gray-900 text-xl mb-1">
                {t('dashboard.overview.completedTitle')}
              </p>
              <p className="text-sm text-gray-700 mb-1">
                <strong>{tingkatLabel}</strong>
                {enrollment.kelas.nama ? ` — ${enrollment.kelas.nama}` : ''}
              </p>
              <p className="text-sm text-gray-500">
                Kamu kini memiliki <strong>{t('dashboard.overview.lifetimeAccess')}</strong>.
                {t('dashboard.overview.completedDesc')}
              </p>
            </div>
          </div>
          <div className="mt-5">
            <Link
              href="/register-package/reguler"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-600/90 transition"
            >
              {t('dashboard.overview.completedButton')} <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Progress stats (read-only) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="p-3 rounded-xl bg-green-100 inline-flex mb-4">
              <BookOpen size={24} className="text-green-600" />
            </div>
            <p className="text-3xl font-extrabold text-gray-900">
              {completedMateriCount}
              <span className="text-lg font-medium text-gray-500"> / {totalMateri}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">{t('dashboard.completedMaterials')}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="p-3 rounded-xl bg-green-100 inline-flex mb-4">
              <CheckCircle2 size={24} className="text-green-600" />
            </div>
            <p className="text-3xl font-extrabold text-gray-900">{recentAttempts.length}</p>
            <p className="text-sm text-gray-500 mt-1">{t('dashboard.quizzesTaken')}</p>
          </div>
        </div>
      </div>
    );
  }

  // ── ACTIVE ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{t('dashboard.title')}</h1>
        <p className="text-gray-600">{t('dashboard.subtitle')}</p>
      </div>

      {/* Active class badge */}
      <div className="mb-6 flex items-center gap-4 bg-green-50 border border-green-200 rounded-2xl p-5">
        <div className="p-3 rounded-xl bg-green-100 flex-shrink-0">
          <BookOpen size={22} className="text-green-600" />
        </div>
        <div>
          <p className="text-xs font-semibold text-green-600 uppercase tracking-widest mb-0.5">
            {t('dashboard.activeClass')}
          </p>
          <p className="font-bold text-green-800">{kelasLabel}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="p-3 rounded-xl bg-green-100 inline-flex mb-4">
            <BookOpen size={24} className="text-green-600" />
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{totalMateri}</p>
          <p className="text-sm text-gray-500 mt-1">{t('dashboard.totalMaterials')}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="p-3 rounded-xl bg-orange-100 inline-flex mb-4">
            <FileQuestion size={24} className="text-orange-500" />
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{totalQuiz}</p>
          <p className="text-sm text-gray-500 mt-1">{t('dashboard.totalQuizzes')}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="p-3 rounded-xl bg-green-100 inline-flex mb-4">
            <CheckCircle2 size={24} className="text-green-600" />
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{recentAttempts.length}</p>
          <p className="text-sm text-gray-500 mt-1">{t('dashboard.quizzesTaken')}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="p-3 rounded-xl bg-green-100 inline-flex mb-4">
            <TrendingUp size={24} className="text-green-600" />
          </div>
          <p className="text-3xl font-extrabold text-gray-900">
            {completedMateriCount}{' '}
            <span className="text-lg font-medium text-gray-500">/ {totalMateri}</span>
          </p>
          <p className="text-sm text-gray-500 mt-1 mb-3">{t('dashboard.completedMaterials')}</p>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recent Quizzes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.recentQuizzes')}</h2>
        {recentAttempts.length > 0 ? (
          <div className="space-y-3">
            {recentAttempts.map((attempt) => (
              <div key={attempt.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <HelpCircle size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{attempt.quiz.judul}</p>
                    <p className="text-sm text-gray-500">
                      {attempt.completedAt
                        ? formatDate(attempt.completedAt, locale)
                        : t('dashboard.overview.notFinished')}
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
            <Link
              href="/dashboard/quiz"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-600/90 transition-colors"
            >
              {t('dashboard.takeQuiz')}
              <ArrowRight size={20} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
