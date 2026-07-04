import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { deleteFile } from '@/lib/supabase-storage';
import { invalidateCachePattern } from '@/lib/cache';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const session = authResult.session;
    const userId = session.user?.id as string;
    const { fileId } = await params;

    // Dapatkan file submission beserta relasi submission
    const submissionFile = await prisma.tugasSubmissionFile.findUnique({
      where: { id: fileId },
      include: {
        submission: true,
      },
    });

    if (!submissionFile) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 404 });
    }

    // Verifikasi bahwa user adalah pemilik submission
    if (submissionFile.submission.userId !== userId) {
      return NextResponse.json({ error: 'Anda tidak memiliki izin untuk menghapus file ini' }, { status: 403 });
    }

    // Hapus file dari Supabase Storage
    const deleteResult = await deleteFile(submissionFile.fileUrl, 'tugas-files');
    if ('error' in deleteResult) {
      console.error('Gagal menghapus file dari storage:', deleteResult.error);
    }

    // Hapus record dari database
    await prisma.tugasSubmissionFile.delete({
      where: { id: fileId },
    });

    // Cek apakah submission masih punya file lain
    const remainingFiles = await prisma.tugasSubmissionFile.count({
      where: { submissionId: submissionFile.submissionId },
    });

    // Invalidate cache
    await invalidateCachePattern('tugas:*');

    return NextResponse.json({ 
      success: true, 
      remainingFiles,
      submissionId: submissionFile.submissionId 
    });
  } catch (error) {
    console.error('Error deleting submission file:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat menghapus file' }, { status: 500 });
  }
}
