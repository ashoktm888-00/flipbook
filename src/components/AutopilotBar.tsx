import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Clock, 
  Flame, 
  ArrowRightLeft,
  MousePointer,
  HelpCircle
} from 'lucide-react';
import { AutoFlipConfig } from '../types';

interface AutopilotBarProps {
  config: AutoFlipConfig;
  onUpdateConfig: (partial: Partial<AutoFlipConfig>) => void;
  currentPage: number;
  totalPages: number;
  remainingSeconds: number; // dynamically passed from timer
  onNextPage: () => void;
  onPrevPage: () => void;
  onGoToPage: (page: number) => void;
  isHovered: boolean;
}

export const AutopilotBar: React.FC<AutopilotBarProps> = ({
  config,
  onUpdateConfig,
  currentPage,
  totalPages,
  remainingSeconds,
  onNextPage,
  onPrevPage,
  onGoToPage,
  isHovered,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [inputPageVal, setInputPageVal] = useState<string>('');

  const presets = [2, 3, 5, 8, 10, 15];

  // Calculate circular progress (0 to 100%)
  const progressRatio = config.enabled && config.delaySeconds > 0
    ? Math.max(0, Math.min(1, (config.delaySeconds - remainingSeconds) / config.delaySeconds))
    : 0;

  const circleRadius = 18;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(inputPageVal, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      onGoToPage(p);
      setInputPageVal('');
    }
  };

  return (
    <div className="bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-white select-none z-30 transition-all shadow-2xl">
      {/* Top linear progress bar for auto-flip timer */}
      <div className="w-full bg-slate-800 h-1 overflow-hidden relative">
        <div 
          className={`h-full transition-all duration-100 ease-linear ${
            config.enabled && (!config.pauseOnHover || !isHovered)
              ? 'bg-gradient-to-r from-indigo-500 via-violet-400 to-pink-500'
              : 'bg-amber-500'
          }`}
          style={{ width: `${progressRatio * 100}%` }}
        />
        {config.enabled && config.pauseOnHover && isHovered && (
          <div className="absolute top-0 right-2 text-[9px] text-amber-300 font-mono tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block"></span>
            PAUSED (HOVER)
          </div>
        )}
      </div>

      <div className="px-4 py-3 md:px-6 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6">
        
        {/* Left Section: Play / Pause + Visual Radial Timer */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            {/* Play/Pause Button with circular countdown indicator */}
            <div className="relative flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90 pointer-events-none" viewBox="0 0 44 44">
                <circle
                  cx="22"
                  cy="22"
                  r={circleRadius}
                  className="stroke-slate-800"
                  strokeWidth="3.5"
                  fill="transparent"
                />
                <circle
                  cx="22"
                  cy="22"
                  r={circleRadius}
                  className={`transition-all duration-100 ease-linear ${
                    config.enabled ? 'stroke-indigo-500' : 'stroke-slate-700'
                  }`}
                  strokeWidth="3.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={config.enabled ? strokeDashoffset : circumference}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <button
                onClick={() => onUpdateConfig({ enabled: !config.enabled })}
                className={`absolute w-9 h-9 rounded-full flex items-center justify-center transition-all transform active:scale-95 shadow-lg ${
                  config.enabled
                    ? 'bg-gradient-to-tr from-amber-500 to-orange-400 text-slate-950 shadow-amber-500/30'
                    : 'bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-indigo-500/30 hover:brightness-110'
                }`}
                title={config.enabled ? 'Pause automatic page flipping (Space)' : 'Start automatic page flipping (Space)'}
              >
                {config.enabled ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>
            </div>

            {/* Status & Remaining Seconds */}
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold uppercase tracking-wider ${
                  config.enabled ? 'text-emerald-400' : 'text-slate-400'
                }`}>
                  {config.enabled ? (
                    config.pauseOnHover && isHovered ? 'Hover Paused' : 'Auto-Flipping'
                  ) : (
                    'Autopilot Off'
                  )}
                </span>
                {config.enabled && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-indigo-400" />
                {config.enabled ? (
                  <span>Next flip: <strong className="text-slate-200">{remainingSeconds.toFixed(1)}s</strong> / {config.delaySeconds}s</span>
                ) : (
                  <span>Delay: <strong className="text-slate-200">{config.delaySeconds}s</strong> per page</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick preset pills for mobile */}
          <div className="flex md:hidden items-center gap-1 bg-slate-800/80 p-1 rounded-lg">
            {[2, 5, 10].map((sec) => (
              <button
                key={sec}
                onClick={() => onUpdateConfig({ delaySeconds: sec })}
                className={`px-2 py-0.5 rounded text-[11px] font-medium font-mono ${
                  config.delaySeconds === sec
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>

        {/* Center Section: Configurable Delay Timer Controls */}
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          {/* Preset Buttons */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <span className="text-[11px] font-medium text-slate-400 px-2 flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" /> Speed:
            </span>
            {presets.map((sec) => (
              <button
                key={sec}
                onClick={() => onUpdateConfig({ delaySeconds: sec })}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${
                  config.delaySeconds === sec
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
                title={`Flip page every ${sec} seconds`}
              >
                {sec}s
              </button>
            ))}
          </div>

          {/* Delay Slider + Direct Seconds Input */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 w-full md:w-auto">
            <span className="text-xs text-slate-400 whitespace-nowrap">Timer:</span>
            <input
              type="range"
              min="1"
              max="30"
              step="0.5"
              value={config.delaySeconds}
              onChange={(e) => onUpdateConfig({ delaySeconds: parseFloat(e.target.value) })}
              className="w-24 sm:w-32 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              title="Drag to change flip delay (1s to 30s)"
            />
            <div className="flex items-center">
              <input
                type="number"
                min="0.5"
                max="120"
                step="0.5"
                value={config.delaySeconds}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val > 0) {
                    onUpdateConfig({ delaySeconds: val });
                  }
                }}
                className="w-12 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs font-mono text-center text-indigo-300 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[11px] text-slate-400 ml-1">sec</span>
            </div>
          </div>
        </div>

        {/* Right Section: Navigation Controls & Page Scrubber */}
        <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-3 w-full md:w-auto">
          {/* Previous / Next buttons */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => onGoToPage(1)}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="First page"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={onPrevPage}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-slate-700/60 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Previous page (Left Arrow)"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Page indicator & direct jump */}
            <form onSubmit={handlePageInputSubmit} className="flex items-center px-1.5">
              <input
                type="text"
                placeholder={String(currentPage)}
                value={inputPageVal}
                onChange={(e) => setInputPageVal(e.target.value)}
                onBlur={() => setInputPageVal('')}
                className="w-10 bg-slate-900 text-center text-xs font-mono font-semibold text-slate-100 rounded border border-slate-700 py-0.5 focus:outline-none focus:border-indigo-500"
                title="Type page number and press Enter"
              />
              <span className="text-xs text-slate-400 font-mono ml-1.5 mr-0.5">/ {totalPages}</span>
            </form>

            <button
              onClick={onNextPage}
              disabled={currentPage >= totalPages && !config.loop}
              className="p-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-slate-700/60 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Next page (Right Arrow)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => onGoToPage(totalPages)}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Last page"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Loop toggle */}
          <button
            onClick={() => onUpdateConfig({ loop: !config.loop })}
            className={`p-2 rounded-xl border transition-colors ${
              config.loop
                ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30'
                : 'bg-slate-800/80 text-slate-500 border-slate-700/60 hover:text-slate-300'
            }`}
            title={config.loop ? 'Loop Mode: Enabled (restarts automatically)' : 'Loop Mode: Disabled (stops at end)'}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Direction toggle */}
          <button
            onClick={() => onUpdateConfig({ 
              direction: config.direction === 'forward' ? 'backward' : 'forward' 
            })}
            className={`p-2 rounded-xl border transition-colors hidden sm:flex items-center gap-1 ${
              config.direction === 'backward'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-slate-200'
            }`}
            title={`Auto-Flip Direction: ${config.direction === 'forward' ? 'Forward (1 → 156)' : 'Reverse (156 → 1)'}`}
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>

          {/* Hover-pause toggle */}
          <button
            onClick={() => onUpdateConfig({ pauseOnHover: !config.pauseOnHover })}
            className={`p-2 rounded-xl border transition-colors hidden md:flex items-center gap-1 ${
              config.pauseOnHover
                ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30'
                : 'bg-slate-800/80 text-slate-500 border-slate-700/60 hover:text-slate-300'
            }`}
            title={config.pauseOnHover ? 'Auto-Pause on Hover: Active' : 'Auto-Pause on Hover: Off'}
          >
            <MousePointer className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
