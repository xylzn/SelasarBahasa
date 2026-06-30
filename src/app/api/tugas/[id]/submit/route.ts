import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { uploadFile } from '@/lib/supabase-storage';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  const userId = session.user?.id as string;
  const { id } = await params;

  const tugas = await prisma.tugas.findUnique({ where: { id } });
  if (!tugas) {
    return NextResponse.json({ error: 'Tugas not found' }, { status: 404 });
  }

  const formData = await request.formData();
  const files = formData.getAll('files') as File[];

  if (files.length === 0) {
    return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
  }

  // Upload all files
  const uploadedFiles = [];
  for (const file of files) {
    const uploadResult = await uploadFile(file, 'tugas-files');
    if ('error' in uploadResult) {
      return NextResponse.json({ error: uploadResult.error }, { status: 400 });
    }
    uploadedFiles.push(uploadResult);
  }

  const existingSubmission = await prisma.tugasSubmission.findUnique({
    where: {
      tugasId_userId: {
        tugasId: id,
        userId,
      },
    },
    include: { files: true },
  });

  let submission;
  if (existingSubmission) {
    // Delete old files first
    await prisma.tugasSubmissionFile.deleteMany({
      where: { submissionId: existingSubmission.id },
    });
    // Update submission and add new files
    submission = await prisma.tugasSubmission.update({
      where: { id: existingSubmission.id },
      data: {
        submittedAt: new Date(),
        files: {
          create: uploadedFiles.map(file => ({
            fileUrl: file.url,
            fileName: file.fileName,
            fileSizeBytes: file.fileSize,
          })),
        },
      },
      include: { files: true },
    });
  } else {
    // Create new submission with files
    submission = await prisma.tugasSubmission.create({
      data: {
        tugasId: id,
        userId,
        files: {
          create: uploadedFiles.map(file => ({
            fileUrl: file.url,
            fileName: file.fileName,
            fileSizeBytes: file.fileSize,
          })),
        },
      },
      include: { files: true },
    });
  }

  return NextResponse.json(submission);
}
