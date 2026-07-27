import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';
import { sendContactFormNotificationEmail } from '@/lib/email';

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

  // ⚠️ Kirim email NOTIFIKASI KE ADMIN — TIDAK fire-and-forget, kita await & log ERROR detail
  //    Jika kirim email GAGAL: data pesan TETAP tersimpan di DB (admin bisa cek di Dashboard Admin).
  //    User TETAP dapat "Pesan berhasil dikirim!" (return 201) agar user tidak ragu submit ulang.
  try {
    console.log('[Contact API] Attempting to send notification email...');
    await sendContactFormNotificationEmail({
      nama: validated.nama,
      email: validated.email,
      pesan: validated.pesan,
    });
    console.log('[Contact API] Notification email sent OK');
  } catch (err) {
    console.error('========================================');
    console.error('[Contact API] FATAL: GAGAL KIRIM EMAIL NOTIFIKASI.');
    console.error('  > Pesan TETAP tersimpan di DB — bisa cek di Admin Dashboard.');
    console.error('  > Penyebab umum: 1) RESEND_API_KEY salah / belum di-set di Vercel Env Vars');
    console.error('                  2) Domain selasarbahasa.com belum diverifikasi di Resend');
    console.error('                  3) SPF/DKIM Record di DNS Titan Mail blm di-add');
    console.error('  > Error detail:', err);
    console.error('========================================');
  }

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
