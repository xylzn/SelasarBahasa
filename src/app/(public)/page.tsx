import { Suspense } from 'react';
import prisma from '@/lib/prisma';
import HeroSection from '@/components/public/HeroSection';
import AboutSection from '@/components/public/AboutSection';
import AboutUsSection from '@/components/public/AboutUsSection';
import ArticleSlidesSection from '@/components/public/ArticleSlidesSection';
import StaticOfferingsSection from '@/components/public/StaticOfferingsSection';
import ContactSection from '@/components/public/ContactSection';
import { trackHomepageVisit } from '@/lib/pageview-tracker';

export const revalidate = 3600;

async function getTotalUsers() {
  try {
    return await prisma.user.count();
  } catch (error) {
    console.error("Failed to fetch total users during build/render", error);
    return 0;
  }
}

async function getLatestArticles() {
  try {
    return await prisma.article.findMany({
      where: { published: true },
      take: 3,
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
  } catch (error) {
    console.error("Failed to fetch latest articles during build/render", error);
    return [];
  }
}

async function getLatestAktivitas() {
  try {
    return await prisma.aktivitasKita.findMany({
      take: 2,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        judul: true,
        deskripsi: true,
        media: true,
        createdAt: true,
      },
    });
  } catch (error) {
    console.error("Failed to fetch latest aktivitas during build/render", error);
    return [];
  }
}

export default async function HomePage() {
  const [totalUsers, articles, aktivitas] = await Promise.all([
    getTotalUsers(),
    getLatestArticles(),
    getLatestAktivitas(),
  ]);

  trackHomepageVisit().catch((err) => console.error('Failed to track homepage visit:', err));

  return (
    <div>
      <HeroSection totalUsers={totalUsers} articles={articles} aktivitas={aktivitas} />
      <ArticleSlidesSection articles={articles} />
      <AboutUsSection />
      <AboutSection />
      <StaticOfferingsSection />
      <Suspense fallback={<div className="py-20 text-center text-gray-400">Loading...</div>}>
        <ContactSection />
      </Suspense>
    </div>
  );
}
