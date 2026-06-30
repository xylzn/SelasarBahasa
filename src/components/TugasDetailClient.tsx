'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FileText, Upload, Download, X } from 'lucide-react';

interface TugasDetailProps {
  tugas: any;
  submission: any;
}

export default function TugasDetailClient({ tugas, submission }: TugasDetailProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const params = useParams();

  const MAX_FILE_SIZE_MB = 10;
  const MAX_TOTAL_SIZE_MB = 30;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
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
        href={`/dashboard/kelas/${params.kelas}/tugas`}
        className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
      >
        ← Kembali ke Daftar Tugas
      </Link>

      <div className="bg-white p-8 rounded-xl border border-gray-200 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{tugas.judul}</h1>
            {tugas.isPremium && (
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                Premium
              </span>
            )}
          </div>
          {tugas.deadline && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Deadline</p>
              <p className="text-gray-900 font-medium">
                {new Date(tugas.deadline).toLocaleDateString('id-ID', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
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
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Download size={20} />
              <span>Download File Instruksi</span>
            </Link>
          </div>
        )}
      </div>

      <div className="bg-white p-8 rounded-xl border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Kumpulkan Tugas</h2>

        {submission && submission.files && submission.files.length > 0 ? (
          <div className="bg-green-50 p-6 rounded-lg mb-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText size={24} className="text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Tugas Sudah Dikumpulkan!</p>
                <p className="text-sm text-gray-600">
                  Dikumpulkan pada: {new Date(submission.submittedAt).toLocaleDateString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">File yang dikumpulkan:</p>
              {submission.files.map((file: any) => (
                <Link
                  key={file.id}
                  href={file.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <Download size={16} />
                  <span>{file.fileName}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : submission ? (
          <div className="bg-green-50 p-6 rounded-lg mb-6">
            <div className="flex items-center gap-3">
              <FileText size={24} className="text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Tugas Sudah Dikumpulkan!</p>
                <p className="text-sm text-gray-600">
                  Dikumpulkan pada: {new Date(submission.submittedAt).toLocaleDateString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">File Jawaban (bisa lebih dari satu)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              multiple
              onChange={handleFileChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
              className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>Mengirim...</>
              ) : (
                <>
                  <Upload size={20} />
                  {submission ? 'Perbarui Jawaban' : 'Kumpulkan Tugas'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
