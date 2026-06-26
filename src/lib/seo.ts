export function generateArticleJsonLd(article: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.judul,
    "description": article.metaDescription || article.ringkasan,
    "author": {
      "@type": "Organization",
      "name": "Selasar Bahasa"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Selasar Bahasa"
    },
    "datePublished": article.publishedAt,
    "dateModified": article.updatedAt,
    "image": article.ogImageUrl || article.thumbnailUrl
  }
}
