import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

const BASE_URL = 'https://selasarbahasa.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ── Static routes ──────────────────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/artikel`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/kelas`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/aktivitas-kita`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/register`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // ── Dynamic: Artikel (published only) ─────────────────────────────────────
  const articles = await prisma.article.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
    orderBy: { publishedAt: 'desc' },
  });

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE_URL}/artikel/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // ── Dynamic: Aktivitas Kita ───────────────────────────────────────────────
  const aktivitas = await prisma.aktivitasKita.findMany({
    select: { id: true, updatedAt: true },
    orderBy: { createdAt: 'desc' },
  });

  const aktivitasRoutes: MetadataRoute.Sitemap = aktivitas.map((a) => ({
    url: `${BASE_URL}/aktivitas-kita/${a.id}`,
    lastModified: a.updatedAt,
    changeFrequency: 'yearly',
    priority: 0.5,
  }));

  return [...staticRoutes, ...articleRoutes, ...aktivitasRoutes];
}
