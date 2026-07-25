"use client";
import { useEffect, useState, useCallback, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, Loader2, AlertCircle, ExternalLink, Maximize, Minimize, ZoomIn, ZoomOut } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';

// Point pdf.js worker at the bundled version from react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

function isSignedSupabaseUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.pathname.includes('/storage/v1/object/sign/');
  } catch {
    return false;
  }
}

interface PdfViewerProps {
  materiId: string;
  title?: string;
}

export default function PdfViewer({ materiId, title }: PdfViewerProps) {
  const { t } = useLocale();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [scale, setScale] = useState(1);
  const [pageSize, setPageSize] = useState<{ width: number; height: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset scale on page change or document load
  useEffect(() => {
    setScale(1);
  }, [currentPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevPage();
      } else if (e.key === 'ArrowRight') {
        nextPage();
      } else if (e.key === 'Escape' && isFullScreen) {
        toggleFullScreen();
      } else if (e.key === '+' || e.key === '=') {
        setScale(s => Math.min(s + 0.25, 3));
      } else if (e.key === '-') {
        setScale(s => Math.max(s - 0.25, 0.5));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [numPages, currentPage, isFullScreen]);

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

  const onLoadSuccess = useCallback((page: any) => {
    setPageSize({ width: page.view[2], height: page.view[3] });
  }, []);

  const prevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const nextPage = () => setCurrentPage((p) => Math.min(numPages, p + 1));

  const toggleFullScreen = async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullScreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    hideControlsTimeoutRef.current = setTimeout(() => {
      if (isFullScreen) {
        setShowControls(false);
      }
    }, 3000);
  }, [isFullScreen]);

  const handleDoubleClick = useCallback(() => {
    setScale(s => s === 1 ? 2 : 1);
  }, []);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
      if (document.fullscreenElement) {
        setShowControls(true);
        hideControlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      } else {
        setShowControls(true);
        if (hideControlsTimeoutRef.current) {
          clearTimeout(hideControlsTimeoutRef.current);
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, []);

  // Calculate page width based on container and page ratio
  const getPageWidth = useCallback(() => {
    if (typeof window === 'undefined') return 800;
    
    const containerWidth = isFullScreen ? window.innerWidth : Math.min(window.innerWidth - 64, 1200);
    const containerHeight = isFullScreen ? window.innerHeight - 120 : 700;
    
    if (pageSize) {
      const pageRatio = pageSize.width / pageSize.height;
      const containerRatio = containerWidth / containerHeight;
      
      if (pageRatio > containerRatio) {
        // Landscape page - fit to width
        return Math.min(containerWidth * 0.95, 1400);
      } else {
        // Portrait page - fit to height
        const widthByHeight = containerHeight * 0.95 * pageRatio;
        return Math.min(widthByHeight, containerWidth * 0.95, 1400);
      }
    }
    
    return isFullScreen ? Math.min(window.innerWidth * 0.9, 1400) : Math.min(window.innerWidth - 64, 900);
  }, [isFullScreen, pageSize]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-2xl border border-gray-200">
        <Loader2 size={48} className="animate-spin text-brand-blue" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-2xl border border-gray-200 gap-3 text-center px-6">
        <AlertCircle size={48} className="text-red-400" />
        <p className="text-gray-600 font-medium">{loadError}</p>
      </div>
    );
  }

  const isSupabaseUrl = pdfUrl && isSignedSupabaseUrl(pdfUrl);

  if (!isSupabaseUrl) {
    if (!pdfUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-2xl border border-gray-200">
          <AlertCircle size={48} className="text-red-400 mb-4" />
          <p className="text-gray-600 font-medium">{t('materi.pdfViewer.notFound')}</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center gap-6 py-8 bg-gray-50 rounded-2xl border border-gray-200">
        <div className="text-center px-6">
          <AlertCircle size={48} className="text-brand-blue mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Dokumen Tersedia
          </h3>
          <p className="text-gray-600 mb-6">
            Silakan buka dokumen di tab baru untuk melihatnya.
          </p>
        </div>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-brand-blue text-white px-6 py-3 rounded-xl hover:bg-brand-blue/90 transition-colors font-medium"
        >
          <ExternalLink size={20} />
          Buka Dokumen di Tab Baru
        </a>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex flex-col items-center gap-4 ${isFullScreen ? 'fixed inset-0 z-[9999] bg-black p-4' : ''}`}
      onContextMenu={(e) => e.preventDefault()}
      onMouseMove={isFullScreen ? handleMouseMove : undefined}
      onClick={isFullScreen ? handleMouseMove : undefined}
      onDoubleClick={handleDoubleClick}
    >
      {/* PDF canvas area */}
      <div className={`w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100 flex justify-center items-center relative flex-1 ${isFullScreen ? 'rounded-none border-none shadow-none' : ''}`}>
        {/* Fullscreen button */}
        <button
          onClick={toggleFullScreen}
          className={`absolute top-4 right-4 z-[10000] bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg hover:bg-white transition-all duration-300`}
          style={{ opacity: isFullScreen ? (showControls ? 1 : 0) : 1 }}
          aria-label={isFullScreen ? "Keluar layar penuh" : "Layar penuh"}
        >
          {isFullScreen ? <Minimize size={24} /> : <Maximize size={24} />}
        </button>
        
        <div className="overflow-auto max-h-full w-full flex justify-center">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex items-center justify-center h-full">
                <Loader2 size={48} className="animate-spin text-brand-blue" />
              </div>
            }
          >
            <Page
              pageNumber={currentPage}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="max-w-full"
              width={getPageWidth()}
              scale={scale}
              onLoadSuccess={onLoadSuccess}
            />
          </Document>
        </div>
      </div>

      {/* Navigation */}
      {numPages > 0 && (
        <div
          className={`flex items-center gap-4 bg-white rounded-2xl border border-gray-200 shadow-lg px-6 py-3 transition-all duration-300 ${
            isFullScreen ? 'fixed bottom-4 left-1/2 -translate-x-1/2 z-[10000]' : ''
          }`}
          style={{ opacity: isFullScreen ? (showControls ? 1 : 0) : 1 }}
        >
          <button
            onClick={prevPage}
            disabled={currentPage <= 1}
            className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label={t('materi.pdfViewer.prevPage')}
          >
            <ChevronLeft size={20} className="text-gray-700" />
          </button>

          <span className="text-base font-semibold text-gray-700 min-w-[80px] text-center">
            {currentPage} / {numPages}
          </span>

          <button
            onClick={nextPage}
            disabled={currentPage >= numPages}
            className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label={t('materi.pdfViewer.nextPage')}
          >
            <ChevronRight size={20} className="text-gray-700" />
          </button>

          <div className="w-px h-6 bg-gray-200 mx-2" />

          <button
            onClick={() => setScale(s => Math.max(s - 0.25, 0.5))}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label={t('materi.pdfViewer.zoomOut')}
          >
            <ZoomOut size={20} className="text-gray-700" />
          </button>

          <span className="text-sm font-medium text-gray-600 min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={() => setScale(s => Math.min(s + 0.25, 3))}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label={t('materi.pdfViewer.zoomIn')}
          >
            <ZoomIn size={20} className="text-gray-700" />
          </button>
        </div>
      )}
    </div>
  );
}
