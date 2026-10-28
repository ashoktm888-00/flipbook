import React, { useState } from 'react';
import { X, Sliders, RotateCcw, Link2, Check } from 'lucide-react';
import { AutoFlipConfig, FlipbookMetadata } from '../types';
import { parseHeyzineUrl } from '../utils/heyzineData';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: FlipbookMetadata;
  onUpdateMetadata: (partial: Partial<FlipbookMetadata>) => void;
  config: AutoFlipConfig;
  onUpdateConfig: (partial: Partial<AutoFlipConfig>) => void;
  onResetDefaults: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  metadata,
  onUpdateMetadata,
  config,
  onUpdateConfig,
  onResetDefaults,
}) => {
  const [urlInput, setUrlInput] = useState(metadata.url);
  const [pagesInput, setPagesInput] = useState(metadata.totalPages.toString());
  const [savedUrlMsg, setSavedUrlMsg] = useState(false);

  if (!isOpen) return null;

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const parsed = parseHeyzineUrl(urlInput);
    const pagesCount = parseInt(pagesInput, 10) || metadata.totalPages;

    onUpdateMetadata({
      id: parsed.id,
      url: parsed.embedUrl,
      totalPages: pagesCount,
    });

    setSavedUrlMsg(true);
    setTimeout(() => setSavedUrlMsg(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Flipbook & Autopilot Settings</h2>
              <p className="text-xs text-slate-400">Configure publication sources and playback rules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Flipbook Source URL */}
          <form onSubmit={handleApplyUrl} className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Heyzine Publication URL
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://heyzine.com/flip-book/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shrink-0"
              >
                Apply
              </button>
            </div>
            {savedUrlMsg && (
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                <Check className="w-3.5 h-3.5" /> URL updated successfully!
              </p>
            )}

            <div className="flex items-center gap-2 pt-1">
              <label className="text-xs text-slate-400">Total Page Count:</label>
              <input
                type="number"
                min="1"
                max="9999"
                value={pagesInput}
                onChange={(e) => setPagesInput(e.target.value)}
                className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </form>

          {/* Autopilot Timing & Logic */}
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Autopilot Options
            </h3>

            {/* Delay Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Default Flip Delay</span>
                <span className="text-indigo-400 font-mono font-semibold">{config.delaySeconds} seconds</span>
              </div>
              <input
                type="range"
                min="1"
                max="60"
                step="0.5"
                value={config.delaySeconds}
                onChange={(e) => onUpdateConfig({ delaySeconds: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Step size */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-200 block">Pages to Advance per Tick</span>
                <span className="text-[11px] text-slate-400">Single page or 2-page magazine spread</span>
              </div>
              <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => onUpdateConfig({ step: 1 })}
                  className={`px-3 py-1 rounded text-xs font-mono ${
                    config.step === 1 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  1 Page
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateConfig({ step: 2 })}
                  className={`px-3 py-1 rounded text-xs font-mono ${
                    config.step === 2 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  2 Pages
                </button>
              </div>
            </div>

            {/* Pause on Hover */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-200 block">Pause on Hover</span>
                <span className="text-[11px] text-slate-400">Pauses countdown when mouse hovers (automatically bypassed in Fullscreen)</span>
              </div>
              <input
                type="checkbox"
                checked={config.pauseOnHover}
                onChange={(e) => onUpdateConfig({ pauseOnHover: e.target.checked })}
                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Loop */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-200 block">Loop Playback</span>
                <span className="text-[11px] text-slate-400">Rewind to page 1 upon reaching the final page</span>
              </div>
              <input
                type="checkbox"
                checked={config.loop}
                onChange={(e) => onUpdateConfig({ loop: e.target.checked })}
                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Audio volume */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Flip Sound Volume</span>
                <span className="text-indigo-400 font-mono">{Math.round(config.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={config.volume}
                onChange={(e) => onUpdateConfig({ volume: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onResetDefaults}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
