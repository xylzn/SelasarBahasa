import prisma from '@/lib/prisma';
import { forgotPasswordSchema } from '@/lib/validations/auth';
import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { sendResetPasswordEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
    
    const { allowed } = await checkRateLimit(`forgot-password:${ip}`, 5, 900);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan, coba lagi nanti' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validated = forgotPasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: hashedToken,
          resetTokenExpiry: resetTokenExpiry,
        },
      });

      const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${rawToken}`;
      await sendResetPasswordEmail(user.email, resetUrl, user.nama);
    }

    return NextResponse.json({ 
      message: 'Jika email terdaftar, link reset sudah dikirim.' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ 
      message: 'Jika email terdaftar, link reset sudah dikirim.' 
    });
  }
}
