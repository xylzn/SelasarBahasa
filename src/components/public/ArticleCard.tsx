import Link from 'next/link';
import { Calendar, Tag } from 'lucide-react';

interface Article {
  id: string;
  judul: string;
  slug: string;
  ringkasan: string;
  thumbnailUrl: string | null;
  kategori: string | null;
  publishedAt: Date | null;
}

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`/artikel/${article.slug}`} className="block">
      <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
        {article.thumbnailUrl && (
          <img
            src={article.thumbnailUrl}
            alt={article.judul}
            className="w-full h-48 object-cover"
          />
        )}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
            {article.kategori && (
              <span className="flex items-center gap-1">
                <Tag size={14} />
                {article.kategori}
              </span>
            )}
            {article.publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {new Date(article.publishedAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition">
            {article.judul}
          </h3>
          <p className="text-gray-600 line-clamp-2">{article.ringkasan}</p>
        </div>
      </article>
    </Link>
  );
}
