import PackageForm from '@/components/admin/forms/PackageForm';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pkg = await prisma.package.findUnique({
    where: { id },
  });

  if (!pkg) return notFound();

  return (
    <PackageForm
      packageId={id}
      initialData={{
        ...pkg,
        harga: Number(pkg.harga),
      }}
    />
  );
}