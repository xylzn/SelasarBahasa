import Link from 'next/link';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Download } from 'lucide-react';

export default async function TugasSubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const tugas = await prisma.tugas.findUnique({
    where: { id },
    include: {
      submissions: {
        include: {
          user: { select: { id: true, nama: true, email: true } },
          files: true,
        },
        orderBy: { submittedAt: 'desc' },
      },
    },
  });

  if (!tugas) return notFound();

  const now = new Date();
  const deadline = tugas.deadline ? new Date(tugas.deadline) : null;
  const isPastDeadline = deadline ? now > deadline : false;

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href="/admin/tugas" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
          ← Kembali ke Daftar Tugas
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Submissions: {tugas.judul}</h1>
        <p className="text-gray-600">
          Total submissions: {tugas.submissions.length}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nama User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Dikumpulkan Pada</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">File</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tugas.submissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Belum ada submissions
                  </td>
                </tr>
              ) : (
                tugas.submissions.map((submission) => {
                  const submittedAt = new Date(submission.submittedAt);
                  const isLate = deadline && submittedAt > deadline;
                  
                  return (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {submission.user.nama}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {submission.user.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {submittedAt.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {isLate ? (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            Terlambat
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Tepat Waktu
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {submission.files.length === 0 ? (
                          <span className="text-gray-400">Tidak ada file</span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {submission.files.map((file) => (
                              <Link
                                key={file.id}
                                href={file.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                              >
                                <Download size={14} />
                                <span className="truncate max-w-xs">{file.fileName}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
