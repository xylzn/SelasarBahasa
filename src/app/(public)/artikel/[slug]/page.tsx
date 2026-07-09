import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import SafeImage from '@/components/shared/SafeImage';
import { ArrowLeft, Calendar, Eye, Tag, Share2, MessageCircle } from 'lucide-react';
import { generateArticleJsonLd } from '@/lib/seo';
import CopyLinkButton from '@/components/public/CopyLinkButton';

export const revalidate = 3600;

async function getArticle(slug: string) {
  try {
    const article = await prisma.article.findUnique({
      where: { slug, published: true },
    });

    if (!article) notFound();

    return article;
  } catch (error) {
    console.error("Failed to fetch article during build/render", error);
    // If DB fails, we can still show 404 to prevent build crash
    notFound();
  }
}

async function getRelatedArticles(articleId: string, slug: string, kategori: string | null) {
  try {
    let related: { id: string; judul: string; slug: string; thumbnailUrl: string | null; publishedAt: Date | null }[] = [];

    // First: try same category, exclude current article by id
    if (kategori) {
      related = await prisma.article.findMany({
        where: { published: true, kategori, id: { not: articleId } },
        orderBy: { publishedAt: 'desc' },
        take: 3,
        select: { id: true, judul: true, slug: true, thumbnailUrl: true, publishedAt: true },
      });
    }

    // Fallback: fill with recent articles if not enough, exclude by id
    if (related.length < 3) {
      const needed = 3 - related.length;
      const existingIds = [articleId, ...related.map((a) => a.id)];
      const fallback = await prisma.article.findMany({
        where: { published: true, id: { notIn: existingIds } },
        orderBy: { publishedAt: 'desc' },
        take: needed,
        select: { id: true, judul: true, slug: true, thumbnailUrl: true, publishedAt: true },
      });
      related = [...related, ...fallback];
    }

    return related;
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

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
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  const jsonLd = generateArticleJsonLd(article);
  const relatedArticles = await getRelatedArticles(article.id, article.slug, article.kategori);

  // Fire-and-forget: increment views without blocking page render
  prisma.article
    .update({ where: { slug: article.slug }, data: { views: { increment: 1 } } })
    .catch((err) => console.error('Failed to increment article views:', err));

  const articleUrl = `https://selasarbahasa.com/artikel/${article.slug}`;
  const waText = encodeURIComponent(`${article.judul} — ${articleUrl}`);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="py-12 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Back button */}
          <div className="mb-6">
            <Link
              href="/artikel"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-blue font-medium text-sm transition-colors"
            >
              <ArrowLeft size={16} />
              Kembali ke Artikel
            </Link>
          </div>

          {/* 2-column layout on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* ── Main Content (2/3) ── */}
            <article className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                {/* Cover image */}
                {article.thumbnailUrl && (
                  <div className="relative w-full h-56 sm:h-72 md:h-96">
                    <SafeImage
                      src={article.thumbnailUrl}
                      alt={article.judul}
                      fill
                      className="object-cover"
                      placeholderClassName="absolute inset-0 bg-gray-100"
                      priority
                    />
                  </div>
                )}

                <div className="p-6 sm:p-8">
                  {/* Meta bar: category + date + views */}
                  <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
                    {article.kategori && (
                      <span className="inline-flex items-center gap-1.5 bg-brand-blue-light text-brand-blue px-3 py-1 rounded-full font-semibold text-xs">
                        <Tag size={12} />
                        {article.kategori}
                      </span>
                    )}
                    {article.publishedAt && (
                      <span className="inline-flex items-center gap-1.5 text-gray-500 text-xs">
                        <Calendar size={12} />
                        {new Date(article.publishedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-gray-400 text-xs">
                      <Eye size={12} />
                      {(article.views ?? 0).toLocaleString('id-ID')} views
                    </span>
                  </div>

                  {/* Title */}
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-blue-dark leading-tight mb-5">
                    {article.judul}
                  </h1>

                  {/* Share buttons */}
                  <div className="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                    <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                      <Share2 size={13} /> Bagikan:
                    </span>
                    <CopyLinkButton url={articleUrl} />
                    <a
                      href={`https://wa.me/?text=${waText}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold transition-all"
                    >
                      <MessageCircle size={13} />
                      WhatsApp
                    </a>
                  </div>

                  {/* Article body */}
                  <div
                    className="prose prose-lg max-w-none text-gray-700 prose-headings:text-brand-blue-dark prose-a:text-brand-blue prose-strong:text-gray-900"
                    dangerouslySetInnerHTML={{ __html: article.isi }}
                  />
                </div>
              </div>
            </article>

            {/* ── Sidebar (1/3) ── */}
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:sticky lg:top-24">
                <h3 className="text-base font-bold text-brand-blue-dark mb-4">Artikel Terkait</h3>
                {relatedArticles.length > 0 ? (
                  <ul className="space-y-4">
                    {relatedArticles.map((rel) => (
                      <li key={rel.id}>
                        <Link href={`/artikel/${rel.slug}`} className="flex gap-3 group">
                          {rel.thumbnailUrl ? (
                            <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden">
                              <SafeImage
                                src={rel.thumbnailUrl}
                                alt={rel.judul}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                placeholderClassName="w-full h-full bg-gray-100"
                              />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-brand-blue-light" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-brand-blue transition-colors leading-snug">
                              {rel.judul}
                            </p>
                            {rel.publishedAt && (
                              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                <Calendar size={10} />
                                {new Date(rel.publishedAt).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </p>
                            )}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400">Belum ada artikel terkait.</p>
                )}

                <div className="mt-5 pt-4 border-t border-gray-100">
                  <Link
                    href="/artikel"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-semibold hover:bg-brand-blue/90 transition-colors"
                  >
                    Semua Artikel
                  </Link>
                </div>
              </div>
            </aside>

          </div>
        </div>
      </div>
    </div>
  );
}
