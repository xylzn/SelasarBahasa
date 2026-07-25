import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { uploadFile } from '@/lib/supabase-storage';

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
  if (!ALLOWED.includes(file.type))
    return NextResponse.json({ error: 'Tipe file tidak didukung. Hanya JPG, PNG, WEBP.' }, { status: 400 });
  if (file.size > MAX_SIZE)
    return NextResponse.json({ error: 'Ukuran file maks. 2MB.' }, { status: 400 });

  const result = await uploadFile(file, 'pengumuman', 'media/');
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 });

  return NextResponse.json({ url: result.url });
}
