import MateriForm from '@/components/admin/forms/MateriForm';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function EditMateriPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const materi = await prisma.materi.findUnique({
    where: { id },
  });

  if (!materi) return notFound();

  return <MateriForm initialData={materi} />;
}
