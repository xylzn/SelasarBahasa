import ArtikelForm from '@/components/admin/forms/ArtikelForm';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function EditArtikelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
  });

  if (!article) return notFound();

  return <ArtikelForm articleId={id} initialData={article} />;
}