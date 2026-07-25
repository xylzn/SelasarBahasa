'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FileText, Upload, Download, X } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';

interface TugasDetailProps {
  tugas: any;
  submission: any;
}

export default function TugasDetailClient({ tugas, submission }: TugasDetailProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();

  const MAX_FILE_SIZE_MB = 10;
  const MAX_TOTAL_SIZE_MB = 30;

  const now = new Date();
  const deadline = tugas.deadline ? new Date(tugas.deadline) : null;
  const isPastDeadline = deadline ? now > deadline : false;
  const hasSubmitted = !!submission;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const { showDialog } = useConfirmDialog();

  const handleDeleteFile = (fileId: string) => {
    showDialog({
      title: 'Hapus File',
      message: 'Yakin ingin menghapus file ini?',
      confirmText: 'Hapus',
      cancelText: 'Batal',
      onConfirm: async () => {
        setIsDeleting(fileId);
        setError(null);

        try {
          const res = await fetch(`/api/tugas/submit/files/${fileId}`, {
            method: 'DELETE',
          });

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Gagal menghapus file');
          }

          showToast('File berhasil dihapus!', 'success');
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
          showToast(err instanceof Error ? err.message : 'Terjadi kesalahan', 'error');
        } finally {
          setIsDeleting(null);
        }
      },
    });
  };

  const validateFiles = () => {
    if (selectedFiles.length === 0) {
      setError('Silakan pilih setidaknya satu file');
      return false;
    }

    let totalSize = 0;
    for (const file of selectedFiles) {
      const fileSizeMB = file.size / 1024 / 1024;
      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        setError(`File ${file.name} melebihi batas ${MAX_FILE_SIZE_MB}MB`);
        return false;
      }
      totalSize += fileSizeMB;
    }

    if (totalSize > MAX_TOTAL_SIZE_MB) {
      setError(`Total ukuran file melebihi batas ${MAX_TOTAL_SIZE_MB}MB`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFiles()) return;
    if (isPastDeadline) {
      setError('Sudah melewati deadline, tidak bisa mengumpulkan tugas');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => formData.append('files', file));

      const res = await fetch(`/api/tugas/${tugas.id}/submit`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Gagal mengumpulkan tugas');
      }

      setSuccess(true);
      setSelectedFiles([]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link
        href={`/dashboard/kelas/${params.tingkatSlug}/tugas`}
        className="text-brand-blue hover:text-brand-blue-dark mb-4 inline-block"
      >
        ← Kembali ke Daftar Tugas
      </Link>

      <div className="bg-white p-8 rounded-xl border border-gray-200 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{tugas.judul}</h1>
          </div>
          {tugas.deadline && (
            <div className={`text-right p-4 rounded-lg ${isPastDeadline ? 'bg-red-50' : 'bg-gray-50'}`}>
              <p className="text-sm text-gray-500">Deadline</p>
              <p className={`font-medium ${isPastDeadline ? 'text-red-600' : 'text-gray-900'}`}>
                {new Date(tugas.deadline).toLocaleString('id-ID', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
              {isPastDeadline && (
                <p className="text-xs text-red-600 mt-1">Sudah melewati deadline</p>
              )}
            </div>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Instruksi</h2>
          <p className="text-gray-600 whitespace-pre-wrap">{tugas.instruksi}</p>
        </div>

        {tugas.fileInstruksiUrl && (
          <div className="mb-6">
            <Link
              href={tugas.fileInstruksiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-brand-blue hover:text-brand-blue-dark"
            >
              <Download size={20} />
              <span>Download File Instruksi</span>
            </Link>
          </div>
        )}
      </div>

      <div className="bg-white p-8 rounded-xl border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {isPastDeadline ? (hasSubmitted ? 'Lihat Pengumpulan' : 'Tidak Mengumpulkan Tugas') : (hasSubmitted ? 'Edit Pengumpulan' : 'Kumpulkan Tugas')}
        </h2>

        {hasSubmitted && (submission.files && submission.files.length > 0 ? (
          <div className="bg-green-50 p-6 rounded-lg mb-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText size={24} className="text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Tugas Sudah Dikumpulkan!</p>
                <p className="text-sm text-gray-600">
                  Dikumpulkan pada: {new Date(submission.submittedAt).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">File yang dikumpulkan:</p>
              {submission.files.map((file: any) => (
                <div key={file.id} className="flex items-center justify-between gap-2">
                  <Link
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-brand-blue hover:text-brand-blue-dark flex-1"
                  >
                    <Download size={16} />
                    <span>{file.fileName}</span>
                  </Link>
                  {!isPastDeadline && (
                    <button
                      type="button"
                      onClick={() => handleDeleteFile(file.id)}
                      disabled={isDeleting === file.id}
                      className="text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      {isDeleting === file.id ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <X size={16} />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-green-50 p-6 rounded-lg mb-6">
            <div className="flex items-center gap-3">
              <FileText size={24} className="text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Tugas Sudah Dikumpulkan!</p>
                <p className="text-sm text-gray-600">
                  Dikumpulkan pada: {new Date(submission.submittedAt).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}

        {isPastDeadline && !hasSubmitted && (
          <div className="bg-gray-100 p-6 rounded-lg mb-6 text-center">
            <p className="text-gray-600 font-medium">Tidak mengumpulkan tugas</p>
          </div>
        )}

        {!isPastDeadline && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">File Jawaban (bisa lebih dari satu)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                multiple
                onChange={handleFileChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maks {MAX_FILE_SIZE_MB}MB per file, total {MAX_TOTAL_SIZE_MB}MB
              </p>
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">File terpilih:</p>
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-gray-600" />
                      <span className="text-sm text-gray-700">
                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="bg-red-50 p-4 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 p-4 rounded-lg text-green-700">
                Tugas berhasil dikumpulkan!
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || selectedFiles.length === 0}
                className="px-6 py-3 rounded-lg bg-brand-blue text-white hover:bg-brand-blue/90 transition disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>Mengirim...</>
                ) : (
                  <>
                    <Upload size={20} />
                    {hasSubmitted ? 'Perbarui Jawaban' : 'Kumpulkan Tugas'}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
