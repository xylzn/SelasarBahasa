import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const contactSchema = z.object({
  nama: z.string().min(1),
  email: z.string().email(),
  pesan: z.string().min(1),
});

// POST /api/contact
export async function POST(request: Request) {
  // Rate limit: max 5 per minute per IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
  
  const { allowed } = await checkRateLimit(`contact:${ip}`, 5, 60);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Terlalu banyak permintaan, coba lagi nanti' },
      { status: 429 }
    );
  }

  const body = await request.json();
  const validated = contactSchema.parse(body);

  const message = await prisma.contactMessage.create({
    data: validated,
  });

  return NextResponse.json(message, { status: 201 });
}

// GET /api/contact
export async function GET(request: Request) {
  const authResult = await requireAdmin();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  });

  return NextResponse.json(messages);
}
