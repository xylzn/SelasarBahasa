import prisma from '@/lib/prisma';
import ArticleCard from '@/components/public/ArticleCard';
import Link from 'next/link';
import SafeImage from '@/components/shared/SafeImage';
import { Calendar, ArrowRight } from 'lucide-react';

export const revalidate = 3600;

export const metadata = {
  title: 'Artikel - SelasarBahasa',
  description: 'Baca artikel tips dan trik belajar bahasa',
};

async function getArticles(kategori?: string) {
  try {
    return await prisma.article.findMany({
      where: {
        published: true,
        ...(kategori && { kategori }),
      },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        judul: true,
        slug: true,
        ringkasan: true,
        thumbnailUrl: true,
        coverUrl: true,
        kategori: true,
        publishedAt: true,
      },
    });
  } catch (error) {
    console.error("Failed to fetch articles during build/render", error);
    return [];
  }
}

async function getCategories(): Promise<string[]> {
  try {
    const rows = await prisma.article.findMany({
      where: { published: true, kategori: { not: null } },
      select: { kategori: true },
      distinct: ['kategori'],
      orderBy: { kategori: 'asc' },
    });
    return rows.map((r) => r.kategori as string);
  } catch {
    return [];
  }
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: { kategori?: string };
}) {
  const activeCategory = searchParams.kategori ?? null;

  const [articles, categories] = await Promise.all([
    getArticles(activeCategory ?? undefined),
    getCategories(),
  ]);

  // Only split into featured + rest when NOT filtering by category
  const featured = !activeCategory ? (articles[0] ?? null) : null;
  const gridArticles = !activeCategory ? articles.slice(1) : articles;

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-brand-blue-dark mb-3">Artikel</h1>
          <p className="text-gray-500 text-lg">Temukan tips dan trik belajar bahasa terlengkap</p>
        </div>

        {/* Category Filter Pills */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            <Link
              href="/artikel"
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                !activeCategory
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-blue hover:text-brand-blue'
              }`}
            >
              Semua
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/artikel?kategori=${encodeURIComponent(cat)}`}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-brand-blue text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-blue hover:text-brand-blue'
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        )}

        {/* Empty state */}
        {articles.length === 0 && (
          <div className="text-center py-24">
            <p className="text-gray-400 text-lg">
              {activeCategory
                ? `Belum ada artikel dengan kategori "${activeCategory}".`
                : 'Belum ada artikel.'}
            </p>
            {activeCategory && (
              <Link href="/artikel" className="mt-4 inline-block text-brand-blue font-semibold hover:underline">
                Lihat semua artikel →
              </Link>
            )}
          </div>
        )}

        {/* Featured Post — only shown when not filtering */}
        {featured && (
          <Link href={`/artikel/${featured.slug}`} className="block group mb-12">
            <div className="relative w-full h-72 sm:h-96 lg:h-[480px] rounded-3xl overflow-hidden shadow-lg">
              {featured.coverUrl || featured.thumbnailUrl ? (
                <SafeImage
                  src={(featured.coverUrl || featured.thumbnailUrl) as string}
                  alt={featured.judul}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  placeholderClassName="absolute inset-0 bg-gradient-to-br from-brand-blue to-brand-blue-dark"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue to-brand-blue-dark" />
              )}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="bg-brand-orange text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    Featured
                  </span>
                  {featured.kategori && (
                    <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {featured.kategori}
                    </span>
                  )}
                  {featured.publishedAt && (
                    <span className="flex items-center gap-1 text-white/70 text-xs">
                      <Calendar size={12} />
                      {new Date(featured.publishedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-2 group-hover:text-brand-orange/90 transition-colors line-clamp-2">
                  {featured.judul}
                </h2>
                <p className="text-white/80 text-sm sm:text-base line-clamp-2 max-w-2xl mb-4">
                  {featured.ringkasan}
                </p>
                <span className="inline-flex items-center gap-2 text-brand-orange font-semibold text-sm group-hover:gap-3 transition-all">
                  Baca Selengkapnya <ArrowRight size={16} />
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* Articles grid */}
        {gridArticles.length > 0 && (
          <>
            <h2 className="text-xl font-bold text-brand-blue-dark mb-6">
              {activeCategory ? `Kategori: ${activeCategory}` : 'Artikel Terbaru'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gridArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
