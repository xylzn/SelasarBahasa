import Link from 'next/link';
import prisma from '@/lib/prisma';
import ArticleTableClient from '@/components/admin/ArticleTableClient';

export default async function AdminArtikelPage() {
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Kelola Artikel</h1>
          <p className="text-gray-600">Tambah, edit, atau hapus artikel.</p>
        </div>
        <Link
          href="/admin/artikel/create"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          + Tambah Artikel
        </Link>
      </div>

      <ArticleTableClient articles={articles} />
    </div>
  );
}
