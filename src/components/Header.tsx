import React from 'react';
import { Download, Layers, Keyboard } from 'lucide-react';
import { ImageQueueItem } from '../types';

interface HeaderProps {
  items: ImageQueueItem[];
  isProcessing: boolean;
  onDownloadAllZip: () => void;
  activeSection: string;
  setActiveSection: (sec: string) => void;
  onOpenShortcuts: () => void;
  isMac: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  items,
  isProcessing,
  onDownloadAllZip,
  activeSection,
  setActiveSection,
  onOpenShortcuts,
  isMac,
}) => {
  const readyCount = items.filter((item) => item.status === 'done' && item.result).length;
  const modKey = isMac ? '⌘' : 'Ctrl';

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark in display face */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setActiveSection('queue');
          }}
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 group"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-600/30 group-hover:bg-indigo-500 transition-colors">
            <Layers className="w-4 h-4" />
          </div>
          <span>OptiPress Studio</span>
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveSection('queue')}
            className={`whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
              activeSection === 'queue' ? 'text-white border-b-2 border-indigo-500 py-4 font-semibold' : 'hover:text-white'
            }`}
          >
            <span>Batch Queue</span>
            <span className="text-[10px] text-slate-500 font-mono">[1]</span>
          </button>
          <button
            onClick={() => setActiveSection('settings')}
            className={`whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
              activeSection === 'settings' ? 'text-white border-b-2 border-indigo-500 py-4 font-semibold' : 'hover:text-white'
            }`}
          >
            <span>Compression Presets</span>
            <span className="text-[10px] text-slate-500 font-mono">[2]</span>
          </button>
          <button
            onClick={() => setActiveSection('guide')}
            className={`whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
              activeSection === 'guide' ? 'text-white border-b-2 border-indigo-500 py-4 font-semibold' : 'hover:text-white'
            }`}
          >
            <span>Format Specs</span>
            <span className="text-[10px] text-slate-500 font-mono">[3]</span>
          </button>
        </nav>

        {/* Zone 3: Primary action + Shortcuts trigger */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenShortcuts}
            title="View keyboard shortcuts (?)"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <kbd className="font-mono text-[10px] text-slate-500 bg-slate-900 px-1 rounded border border-slate-700/60">?</kbd>
          </button>

          <button
            onClick={onDownloadAllZip}
            disabled={readyCount === 0 || isProcessing}
            title={`Download ZIP archive (${modKey}+D)`}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all shadow-sm whitespace-nowrap shrink-0 ${
              readyCount > 0 && !isProcessing
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Download All ZIP {readyCount > 0 ? `(${readyCount})` : ''}</span>
            <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.2 text-[10px] font-mono text-indigo-200 bg-indigo-700/60 rounded">
              {modKey}+D
            </kbd>
          </button>
        </div>
      </div>
    </header>
  );
};
