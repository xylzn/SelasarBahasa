'use client';

import { Users, BookOpen, FileQuestion, FileText, MessageSquare, TrendingUp, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from '@/components/providers/LocaleProvider';
import HomepageVisitsChart from './HomepageVisitsChart';

interface TopArticle {
  id: string;
  judul: string;
  slug: string;
  views: number;
}

interface DailyVisit {
  date: string;
  count: number;
}

interface AdminDashboardOverviewProps {
  totalUsers: number;
  totalMateri: number;
  totalQuiz: number;
  totalArtikel: number;
  unreadMessages: number;
  topArticles: TopArticle[];
  homepageVisits: DailyVisit[];
}

export default function AdminDashboardOverview({
  totalUsers,
  totalMateri,
  totalQuiz,
  totalArtikel,
  unreadMessages,
  topArticles,
  homepageVisits,
}: AdminDashboardOverviewProps) {
  const { t } = useLocale();

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{t('admin.title')}</h1>
        <p className="text-gray-600">{t('admin.subtitle')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
        {/* Total Pengguna */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-brand-blue/10">
              <Users size={24} className="text-brand-blue" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{totalUsers}</p>
          <p className="text-sm text-gray-500 mt-1">{t('admin.totalUsers')}</p>
        </div>

        {/* Total Materi */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-brand-orange/10">
              <BookOpen size={24} className="text-brand-orange" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{totalMateri}</p>
          <p className="text-sm text-gray-500 mt-1">{t('admin.totalMaterials')}</p>
        </div>

        {/* Total Quiz */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-green-100">
              <FileQuestion size={24} className="text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{totalQuiz}</p>
          <p className="text-sm text-gray-500 mt-1">{t('admin.totalQuizzes')}</p>
        </div>

        {/* Total Artikel */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-purple-100">
              <FileText size={24} className="text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{totalArtikel}</p>
          <p className="text-sm text-gray-500 mt-1">{t('admin.totalArticles')}</p>
        </div>

        {/* Pesan Belum Dibaca (clickable) */}
        <Link href="/admin/messages" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-red-100">
              <MessageSquare size={24} className="text-red-600" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{unreadMessages}</p>
          <p className="text-sm text-gray-500 mt-1">{t('admin.unreadMessages')}</p>
        </Link>
      </div>

      {/* 50/50 Grid: Chart + Top Articles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Homepage Visits Chart */}
        <HomepageVisitsChart data={homepageVisits} />

        {/* Right: Top Articles by Views */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-brand-orange" />
            <h2 className="text-lg font-semibold text-gray-900">Artikel Paling Banyak Diakses</h2>
          </div>
          {topArticles.length > 0 ? (
            <ol className="space-y-3">
              {topArticles.map((article, index) => (
                <li key={article.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <span
                    className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-extrabold ${
                      index === 0
                        ? 'bg-brand-orange text-white'
                        : index === 1
                        ? 'bg-gray-700 text-white'
                        : index === 2
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{article.judul}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-bold text-gray-700">
                      {article.views.toLocaleString('id-ID')} views
                    </span>
                    <Link
                      href={`/artikel/${article.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-brand-blue hover:bg-brand-blue/10 transition-colors"
                      title="Buka artikel"
                    >
                      <ExternalLink size={15} />
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-gray-500 py-4 text-center">Belum ada artikel yang diakses.</p>
          )}
        </div>
      </div>
    </div>
  );
}
