import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import TugasDetailClient from '@/components/TugasDetailClient';
import { notFound } from 'next/navigation';

export default async function TugasDetailPage({ params }: { params: Promise<{ kelas: string; slug: string }> }) {
  const session = await auth();
  const { kelas, slug } = await params;

  const tugas = await prisma.tugas.findUnique({
    where: { slug },
  });

  if (!tugas) return notFound();

  let submission = null;
  if (session?.user?.id) {
    submission = await prisma.tugasSubmission.findUnique({
      where: {
        tugasId_userId: {
          tugasId: tugas.id,
          userId: session.user.id,
        },
      },
      include: { files: true },
    });
  }

  return <TugasDetailClient tugas={tugas} submission={submission} />;
}
