import prisma from '@/lib/prisma';
import { registerSchema } from '@/lib/validations/auth';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    // Rate limit: max 5 per minute per IP
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
    
    const { allowed } = await checkRateLimit(`register:${ip}`, 5, 60);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan, coba lagi nanti' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validated = registerSchema.parse(body);

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
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
