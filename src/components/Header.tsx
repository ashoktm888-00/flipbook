import React from 'react';
import { 
  BookOpen, 
  Layers, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  Code, 
  ExternalLink,
  Sliders,
  Bookmark
} from 'lucide-react';
import { FlipbookMetadata, ViewMode } from '../types';

interface HeaderProps {
  metadata: FlipbookMetadata;
  currentPage: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenEmbedModal: () => void;
  onOpenSettingsModal: () => void;
  onSelectSection: (page: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  metadata,
  currentPage,
  viewMode,
  onViewModeChange,
  isFullscreen,
  onToggleFullscreen,
  soundEnabled,
  onToggleSound,
  onOpenEmbedModal,
  onOpenSettingsModal,
  onSelectSection,
}) => {
  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 md:px-6 flex items-center justify-between text-white select-none z-30 transition-all shrink-0">
      {/* Brand & Publication Name */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-sm md:text-base text-slate-100 truncate tracking-tight">
              {metadata.title}
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Autopilot Ready
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Page <strong className="text-indigo-400 font-semibold">{currentPage}</strong> of {metadata.totalPages}</span>
            <span className="text-slate-600">•</span>
            <a 
              href={metadata.url} 
              target="_blank" 
              rel="noreferrer" 
              className="inline-flex items-center gap-1 hover:text-slate-200 transition-colors"
              title="Open source Heyzine publication in new tab"
            >
              heyzine.com <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Chapters / Sections Dropdown & Mode Selector */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Sections Quick Jump */}
        <div className="hidden lg:flex items-center">
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-colors">
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              <span>Chapters</span>
            </button>
            <div className="absolute top-full right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 hidden group-hover:block group-focus-within:block z-50 max-h-80 overflow-y-auto">
              <div className="text-[11px] uppercase font-semibold text-slate-400 px-3 py-1.5 tracking-wider">
                Jump to Section
              </div>
              {metadata.sections.map((section, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectSection(section.page)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    currentPage >= section.page && (idx === metadata.sections.length - 1 || currentPage < metadata.sections[idx + 1].page)
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="truncate pr-2">{section.title}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    p.{section.page}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* View Mode Toggle: Heyzine Embed vs Realistic 3D Magazine */}
        <div className="bg-slate-800/80 p-0.5 rounded-xl border border-slate-700/60 flex items-center text-xs">
          <button
            onClick={() => onViewModeChange('heyzine')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              viewMode === 'heyzine'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Interactive Heyzine Viewer with Automated Controller"
          >
            <span>Heyzine Embed</span>
          </button>
          <button
            onClick={() => onViewModeChange('realistic-3d')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              viewMode === 'realistic-3d'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Realistic 3D Flipbook Magazine Reader"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">3D Flipbook</span>
          </button>
        </div>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          className={`p-2 rounded-lg border transition-colors ${
            soundEnabled 
              ? 'bg-slate-800 text-indigo-400 border-slate-700 hover:bg-slate-700' 
              : 'bg-slate-900/60 text-slate-500 border-slate-800 hover:bg-slate-800 hover:text-slate-400'
          }`}
          title={soundEnabled ? 'Mute page flip sound' : 'Enable page flip sound'}
          aria-label="Toggle flip sound"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Embed code dialog */}
        <button
          onClick={onOpenEmbedModal}
          className="p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/60 hover:bg-slate-700/80 transition-colors hidden sm:flex items-center gap-1"
          title="Get embed code with auto-flip timer"
        >
          <Code className="w-4 h-4" />
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettingsModal}
          className="p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/60 hover:bg-slate-700/80 transition-colors"
          title="Configure flipbook source URL and auto-flip rules"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Fullscreen toggle */}
        <button
          onClick={onToggleFullscreen}
          className="p-2 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Kiosk / Fullscreen Presentation Mode'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
