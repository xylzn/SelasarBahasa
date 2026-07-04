import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { hasActivePremiumAccess } from '@/lib/access';
import { createSignedUrl } from '@/lib/supabase-storage';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Must be authenticated
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { id } = await params;

  const materi = await prisma.materi.findUnique({
    where: { id, published: true },
    select: { id: true, isPremium: true, pdfUrl: true },
  });

  if (!materi) {
    return NextResponse.json({ error: 'Materi tidak ditemukan' }, { status: 404 });
  }

  if (!materi.pdfUrl) {
    return NextResponse.json({ error: 'Materi ini tidak memiliki file PDF' }, { status: 404 });
  }

  // Premium gate
  if (materi.isPremium) {
    const user = authResult.session.user as any;
    const canAccess = hasActivePremiumAccess({
      role: user.role,
      premiumExpiresAt: user.premiumExpiresAt ?? null,
    });
    if (!canAccess) {
      return NextResponse.json({ error: 'Akses premium diperlukan' }, { status: 403 });
    }
  }

  try {
    const signedUrl = await createSignedUrl(materi.pdfUrl, 'materi-files', 300);
    return NextResponse.json({ url: signedUrl });
  } catch (err) {
    console.error('[pdf-url] Failed to generate signed URL:', err);
    return NextResponse.json({ error: 'Gagal membuat URL akses' }, { status: 500 });
  }
}
