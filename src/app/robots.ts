export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/admin'],
    },
    sitemap: 'https://selasarbahasa.com/sitemap.xml',
  };
}
