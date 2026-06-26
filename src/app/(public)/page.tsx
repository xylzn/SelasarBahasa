import { Suspense } from 'react';
import prisma from '@/lib/prisma';
import HeroSection from '@/components/public/HeroSection';
import AboutSection from '@/components/public/AboutSection';
import ArticleCard from '@/components/public/ArticleCard';
import PackageCard from '@/components/public/PackageCard';
import ContactForm from '@/components/public/ContactForm';

export const revalidate = 3600;

async function getTotalUsers() {
  return await prisma.user.count();
}

async function getLatestArticles() {
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
}

async function getPackages() {
  return await prisma.package.findMany({
    where: { published: true },
    orderBy: { urutan: 'asc' },
  });
}

export default async function HomePage() {
  const [totalUsers, articles, packages] = await Promise.all([
    getTotalUsers(),
    getLatestArticles(),
    getPackages(),
  ]);

  return (
    <div>
      <HeroSection totalUsers={totalUsers} />
      <AboutSection />

      {/* Article Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Artikel Terbaru
            </h2>
            <p className="text-gray-600">Baca tips dan trik belajar bahasa dari kami</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          <div className="text-center mt-12">
            <a
              href="/artikel"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Lihat Semua Artikel
            </a>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-20" id="packages">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Paket Belajar Kami
            </h2>
            <p className="text-gray-600">Pilih paket yang sesuai dengan kebutuhanmu</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 bg-gray-50" id="contact">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Kontak Kami
            </h2>
            <p className="text-gray-600">
              Ada pertanyaan? Silakan hubungi kami dan kami akan segera merespon
            </p>
          </div>
          <Suspense fallback={<div>Loading form...</div>}>
            <ContactForm />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
