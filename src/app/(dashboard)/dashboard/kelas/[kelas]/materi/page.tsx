import Link from 'next/link';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import MateriCard from '@/components/materi/MateriCard';

export default async function MateriListPage({ params }: { params: Promise<{ kelas: string }> }) {
  const session = await auth();
  const userRole = session?.user?.role || 'USER';
  const userCanAccessPremium = userRole === 'ADMIN' || userRole === 'PREMIUM';
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

  const materis = await prisma.materi.findMany({
    where: {
      kelas: kelasEnum,
      tipe: 'TEKS',
      published: true
    },
    orderBy: { urutan: 'asc' }
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href={`/dashboard/kelas/${kelasSlug}`} className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
          ← Kembali ke {kelasDisplay}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Materi {kelasDisplay}</h1>
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
}
