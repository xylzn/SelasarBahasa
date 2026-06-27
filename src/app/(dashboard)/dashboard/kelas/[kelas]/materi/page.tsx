import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import MateriCard from '@/components/materi/MateriCard';

const validKelas = ['dasar', 'menengah', 'lanjutan'] as const;
type ValidKelas = (typeof validKelas)[number];

const mapKelas = (kelas: string): ValidKelas => {
  const k = kelas.toLowerCase() as ValidKelas;
  if (validKelas.includes(k)) return k;
  throw new Error('Invalid kelas');
};

export default async function MateriListPage({ params }: { params: { kelas: string } }) {
  const session = await auth();
  const userRole = session?.user?.role || 'USER';
  const userCanAccessPremium = userRole === 'ADMIN' || userRole === 'PREMIUM';

  try {
    const kelas = mapKelas(params.kelas);

    if (kelas !== 'dasar') {
      notFound();
    }

    const materis = await prisma.materi.findMany({
      where: {
        kelas: 'DASAR',
        tipe: 'TEKS',
        published: true
      },
      orderBy: { urutan: 'asc' }
    });

    return (
      <div className="p-8">
        <div className="mb-8">
          <Link href="/dashboard/kelas/dasar" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← Kembali ke Kelas Dasar
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Materi Kelas Dasar</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materis.map((materi) => (
            <MateriCard
              key={materi.id}
              id={materi.id}
              judul={materi.judul}
              slug={materi.slug}
              tipe={materi.tipe}
              kelas={materi.kelas}
              isPremium={materi.isPremium}
              userCanAccess={userCanAccessPremium}
            />
          ))}
        </div>
      </div>
    );
  } catch {
    notFound();
  }
}
