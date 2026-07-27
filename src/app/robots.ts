import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/api/',
        '/admin/',
        '/reset-password',
      ],
    },
    sitemap: 'https://selasarbahasa.com/sitemap.xml',
  };
}
