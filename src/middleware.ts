import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isDashboard = path.startsWith('/dashboard');
  const isAdmin = path.startsWith('/admin');

  // For now, we'll handle auth checks in layouts since old next-auth middleware doesn't work
  // We'll rely on the server-side session checks in (dashboard)/layout.tsx and (admin)/layout.tsx
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
