import Link from 'next/link';
import prisma from '@/lib/prisma';
import DataTable from '@/components/admin/DataTable';

export default async function AdminQuizPage() {
  const quizList = await prisma.quiz.findMany({
    include: { _count: { select: { questions: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const columns = [
    { key: 'judul', header: 'Judul' },
    {
      key: '_count',
      header: 'Jumlah Soal',
      render: (_count: any, item: any) => item._count.questions,
    },
    {
      key: 'isPremium',
      header: 'Premium',
      render: (isPremium: boolean) => (
        <span className={isPremium ? 'text-yellow-600' : 'text-gray-500'}>
          {isPremium ? 'Ya' : 'Tidak'}
        </span>
      ),
    },
    {
      key: 'published',
      header: 'Status',
      render: (published: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {published ? 'Terbit' : 'Draft'}
        </span>
      ),
    },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Kelola Quiz</h1>
          <p className="text-gray-600">Tambah, edit, atau hapus quiz.</p>
        </div>
        <Link
          href="#"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          + Tambah Quiz
        </Link>
      </div>
      <DataTable columns={columns} data={quizList} />
    </div>
  );
}
