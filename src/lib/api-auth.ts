import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function getAuthSession() {
  return await auth();
}

export async function requireAuth() {
  const session = await getAuthSession();
  if (!session?.user) {
    throw new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user?.role !== 'ADMIN') {
    throw new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }
  return session;
}
