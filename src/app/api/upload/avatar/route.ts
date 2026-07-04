import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { uploadFile, deleteFile } from '@/lib/supabase-storage';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
  }

  const uploadResult = await uploadFile(file, 'profile-photos', 'avatars/');
  if ('error' in uploadResult) {
    return NextResponse.json({ error: uploadResult.error }, { status: 400 });
  }

  // Hapus foto lama kalau ada, biar tidak numpuk file yatim di storage
  const currentUser = await prisma.user.findUnique({
    where: { id: authResult.session.user.id },
    select: { fotoProfil: true },
  });
  if (currentUser?.fotoProfil) {
    await deleteFile(currentUser.fotoProfil, 'profile-photos').catch(() => {});
  }

  const updated = await prisma.user.update({
    where: { id: authResult.session.user.id },
    data: { fotoProfil: uploadResult.url },
    select: { fotoProfil: true },
  });

  return NextResponse.json({ fotoProfil: updated.fotoProfil });
}
