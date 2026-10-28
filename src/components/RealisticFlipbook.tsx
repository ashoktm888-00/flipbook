import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { FlipbookMetadata } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  AlertCircle,
  Loader2
} from 'lucide-react';

// Configure pdfjs worker to unpkg worker matching version
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface RealisticFlipbookProps {
  metadata: FlipbookMetadata;
  currentPage: number;
  onPageChange: (newPage: number) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
  isFlipping: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const RealisticFlipbook: React.FC<RealisticFlipbookProps> = ({
  metadata,
  currentPage,
  onPageChange,
  onNextPage,
  onPrevPage,
  isFlipping,
  onMouseEnter,
  onMouseLeave,
}) => {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const leftCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const singleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<{ [key: string]: any }>({});

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load PDF Document
  useEffect(() => {
    let isCancelled = false;
    setLoadingPdf(true);
    setLoadError(null);

    const load = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({
          url: metadata.pdfUrl,
          cMapUrl: 'https://unpkg.com/pdfjs-dist@' + pdfjsLib.version + '/cmaps/',
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (!isCancelled) {
          setPdfDoc(doc);
          setLoadingPdf(false);
        }
      } catch (err: any) {
        console.warn('Failed to load full PDF in realistic mode:', err);
        if (!isCancelled) {
          setLoadError(err?.message || 'Could not load PDF directly. Switch to Heyzine Embed mode for live viewing.');
          setLoadingPdf(false);
        }
      }
    };

    load();

    return () => {
      isCancelled = true;
    };
  }, [metadata.pdfUrl]);

  // Render a specific page onto a canvas
  const renderPageToCanvas = useCallback(
    async (pageNumber: number, canvas: HTMLCanvasElement | null, targetWidth: number) => {
      if (!canvas || !pdfDoc || pageNumber < 1 || pageNumber > pdfDoc.numPages) {
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        return;
      }

      try {
        // Cancel ongoing render task for this canvas if any
        const canvasId = canvas.id || Math.random().toString();
        if (renderTaskRef.current[canvasId]) {
          try {
            renderTaskRef.current[canvasId].cancel();
          } catch {}
        }

        const page = await pdfDoc.getPage(pageNumber);
        const unscaledViewport = page.getViewport({ scale: 1 });
        const scale = (targetWidth / unscaledViewport.width) * zoomLevel;
        const viewport = page.getViewport({ scale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
          canvas: canvas,
        };

        const task = page.render(renderContext as any);
        renderTaskRef.current[canvasId] = task;
        await task.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.warn('Canvas render error:', err);
        }
      }
    },
    [pdfDoc, zoomLevel]
  );

  // Render current spread / single page when currentPage or zoom changes
  useEffect(() => {
    if (!pdfDoc) return;

    // In dual-page mode:
    // If currentPage is 1 (cover), show only on right or single
    // Otherwise left is currentPage (if even) or currentPage - 1
    const containerWidth = isMobile ? window.innerWidth - 32 : (window.innerWidth - 120) / 2;
    const targetWidth = Math.min(600, Math.max(300, containerWidth));

    if (isMobile) {
      renderPageToCanvas(currentPage, singleCanvasRef.current, Math.min(500, window.innerWidth - 48));
    } else {
      if (currentPage === 1) {
        // Cover page on the right side
        renderPageToCanvas(0, leftCanvasRef.current, targetWidth);
        renderPageToCanvas(1, rightCanvasRef.current, targetWidth);
      } else {
        const leftPageNum = currentPage % 2 === 0 ? currentPage : currentPage - 1;
        const rightPageNum = leftPageNum + 1;
        renderPageToCanvas(leftPageNum, leftCanvasRef.current, targetWidth);
        renderPageToCanvas(rightPageNum <= pdfDoc.numPages ? rightPageNum : 0, rightCanvasRef.current, targetWidth);
      }
    }
  }, [pdfDoc, currentPage, isMobile, zoomLevel, renderPageToCanvas]);

  return (
    <div 
      className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-8 bg-slate-950 overflow-hidden select-none"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Zoom / View controls floating */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-800 text-xs">
        <button
          onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-[11px] font-mono text-slate-400 w-12 text-center">
          {Math.round(zoomLevel * 100)}%
        </span>
        <button
          onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.15))}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel(1.0)}
          className="px-2 py-1 text-[11px] rounded text-slate-400 hover:text-white"
        >
          Reset
        </button>
      </div>

      {/* Loading State */}
      {loadingPdf && (
        <div className="flex flex-col items-center justify-center gap-3 text-slate-300">
          <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
          <p className="text-sm font-medium">Preparing High-Res 3D Flipbook...</p>
          <p className="text-xs text-slate-500 font-mono">Fetching document pages</p>
        </div>
      )}

      {/* Error Fallback */}
      {loadError && !loadingPdf && (
        <div className="max-w-md p-6 bg-slate-900/90 border border-amber-500/30 rounded-2xl text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="text-base font-semibold text-slate-100">Live Heyzine Mode Active</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The full high-res PDF is best viewed via the official Heyzine viewer with direct Autopilot control enabled.
          </p>
          <div className="pt-2">
            <span className="text-xs text-indigo-400">
              Switching back to Heyzine Embed tab will show the live flipbook with your auto-flip timer!
            </span>
          </div>
        </div>
      )}

      {/* Book Container */}
      {!loadingPdf && !loadError && (
        <div className="relative flex items-center justify-center max-h-[85vh] perspective-1000">
          {/* Navigation Edge Buttons */}
          <button
            onClick={onPrevPage}
            disabled={currentPage <= 1}
            className="absolute -left-12 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white/80 hover:text-white border border-slate-700/60 shadow-xl disabled:opacity-20 disabled:pointer-events-none transition-all"
            title="Previous Page"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={onNextPage}
            disabled={currentPage >= metadata.totalPages}
            className="absolute -right-12 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white/80 hover:text-white border border-slate-700/60 shadow-xl disabled:opacity-20 disabled:pointer-events-none transition-all"
            title="Next Page"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dual-Page Magazine Spreads */}
          {!isMobile ? (
            <div className={`relative flex items-center bg-stone-900 p-2 md:p-3 rounded-lg book-shadow transition-transform duration-500 ${
              isFlipping ? 'scale-[0.99]' : 'scale-100'
            }`}>
              {/* Left Page */}
              <div 
                onClick={onPrevPage}
                className="relative bg-white rounded-l shadow-inner overflow-hidden cursor-pointer group min-w-[280px] min-h-[380px] flex items-center justify-center"
              >
                <canvas id="canvas-left" ref={leftCanvasRef} className="max-h-[75vh] w-auto object-contain block shadow-sm" />
                <div className="absolute inset-0 page-shadow-left pointer-events-none" />
                <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-colors pointer-events-none" />
                {currentPage > 1 && (
                  <div className="absolute bottom-2 left-4 text-[10px] text-slate-400 font-mono">
                    Page {currentPage % 2 === 0 ? currentPage : currentPage - 1}
                  </div>
                )}
              </div>

              {/* Book Spine Crease & Shadow */}
              <div className="w-3 h-full bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 shadow-inner z-10" />

              {/* Right Page */}
              <div 
                onClick={onNextPage}
                className="relative bg-white rounded-r shadow-inner overflow-hidden cursor-pointer group min-w-[280px] min-h-[380px] flex items-center justify-center"
              >
                <canvas id="canvas-right" ref={rightCanvasRef} className="max-h-[75vh] w-auto object-contain block shadow-sm" />
                <div className="absolute inset-0 page-shadow-right pointer-events-none" />
                <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-colors pointer-events-none" />
                <div className="absolute bottom-2 right-4 text-[10px] text-slate-400 font-mono">
                  Page {currentPage === 1 ? 1 : (currentPage % 2 === 0 ? currentPage + 1 : currentPage)}
                </div>
              </div>
            </div>
          ) : (
            /* Single Page View on Mobile */
            <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden p-1">
              <canvas id="canvas-single" ref={singleCanvasRef} className="max-h-[70vh] w-auto object-contain block" />
              <div className="absolute bottom-2 right-4 text-[10px] text-slate-500 font-mono bg-white/80 px-2 py-0.5 rounded shadow">
                Page {currentPage} of {metadata.totalPages}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
