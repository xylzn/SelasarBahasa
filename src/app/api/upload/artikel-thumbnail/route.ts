import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { uploadFile } from '@/lib/supabase-storage';

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: Request) {
  // Only admins can upload article thumbnails
  const authResult = await requireAdmin();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Tipe file tidak didukung. Gunakan JPG, PNG, atau WEBP.' },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: 'Ukuran gambar tidak boleh lebih dari 2MB.' },
      { status: 400 }
    );
  }

  const uploadResult = await uploadFile(file, 'artikel-thumbnails', 'thumbnails/');
  if ('error' in uploadResult) {
    return NextResponse.json({ error: uploadResult.error }, { status: 400 });
  }

  return NextResponse.json({ url: uploadResult.url });
}
