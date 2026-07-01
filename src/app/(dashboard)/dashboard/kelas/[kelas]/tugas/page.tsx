import Link from 'next/link';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export default async function TugasListPage({ params }: { params: Promise<{ kelas: string }> }) {
  const session = await auth();
  const { kelas } = await params;
  const kelasSlug = kelas.toLowerCase();

  let kelasEnum = 'DASAR' as 'DASAR' | 'MENENGAH' | 'LANJUTAN';
  let kelasDisplay = 'Kelas Dasar';
  if (kelasSlug === 'menengah') {
    kelasEnum = 'MENENGAH';
    kelasDisplay = 'Kelas Menengah';
  } else if (kelasSlug === 'lanjutan') {
    kelasEnum = 'LANJUTAN';
    kelasDisplay = 'Kelas Lanjutan';
  }

  const isPremium = session?.user?.role === 'ADMIN' || session?.user?.role === 'PREMIUM';

  const tugasList = await prisma.tugas.findMany({
    where: {
      kelas: kelasEnum,
      published: true,
      ...(!isPremium && { isPremium: false }),
    },
    include: {
      submissions: {
        where: session?.user?.id ? { userId: session.user.id } : {},
        take: 1,
      },
    },
    orderBy: { urutan: 'asc' },
  });

  const now = new Date();

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href={`/dashboard/kelas/${kelasSlug}`} className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
          ← Kembali ke {kelasDisplay}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Tugas {kelasDisplay}</h1>
      </div>

      <div className="space-y-4">
        {tugasList.map((tugas) => {
          const hasSubmitted = tugas.submissions.length > 0;
          const deadline = tugas.deadline ? new Date(tugas.deadline) : null;
          const isPastDeadline = deadline ? now > deadline : false;
          
          let statusBadge = null;
          if (hasSubmitted) {
            statusBadge = (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Sudah Dikumpulkan
              </span>
            );
          } else if (isPastDeadline) {
            statusBadge = (
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                Tidak Mengumpulkan
              </span>
            );
          } else {
            statusBadge = (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Belum Dikumpulkan
              </span>
            );
          }

          return (
            <Link key={tugas.id} href={`/dashboard/kelas/${kelasSlug}/tugas/${tugas.slug}`}>
              <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{tugas.judul}</h2>
                    {tugas.deadline && (
                      <p className="text-sm text-gray-500">
                        Deadline: {new Date(tugas.deadline).toLocaleString('id-ID', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {tugas.isPremium && (
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                        Premium
                      </span>
                    )}
                    {statusBadge}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
