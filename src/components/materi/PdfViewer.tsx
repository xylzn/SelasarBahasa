'use client';

import { useEffect, useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';

// Point pdf.js worker at the bundled version from react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface PdfViewerProps {
  /** The Prisma id of the Materi record — used to fetch a signed URL */
  materiId: string;
  title?: string;
}

export default function PdfViewer({ materiId, title }: PdfViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch signed URL on mount
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);

    fetch(`/api/materi/${materiId}/pdf-url`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        return res.json() as Promise<{ url: string }>;
      })
      .then(({ url }) => {
        if (!cancelled) setPdfUrl(url);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('[PdfViewer] Failed to fetch signed URL:', err);
          setLoadError(err.message ?? 'Gagal memuat dokumen');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [materiId]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setCurrentPage(1);
  }, []);

  const onDocumentLoadError = useCallback((err: Error) => {
    console.error('[PdfViewer] Document load error:', err);
    setLoadError('Gagal memuat PDF. Silakan muat ulang halaman.');
  }, []);

  const prevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const nextPage = () => setCurrentPage((p) => Math.min(numPages, p + 1));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-2xl border border-gray-200">
        <Loader2 size={32} className="animate-spin text-brand-blue" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-2xl border border-gray-200 gap-3 text-center px-6">
        <AlertCircle size={32} className="text-red-400" />
        <p className="text-gray-600 font-medium">{loadError}</p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center gap-4"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* PDF canvas area */}
      <div className="w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100 flex justify-center">
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex items-center justify-center h-64">
              <Loader2 size={28} className="animate-spin text-brand-blue" />
            </div>
          }
        >
          <Page
            pageNumber={currentPage}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="max-w-full"
            width={typeof window !== 'undefined' ? Math.min(window.innerWidth - 64, 900) : 800}
          />
        </Document>
      </div>

      {/* Navigation */}
      {numPages > 0 && (
        <div className="flex items-center gap-4 bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-3">
          <button
            onClick={prevPage}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-xl hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft size={20} className="text-gray-700" />
          </button>

          <span className="text-sm font-medium text-gray-700 min-w-[80px] text-center">
            {currentPage} / {numPages}
          </span>

          <button
            onClick={nextPage}
            disabled={currentPage >= numPages}
            className="p-1.5 rounded-xl hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Halaman berikutnya"
          >
            <ChevronRight size={20} className="text-gray-700" />
          </button>
        </div>
      )}
    </div>
  );
}
