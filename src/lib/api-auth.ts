import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function getAuthSession() {
  return await auth();
}

export async function requireAuth() {
  const session = await getAuthSession();
  if (!session?.user) {
    return { error: 'Unauthorized', status: 401 };
  }
  return { session };
}

export async function requireAdmin() {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return authResult;
  }
  if (authResult.session.user?.role !== 'ADMIN') {
    return { error: 'Forbidden', status: 403 };
  }
  return { session: authResult.session };
}
