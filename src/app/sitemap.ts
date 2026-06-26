import prisma from '@/lib/prisma';

export default async function sitemap() {
  const baseUrl = 'https://selasarbahasa.com';

  const articles = await prisma.article.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });

  const articlesUrls = articles.map((article) => ({
    url: `${baseUrl}/artikel/${article.slug}`,
    lastModified: article.updatedAt,
  }));

  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/artikel`,
      lastModified: new Date(),
    },
  ];

  return [...staticUrls, ...articlesUrls];
}
