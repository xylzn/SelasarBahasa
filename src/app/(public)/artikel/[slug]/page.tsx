import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { generateArticleJsonLd } from '@/lib/seo';

export const revalidate = 3600;

async function getArticle(slug: string) {
  const article = await prisma.article.findUnique({
    where: { slug, published: true },
  });

  if (!article) notFound();

  return article;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getArticle(params.slug);

  return {
    title: article.metaTitle || article.judul,
    description: article.metaDescription || article.ringkasan,
    openGraph: {
      title: article.metaTitle || article.judul,
      description: article.metaDescription || article.ringkasan,
      images: article.ogImageUrl || article.thumbnailUrl ? [
        article.ogImageUrl || article.thumbnailUrl,
      ] : [],
      type: 'article',
      publishedTime: article.publishedAt?.toISOString(),
      url: `https://selasarbahasa.com/artikel/${article.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.metaTitle || article.judul,
      description: article.metaDescription || article.ringkasan,
      images: article.ogImageUrl || article.thumbnailUrl,
    },
    alternates: {
      canonical: `https://selasarbahasa.com/artikel/${article.slug}`,
    },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getArticle(params.slug);
  const jsonLd = generateArticleJsonLd(article);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/artikel"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-8"
          >
            <ArrowLeft size={18} />
            Kembali ke artikel
          </Link>

          <header className="mb-8">
            {article.kategori && (
              <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
                {article.kategori}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {article.judul}
            </h1>
            {article.publishedAt && (
              <p className="text-gray-500">
                Dipublikasikan pada{' '}
                {new Date(article.publishedAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            )}
          </header>

          {article.thumbnailUrl && (
            <img
              src={article.thumbnailUrl}
              alt={article.judul}
              className="w-full h-64 md:h-96 object-cover rounded-xl mb-8"
            />
          )}

          <div
            className="prose prose-lg max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: article.konten }}
          />
        </div>
      </article>
    </div>
  );
}
