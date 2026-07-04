import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SUPPORTED_LOCALES = ['id', 'en', 'de'];
const DEFAULT_LOCALE = 'id';

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip api and static assets
  if (
    path.startsWith('/api') ||
    path.startsWith('/_next') ||
    path.includes('.')
  ) {
    return NextResponse.next();
  }

  // 1. Check if locale cookie is set
  let locale = request.cookies.get('locale')?.value;
  let response = NextResponse.next();

  if (!locale) {
    // 2. Parse Accept-Language header
    const acceptLanguage = request.headers.get('Accept-Language');
    if (acceptLanguage) {
      const locales = acceptLanguage
        .split(',')
        .map((lang) => lang.split(';')[0].trim().toLowerCase().slice(0, 2));
      const matched = locales.find((lang) => SUPPORTED_LOCALES.includes(lang));
      locale = matched || DEFAULT_LOCALE;
    } else {
      locale = DEFAULT_LOCALE;
    }

    // Set cookie on response
    response.cookies.set('locale', locale, {
      path: '/',
      maxAge: 365 * 24 * 60 * 60, // 1 year
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: [
    // Match all routes except /api, /_next/static, /_next/image, and favicon.ico
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
