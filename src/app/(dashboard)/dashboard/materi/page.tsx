import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import MateriCard from '@/components/materi/MateriCard';

export default async function MateriPage() {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role || 'USER';
  const isPremium = userRole === 'ADMIN' || userRole === 'PREMIUM';

  const materiList = await prisma.materi.findMany({
    where: { published: true },
    orderBy: { urutan: 'asc' },
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Materi Belajar</h1>
        <p className="text-gray-600">Pelajari materi bahasa secara terstruktur.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materiList.map((materi) => (
          <MateriCard
            key={materi.id}
            id={materi.id}
            judul={materi.judul}
            slug={materi.slug}
            tipe={materi.tipe}
            isPremium={materi.isPremium}
            isLocked={materi.isPremium && !isPremium}
          />
        ))}
      </div>
    </div>
  );
}
