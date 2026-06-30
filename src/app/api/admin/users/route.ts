import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const createUserSchema = z.object({
  nama: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['USER', 'PREMIUM', 'ADMIN']).default('USER'),
});

// GET /api/admin/users
export async function GET(request: Request) {
  await requireAdmin();
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search');

  const users = await prisma.user.findMany({
    where: search ? {
      OR: [
        { nama: { contains: search } },
        { email: { contains: search } },
      ],
    } : {},
    select: {
      id: true,
      nama: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  });

  return NextResponse.json(users);
}

// POST /api/admin/users
export async function POST(request: Request) {
  await requireAdmin();
  const body = await request.json();
  const validated = createUserSchema.parse(body);

  const existingUser = await prisma.user.findUnique({
    where: { email: validated.email },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: 'Email sudah terdaftar' },
      { status: 409 }
    );
  }

  const password = await bcrypt.hash(validated.password, 12);

  const user = await prisma.user.create({
    data: {
      nama: validated.nama,
      email: validated.email,
      role: validated.role,
      password,
    },
    select: {
      id: true,
      nama: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user, { status: 201 });
}
