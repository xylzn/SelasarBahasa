import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { uploadFile } from '@/lib/supabase-storage';

export async function POST(request: Request) {
  await requireAdmin();
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
  }

  const uploadResult = await uploadFile(file, 'tugas-files', 'instruksi');

  if ('error' in uploadResult) {
    return NextResponse.json({ error: uploadResult.error }, { status: 400 });
  }

  return NextResponse.json({ url: uploadResult.url });
}
