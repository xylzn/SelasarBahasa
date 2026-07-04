import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import prisma from '@/lib/prisma';
import { updateProfileSchema } from '@/lib/validations/profile';

export async function GET() {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const user = await prisma.user.findUnique({
    where: { id: authResult.session.user.id },
    select: {
      id: true, nama: true, email: true, bio: true,
      negara: true, instansi: true, fotoProfil: true, role: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PUT(request: Request) {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const body = await request.json();
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: authResult.session.user.id },
    data: parsed.data,
    select: {
      id: true, nama: true, email: true, bio: true,
      negara: true, instansi: true, fotoProfil: true, role: true,
    },
  });

  return NextResponse.json(updated);
}
