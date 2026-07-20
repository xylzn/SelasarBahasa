import { Suspense } from 'react';
import prisma from '@/lib/prisma';
import HeroSection from '@/components/public/HeroSection';
import AboutSection from '@/components/public/AboutSection';
import ArticleSlidesSection from '@/components/public/ArticleSlidesSection';
import PackageCard from '@/components/public/PackageCard';
import ContactSection from '@/components/public/ContactSection';
import { HorizontalScrollContainer } from '@/components/shared/HorizontalScrollContainer';
import { getExchangeRates } from '@/lib/currency';
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

async function getPackages() {
  try {
    const packages = await prisma.package.findMany({
      where: { published: true },
      orderBy: { urutan: 'asc' },
    });
    // Convert Decimal to number for client component
    return packages.map((pkg) => ({
      ...pkg,
      harga: Number(pkg.harga),
    }));
  } catch (error) {
    console.error("Failed to fetch packages during build/render", error);
    return [];
  }
}

export default async function HomePage() {
  const [totalUsers, articles, packages, exchangeRates] = await Promise.all([
    getTotalUsers(),
    getLatestArticles(),
    getPackages(),
    getExchangeRates(),
  ]);

  // Fire-and-forget: track homepage visit without blocking render
  trackHomepageVisit().catch((err) => console.error('Failed to track homepage visit:', err));

  return (
    <div>
      {/* 1. Hero */}
      <HeroSection totalUsers={totalUsers} />

      {/* 2. Article Slides */}
      <ArticleSlidesSection articles={articles} />

      {/* 3. About — "Kenapa Ribuan Pelajar Pilih SelasarBahasa?" */}
      <AboutSection />

      {/* 4. Packages — "Paket Belajar Kami" */}
      <section className="py-20" id="packages">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Paket Belajar Kami
            </h2>
            <p className="text-gray-600">Pilih paket yang sesuai dengan kebutuhanmu</p>
          </div>

          {/* Mobile: Horizontal Scroll */}
          <HorizontalScrollContainer className="lg:hidden bg-white">
            {packages.map((pkg) => (
              <div key={pkg.id} className="flex-shrink-0 w-[85%] snap-center">
                <PackageCard pkg={pkg} exchangeRates={exchangeRates} />
              </div>
            ))}
          </HorizontalScrollContainer>

          {/* Desktop: Grid */}
          <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} exchangeRates={exchangeRates} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Contact */}
      <Suspense fallback={<div className="py-20 text-center text-gray-400">Loading...</div>}>
        <ContactSection />
      </Suspense>
    </div>
  );
}
