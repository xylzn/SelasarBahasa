import prisma from '@/lib/prisma';
import { resetPasswordSchema } from '@/lib/validations/auth';
import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
    
    const { allowed } = await checkRateLimit(`reset-password:${ip}`, 5, 900);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan, coba lagi nanti' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validated = resetPasswordSchema.parse(body);

    const hashedToken = crypto.createHash('sha256').update(validated.token).digest('hex');
    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Token tidak valid atau sudah kedaluwarsa' },
        { status: 400 }
      );
    }

    const newPasswordHash = await bcrypt.hash(validated.password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: newPasswordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({ message: 'Password berhasil direset' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
