import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { canReadContent } from '@/lib/access';
import { createSignedUrl } from '@/lib/supabase-storage';

function isSupabaseStorageUrl(url: string, bucket: string): boolean {
  try {
    const parsed = new URL(url);
    const expectedPrefix = `/storage/v1/object/public/${bucket}/`;
    return parsed.pathname.startsWith(expectedPrefix);
  } catch {
    return false;
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { id } = await params;
  const userId = authResult.session.user.id as string;

  const materi = await prisma.materi.findUnique({
    where: { id, published: true },
    select: { pdfUrl: true },
  });

  if (!materi) return NextResponse.json({ error: 'Materi tidak ditemukan' }, { status: 404 });
  if (!materi.pdfUrl) return NextResponse.json({ error: 'Materi ini tidak memiliki file PDF' }, { status: 404 });

  // Enrollment gate: ACTIVE or COMPLETED
  const allowed = await canReadContent(userId);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Kamu harus terdaftar dan aktif di kelas untuk mengakses materi ini.' },
      { status: 403 }
    );
  }

  try {
    // Check if it's a Supabase Storage URL, if yes create signed URL, else return original
    if (isSupabaseStorageUrl(materi.pdfUrl, 'materi-files')) {
      const signedUrl = await createSignedUrl(materi.pdfUrl, 'materi-files', 300);
      return NextResponse.json({ url: signedUrl });
    } else {
      // Return regular link as-is (e.g., Google Drive, Dropbox, etc.)
      return NextResponse.json({ url: materi.pdfUrl });
    }
  } catch (err) {
    console.error('[pdf-url] Failed to generate signed URL:', err);
    return NextResponse.json({ error: 'Gagal membuat URL akses' }, { status: 500 });
  }
}
