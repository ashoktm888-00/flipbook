import React, { useRef, useEffect, useState } from 'react';
import { FlipbookMetadata } from '../types';
import { 
  ExternalLink, 
  RefreshCw, 
  ShieldAlert, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  Maximize2
} from 'lucide-react';

interface HeyzineViewerProps {
  metadata: FlipbookMetadata;
  currentPage: number;
  autoFlipEnabled: boolean;
  remainingSeconds: number;
  delaySeconds: number;
  onPageChange: (newPage: number) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onToggleFullscreen: () => void;
}

export const HeyzineViewer: React.FC<HeyzineViewerProps> = ({
  metadata,
  currentPage,
  autoFlipEnabled,
  remainingSeconds,
  delaySeconds,
  onPageChange,
  onNextPage,
  onPrevPage,
  onMouseEnter,
  onMouseLeave,
  onToggleFullscreen,
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const prevPageRef = useRef<number>(currentPage);

  // Construct target URL with #page hash
  const currentEmbedSrc = `${metadata.url}#page/${currentPage}`;

  // Whenever currentPage changes, update the iframe hash or src
  useEffect(() => {
    if (!iframeRef.current) return;

    if (prevPageRef.current !== currentPage) {
      prevPageRef.current = currentPage;
      
      // Update iframe source hash smoothly
      try {
        if (iframeRef.current.contentWindow) {
          // If accessible or hash navigation
          iframeRef.current.src = currentEmbedSrc;
        } else {
          iframeRef.current.src = currentEmbedSrc;
        }
      } catch {
        iframeRef.current.src = currentEmbedSrc;
      }
    }
  }, [currentPage, currentEmbedSrc]);

  return (
    <div 
      className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950 overflow-hidden"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Background Subtle Gradient & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/30 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Top right floating quick actions */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-none">
        <button
          onClick={onToggleFullscreen}
          className="pointer-events-auto p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white/80 hover:text-white border border-slate-700/80 shadow-lg transition-all active:scale-95"
          title="Fullscreen Presentation (Auto-moving active)"
        >
          <Maximize2 className="w-4 h-4 text-indigo-400" />
        </button>
      </div>

      {/* Left & Right quick-click floating navigation zones */}
      <button
        onClick={onPrevPage}
        disabled={currentPage <= 1}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white/70 hover:text-white border border-slate-700/60 shadow-xl opacity-0 hover:opacity-100 transition-all active:scale-95 disabled:hidden"
        title="Previous Page"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={onNextPage}
        disabled={currentPage >= metadata.totalPages}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white/70 hover:text-white border border-slate-700/60 shadow-xl opacity-0 hover:opacity-100 transition-all active:scale-95 disabled:hidden"
        title="Next Page"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Main Iframe Container */}
      <div className="relative w-full h-full flex items-center justify-center p-0 md:p-2">
        {/* Loading placeholder skeleton */}
        {!iframeLoaded && !loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-10 text-slate-300 gap-4">
            <div className="w-12 h-12 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-200">Loading Heyzine Flipbook...</p>
              <p className="text-xs text-slate-400 font-mono mt-1">Connecting to {metadata.id} (Page {currentPage})</p>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={currentEmbedSrc}
          title="Heyzine Flipbook Viewer"
          className="w-full h-full border-0 rounded-none md:rounded-xl shadow-2xl bg-black"
          allow="fullscreen; autoplay; clipboard-write"
          allowFullScreen
          onLoad={() => {
            setIframeLoaded(true);
            setLoadError(false);
          }}
          onError={() => setLoadError(true)}
        />
      </div>

      {/* Bottom Hint Banner */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800/80 rounded-full px-3 py-1 text-[11px] text-slate-400 font-medium flex items-center gap-2 shadow-sm">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>Autopilot controls active: Page updates automatically every {delaySeconds}s</span>
        </div>
      </div>
    </div>
  );
};
