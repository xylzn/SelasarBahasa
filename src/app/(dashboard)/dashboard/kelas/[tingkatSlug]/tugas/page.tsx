import Link from 'next/link';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { parseTingkatSlug, canAccessTingkat } from '@/lib/access';
import { notFound, redirect } from 'next/navigation';

export default async function TugasListPage({ params }: { params: Promise<{ tingkatSlug: string }> }) {
  const session = await auth();
  const { tingkatSlug } = await params;
  const userId = session?.user?.id;
  const isAdmin = session?.user?.role === 'ADMIN';

  // Parse slug
  const parsed = parseTingkatSlug(tingkatSlug);
  if (!parsed) {
    notFound();
  }

  const { tipeKelas, tingkatBIPA } = parsed;

  // Check access
  if (!isAdmin && userId) {
    const hasAccess = await canAccessTingkat(userId, tipeKelas, tingkatBIPA);
    if (!hasAccess) {
      redirect('/dashboard/kelas');
    }
  }

  // Filter tugas: if tipeKelas is PRIVAT, include both PRIVAT and REGULER
  const whereClause: any = {
    published: true,
    tingkatBIPA,
  };

  if (tipeKelas === 'PRIVAT') {
    whereClause.OR = [{ tipeKelas: 'PRIVAT' }, { tipeKelas: 'REGULER' }];
  } else {
    whereClause.tipeKelas = tipeKelas;
  }

  const tugasList = await prisma.tugas.findMany({
    where: whereClause,
    orderBy: { urutan: 'asc' },
  });

  const submissions = userId
    ? await prisma.tugasSubmission.findMany({
        where: { userId, tugasId: { in: tugasList.map(t => t.id) } },
      })
    : [];

  const now = new Date();

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href={`/dashboard/kelas/${tingkatSlug}`} className="text-brand-blue hover:text-brand-blue/80 mb-4 inline-block text-sm">
          ← Kembali ke Kelas
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Tugas</h1>
      </div>

      {tugasList.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">Belum ada tugas untuk kelasmu.</p>
        </div>
      )}

      <div className="space-y-4">
        {tugasList.map((tugas) => {
          const hasSubmitted = submissions.some(s => s.tugasId === tugas.id);
          const deadline = tugas.deadline ? new Date(tugas.deadline) : null;
          const isPastDeadline = deadline ? now > deadline : false;

          const statusBadge = hasSubmitted
            ? <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Sudah Dikumpulkan</span>
            : isPastDeadline
              ? <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">Tidak Mengumpulkan</span>
              : <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">Belum Dikumpulkan</span>;

          return (
            <Link key={tugas.id} href={`/dashboard/kelas/${tingkatSlug}/tugas/${tugas.slug}`}>
              <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{tugas.judul}</h2>
                    {tugas.deadline && (
                      <p className="text-sm text-gray-500">
                        Deadline: {new Date(tugas.deadline).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    )}
                  </div>
                  {statusBadge}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
