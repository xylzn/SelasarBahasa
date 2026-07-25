import prisma from '@/lib/prisma';
import ArtikelPageClient from '@/components/public/ArtikelPageClient';

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
  searchParams: Promise<{ kategori?: string }>;
}) {
  const { kategori } = await searchParams;
  const activeCategory = kategori ?? null;

  const [articles, categories] = await Promise.all([
    getArticles(activeCategory ?? undefined),
    getCategories(),
  ]);

  const serializedArticles = articles.map((a) => ({
    ...a,
    publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
  }));

  return (
    <ArtikelPageClient
      articles={serializedArticles}
      categories={categories}
      activeCategory={activeCategory}
    />
  );
}
