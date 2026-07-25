import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import KelasListClient from '@/components/dashboard/KelasListClient';
import { getAllUserEnrollments, generateTingkatSlug } from '@/lib/access';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function KelasPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const isAdmin = session?.user?.role === 'ADMIN';

  if (!isAdmin && userId) {
    const enrollments = await getAllUserEnrollments(userId);
    if (enrollments.length === 0) {
      return (
        <div className="p-8 text-center">
          <p className="text-gray-500 mb-4">Kamu belum terdaftar di kelas aktif.</p>
          <Link href="/#packages" className="text-brand-blue font-semibold hover:underline">Pilih Program →</Link>
        </div>
      );
    }

    // If only one enrollment and it's ACTIVE or COMPLETED, redirect to that tingkat page with slug gabungan
    if (enrollments.length === 1 && ['ACTIVE', 'COMPLETED'].includes(enrollments[0].status)) {
      const slug = generateTingkatSlug(enrollments[0].kelas.tipe, enrollments[0].kelas.tingkat);
      redirect(`/dashboard/kelas/${slug}`);
    }
  }

  // For admins or users with multiple enrollments, show the list
  const totalMateri = await prisma.materi.count({ where: { published: true } });
  const enrollments = userId ? await getAllUserEnrollments(userId) : [];

  return <KelasListClient totalMateri={totalMateri} enrollments={enrollments} />;
}
