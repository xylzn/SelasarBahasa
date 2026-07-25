import prisma from '@/lib/prisma';
import KelasPageClient from '@/components/public/KelasPageClient';

export const revalidate = 3600;

export const metadata = {
  title: 'Kelas — SelasarBahasa',
  description: 'Pilih kelas BIPA yang cocok untukmu: Reguler, Privat, atau Anak & Remaja.',
};

type TipeKelas = 'REGULER' | 'PRIVAT' | 'ANAK_REMAJA';

async function getAvailableKelas(tipe: TipeKelas) {
  try {
    return await prisma.kelas.findMany({
      where: {
        status: { in: ['WAITING_LIST', 'ONGOING'] },
        tipe,
      },
      select: {
        id: true,
        tipe: true,
        tingkat: true,
        minKuota: true,
        nama: true,
        status: true,
        _count: {
          select: {
            enrollments: {
              where: {
                status: {
                  in: ['PENDING_PAYMENT', 'WAITING', 'ACTIVE'],
                },
              },
            },
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { tingkat: 'asc' },
      ],
    });
  } catch {
    return [];
  }
}

export default async function KelasPage() {
  const [regulerKelas, privatKelas, anakKelas] = await Promise.all([
    getAvailableKelas('REGULER'),
    getAvailableKelas('PRIVAT'),
    getAvailableKelas('ANAK_REMAJA'),
  ]);

  return (
    <KelasPageClient
      regulerKelas={regulerKelas.map(k => ({
        id: k.id,
        tingkat: k.tingkat,
        nama: k.nama,
        minKuota: k.minKuota,
        enrolledCount: k._count.enrollments,
        status: k.status,
      }))}
      privatKelas={privatKelas.map(k => ({
        id: k.id,
        tingkat: k.tingkat,
        nama: k.nama,
        minKuota: k.minKuota,
        enrolledCount: k._count.enrollments,
        status: k.status,
      }))}
      anakKelas={anakKelas.map(k => ({
        id: k.id,
        tingkat: k.tingkat,
        nama: k.nama,
        minKuota: k.minKuota,
        enrolledCount: k._count.enrollments,
        status: k.status,
      }))}
    />
  );
}
