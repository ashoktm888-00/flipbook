import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  Minimize2, 
  Clock, 
  RotateCcw,
  Volume2,
  VolumeX,
  Flame
} from 'lucide-react';
import { AutoFlipConfig } from '../types';

interface FullscreenHUDProps {
  isVisible: boolean;
  config: AutoFlipConfig;
  onUpdateConfig: (partial: Partial<AutoFlipConfig>) => void;
  currentPage: number;
  totalPages: number;
  remainingSeconds: number;
  onNextPage: () => void;
  onPrevPage: () => void;
  onExitFullscreen: () => void;
}

export const FullscreenHUD: React.FC<FullscreenHUDProps> = ({
  isVisible,
  config,
  onUpdateConfig,
  currentPage,
  totalPages,
  remainingSeconds,
  onNextPage,
  onPrevPage,
  onExitFullscreen,
}) => {
  const [showControls, setShowControls] = useState(true);

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    if (!isVisible) return;

    let timeout: NodeJS.Timeout;
    const resetTimer = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    resetTimer();

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      clearTimeout(timeout);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const progressRatio = config.enabled && config.delaySeconds > 0
    ? Math.max(0, Math.min(1, (config.delaySeconds - remainingSeconds) / config.delaySeconds))
    : 0;

  return (
    <>
      {/* Top subtle progress bar in fullscreen */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1.5 bg-black/40">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 via-violet-400 to-pink-500 transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(99,102,241,0.5)]"
          style={{ width: `${progressRatio * 100}%` }}
        />
      </div>

      {/* Top-Right Quick Exit Button (Always accessible) */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={onExitFullscreen}
          className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 shadow-xl backdrop-blur-md flex items-center gap-1.5 text-xs font-medium transition-all active:scale-95"
          title="Exit Fullscreen Mode (Esc)"
        >
          <Minimize2 className="w-3.5 h-3.5" />
          <span>Exit Fullscreen</span>
        </button>
      </div>

      {/* Floating Pill HUD at bottom center */}
      <div 
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 transform select-none ${
          showControls 
            ? 'opacity-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl px-4 py-2.5 shadow-2xl flex items-center gap-3 text-white">
          
          {/* Play/Pause */}
          <button
            onClick={() => onUpdateConfig({ enabled: !config.enabled })}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-md active:scale-95 ${
              config.enabled
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-indigo-600 text-white hover:bg-indigo-500'
            }`}
            title={config.enabled ? 'Pause Auto-Flip (Space)' : 'Start Auto-Flip (Space)'}
          >
            {config.enabled ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          {/* Countdown & Status */}
          <div className="flex flex-col pr-2 border-r border-slate-700/60">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {config.enabled ? 'Autoplay Moving' : 'Paused'}
            </span>
            <span className="text-xs font-mono text-slate-300">
              Flip: <strong className="text-indigo-300">{remainingSeconds.toFixed(1)}s</strong> / {config.delaySeconds}s
            </span>
          </div>

          {/* Speed Presets */}
          <div className="hidden sm:flex items-center gap-1 pr-2 border-r border-slate-700/60">
            {[2, 5, 8, 12].map((sec) => (
              <button
                key={sec}
                onClick={() => onUpdateConfig({ delaySeconds: sec })}
                className={`px-2 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                  config.delaySeconds === sec
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title={`Set delay to ${sec}s`}
              >
                {sec}s
              </button>
            ))}
          </div>

          {/* Previous / Next Page */}
          <div className="flex items-center gap-1">
            <button
              onClick={onPrevPage}
              disabled={currentPage <= 1}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-2 text-xs font-mono text-slate-200">
              <span className="text-indigo-400 font-bold">{currentPage}</span> / {totalPages}
            </div>
            <button
              onClick={onNextPage}
              disabled={currentPage >= totalPages && !config.loop}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Sound toggle */}
          <button
            onClick={() => onUpdateConfig({ soundEnabled: !config.soundEnabled })}
            className={`p-2 rounded-lg transition-colors border-l border-slate-700/60 pl-3 ${
              config.soundEnabled ? 'text-indigo-400 hover:text-indigo-300' : 'text-slate-500 hover:text-slate-400'
            }`}
            title={config.soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {config.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Exit Fullscreen */}
          <button
            onClick={onExitFullscreen}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Exit Fullscreen (Esc)"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
};
