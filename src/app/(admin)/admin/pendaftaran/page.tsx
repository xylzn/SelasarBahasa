import prisma from '@/lib/prisma';
import EnrollmentTableClient from '@/components/admin/EnrollmentTableClient';

export default async function AdminPendaftaranPage() {
  const enrollments = await prisma.enrollment.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { nama: true, email: true, noWhatsapp: true } },
      kelas: { select: { tipe: true, tingkat: true, nama: true } },
    },
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Kelola Pendaftaran</h1>
        <p className="text-gray-500 text-sm">Verifikasi pembayaran dan kelola status enrollment siswa.</p>
      </div>
      <EnrollmentTableClient enrollments={enrollments} />
    </div>
  );
}
