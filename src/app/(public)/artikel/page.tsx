import prisma from '@/lib/prisma';
import ArticleCard from '@/components/public/ArticleCard';

export const revalidate = 3600;

export const metadata = {
  title: 'Artikel - SelasarBahasa',
  description: 'Baca artikel tips dan trik belajar bahasa',
};

async function getArticles(searchParams: { kategori?: string }) {
  return await prisma.article.findMany({
    where: {
      published: true,
      ...(searchParams.kategori && { kategori: searchParams.kategori }),
    },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      judul: true,
      slug: true,
      ringkasan: true,
      thumbnailUrl: true,
      kategori: true,
      publishedAt: true,
    },
  });
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: { kategori?: string };
}) {
  const articles = await getArticles(searchParams);

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Artikel</h1>
          <p className="text-gray-600">
            Temukan tips dan trik belajar bahasa terlengkap
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
        {articles.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">Belum ada artikel.</p>
          </div>
        )}
      </div>
    </div>
  );
}
