import prisma from '@/lib/prisma';
import ArtikelPageClient from '@/components/public/ArtikelPageClient';

export const revalidate = 3600;

export const metadata = {
  title: 'Artikel - SelasarBahasa',
  description: 'Baca artikel tips dan trik belajar bahasa',
};

const FEATURED_ARTICLE_SLUG = 'bagaimana-cara-mengajarkan-bipa-pada-pertemuan-pertama-1';

async function getFeaturedArticle() {
  try {
    return await prisma.article.findFirst({
      where: {
        slug: FEATURED_ARTICLE_SLUG,
        published: true,
      },
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
    console.error('Failed to fetch featured article during build/render', error);
    return null;
  }
}

async function getArticles(kategori?: string) {
  try {
    return await prisma.article.findMany({
      where: {
        published: true,
        slug: { not: FEATURED_ARTICLE_SLUG },
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

  const [featured, articles, categories] = await Promise.all([
    getFeaturedArticle(),
    getArticles(activeCategory ?? undefined),
    getCategories(),
  ]);

  const serializedFeatured = featured
    ? {
        ...featured,
        publishedAt: featured.publishedAt ? featured.publishedAt.toISOString() : null,
      }
    : null;

  const serializedArticles = articles.map((a) => ({
    ...a,
    publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
  }));

  return (
    <ArtikelPageClient
      featured={serializedFeatured}
      articles={serializedArticles}
      categories={categories}
      activeCategory={activeCategory}
    />
  );
}
