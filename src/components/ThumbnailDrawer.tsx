import React from 'react';
import { FlipbookMetadata } from '../types';
import { ChevronUp, ChevronDown, Image as ImageIcon } from 'lucide-react';

interface ThumbnailDrawerProps {
  metadata: FlipbookMetadata;
  currentPage: number;
  isOpen: boolean;
  onToggle: () => void;
  onSelectPage: (page: number) => void;
}

export const ThumbnailDrawer: React.FC<ThumbnailDrawerProps> = ({
  metadata,
  currentPage,
  isOpen,
  onToggle,
  onSelectPage,
}) => {
  // Generate pages list
  const pages = Array.from({ length: metadata.totalPages }, (_, i) => i + 1);

  return (
    <div className="z-20 w-full transition-all">
      {/* Toggle button tab */}
      <div className="flex justify-center -mb-px">
        <button
          onClick={onToggle}
          className="bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white px-4 py-1 rounded-t-xl border-t border-x border-slate-800 text-xs font-medium flex items-center gap-1.5 shadow-lg backdrop-blur-sm transition-colors"
        >
          <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
          <span>Thumbnails ({metadata.totalPages} pages)</span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5 ml-1" /> : <ChevronUp className="w-3.5 h-3.5 ml-1" />}
        </button>
      </div>

      {/* Drawer content */}
      {isOpen && (
        <div className="bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3 shadow-2xl animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 px-2 snap-x">
            {pages.map((pageNum) => {
              const isSelected = pageNum === currentPage;
              const section = metadata.sections.find((s) => s.page === pageNum);

              return (
                <button
                  key={pageNum}
                  onClick={() => onSelectPage(pageNum)}
                  className={`flex-shrink-0 flex flex-col items-center gap-1 p-1 rounded-lg transition-all group snap-center ${
                    isSelected
                      ? 'bg-indigo-600/20 ring-2 ring-indigo-500 scale-105'
                      : 'hover:bg-slate-800/80 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="w-14 h-20 bg-slate-800 rounded border border-slate-700/80 overflow-hidden flex flex-col items-center justify-between p-1 shadow-sm relative group-hover:border-slate-500">
                    {/* Page mockup preview */}
                    <div className="w-full h-2 bg-slate-700 rounded-sm mb-1" />
                    <div className="space-y-1 w-full px-0.5">
                      <div className="h-1 bg-slate-700/60 rounded-full w-full" />
                      <div className="h-1 bg-slate-700/60 rounded-full w-4/5" />
                      <div className="h-1 bg-slate-700/60 rounded-full w-3/4" />
                    </div>
                    {section && (
                      <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-400 rounded-bl-sm" title={section.title} />
                    )}
                    <span className="text-[10px] font-mono font-medium text-slate-300">
                      {pageNum}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono ${isSelected ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}>
                    p.{pageNum}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
