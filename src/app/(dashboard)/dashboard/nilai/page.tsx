import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { getCached } from '@/lib/cache';
import { CACHE_KEYS } from '@/lib/cache-keys';
import Link from 'next/link';

export default async function GradebookPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return <div className="p-8">Not authenticated</div>;
  }

  const userId = session.user.id;

  // Get quiz attempts
  const quizAttempts = await getCached(
    CACHE_KEYS.userQuizAttempts(userId),
    60, // 1 minute cache
    async () => prisma.quizAttempt.findMany({
      where: { userId },
      include: {
        quiz: {
          select: {
            id: true,
            judul: true,
          }
        }
      },
      orderBy: { completedAt: 'desc' }
    })
  );

  // Get tugas submissions
  const tugasSubmissions = await getCached(
    CACHE_KEYS.userTugasSubmissions(userId),
    60, // 1 minute cache
    async () => prisma.tugasSubmission.findMany({
      where: { userId },
      include: {
        tugas: {
          select: {
            id: true,
            judul: true,
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    })
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Rekap Nilai</h1>
        <p className="text-gray-600">Lihat semua hasil quiz dan pengumpulan tugasmu</p>
      </div>

      <div className="space-y-8">
        {/* Quiz Attempts */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Hasil Quiz</h2>
          {quizAttempts.length === 0 ? (
            <p className="text-gray-500">Belum ada quiz yang diambil</p>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quiz
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Skor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {quizAttempts.map((attempt) => (
                      <tr key={attempt.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {attempt.quiz.judul}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            attempt.score >= 80 ? 'bg-green-100 text-green-800' :
                            attempt.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {attempt.score}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(attempt.completedAt).toLocaleString('id-ID', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Tugas Submissions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pengumpulan Tugas</h2>
          {tugasSubmissions.length === 0 ? (
            <p className="text-gray-500">Belum ada tugas yang dikumpulkan</p>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tugas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tugasSubmissions.map((submission) => (
                      <tr key={submission.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {submission.tugas.judul}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Dikumpulkan
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(submission.submittedAt).toLocaleString('id-ID', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
