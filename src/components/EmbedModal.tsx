import React, { useState } from 'react';
import { X, Copy, Check, Code, Sparkles, ExternalLink } from 'lucide-react';
import { AutoFlipConfig, FlipbookMetadata } from '../types';

interface EmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: FlipbookMetadata;
  config: AutoFlipConfig;
}

export const EmbedModal: React.FC<EmbedModalProps> = ({
  isOpen,
  onClose,
  metadata,
  config,
}) => {
  const [copied, setCopied] = useState(false);
  const [embedWidth, setEmbedWidth] = useState('100%');
  const [embedHeight, setEmbedHeight] = useState('600px');

  if (!isOpen) return null;

  // Generate responsive HTML snippet that can be placed on any site
  const embedCode = `<!-- AutoFlip Powered Heyzine Embed -->
<div style="position: relative; width: ${embedWidth}; height: ${embedHeight}; max-width: 100%; margin: 0 auto;">
  <iframe
    id="autoflip-heyzine-player"
    src="${metadata.url}#page/1"
    width="100%"
    height="100%"
    frameborder="0"
    allow="fullscreen; autoplay; clipboard-write"
    allowfullscreen
    style="border: none; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);"
  ></iframe>
  <script>
    (function() {
      var iframe = document.getElementById('autoflip-heyzine-player');
      var currentPage = 1;
      var totalPages = ${metadata.totalPages};
      var delayMs = ${Math.round(config.delaySeconds * 1000)};
      var loop = ${config.loop};

      setInterval(function() {
        currentPage += ${config.step};
        if (currentPage > totalPages) {
          if (loop) {
            currentPage = 1;
          } else {
            return;
          }
        }
        iframe.src = '${metadata.url}#page/' + currentPage;
      }, delayMs);
    })();
  </script>
</div>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Embed with Auto-Flip Timer</h2>
              <p className="text-xs text-slate-400">Generate iframe embed code with your configured delay timer</p>
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
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Settings preview */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <span className="text-[11px] text-slate-400 block">Current Delay</span>
              <strong className="text-sm text-indigo-300 font-mono">{config.delaySeconds} seconds</strong>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <span className="text-[11px] text-slate-400 block">Looping</span>
              <strong className="text-sm text-emerald-400">{config.loop ? 'Enabled' : 'Disabled'}</strong>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-slate-400 block">Total Pages</span>
              <strong className="text-sm text-slate-200 font-mono">{metadata.totalPages} pages</strong>
            </div>
          </div>

          {/* Size inputs */}
          <div className="flex items-center gap-4 text-xs text-slate-300">
            <label className="flex items-center gap-1.5">
              <span>Width:</span>
              <input
                type="text"
                value={embedWidth}
                onChange={(e) => setEmbedWidth(e.target.value)}
                className="w-20 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono"
              />
            </label>
            <label className="flex items-center gap-1.5">
              <span>Height:</span>
              <input
                type="text"
                value={embedHeight}
                onChange={(e) => setEmbedHeight(e.target.value)}
                className="w-20 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono"
              />
            </label>
          </div>

          {/* Code block */}
          <div className="relative">
            <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-56">
              <code>{embedCode}</code>
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-2.5 right-2.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-lg transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Paste this snippet into WordPress, Webflow, Shopify, Wix, or any custom HTML page. The flipbook will automatically advance pages according to your configured delay timer.
          </p>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
