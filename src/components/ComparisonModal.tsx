import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Columns,
  SplitSquareVertical,
} from 'lucide-react';
import { ImageQueueItem } from '../types';
import { formatBytes } from '../utils/imageProcessor';
import { copyBlobToClipboard, downloadBlob } from '../utils/zipExport';

interface ComparisonModalProps {
  item: ImageQueueItem | null;
  onClose: () => void;
  isMac?: boolean;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  item,
  onClose,
  isMac = false,
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0 to 100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'split' | 'side-by-side'>('split');
  const [zoomLevel, setZoomLevel] = useState<number>(1); // 1 = fit, 1.5, 2
  const [copied, setCopied] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const result = item?.result;

  const handleCopy = useCallback(async () => {
    if (!result) return;
    const success = await copyBlobToClipboard(result.blob);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    downloadBlob(result.blob, result.fileName);
  }, [result]);

  // Keyboard navigation inside inspector
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const delta = e.shiftKey ? 15 : 5;
        setSliderPos((pos) => Math.max(0, pos - delta));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const delta = e.shiftKey ? 15 : 5;
        setSliderPos((pos) => Math.min(100, pos + delta));
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoomLevel((z) => Math.min(3, z + 0.5));
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setZoomLevel((z) => Math.max(1, z - 0.5));
      } else if (e.key === 'Tab') {
        e.preventDefault();
        setViewMode((m) => (m === 'split' ? 'side-by-side' : 'split'));
      } else if (e.key.toLowerCase() === 'c' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleCopy();
      } else if (e.key.toLowerCase() === 'd' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleDownload();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handleCopy, handleDownload]);

  if (!item || !item.result) return null;

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    updateSlider(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      updateSlider(e.clientX);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const updateSlider = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.round((x / rect.width) * 100);
    setSliderPos(percent);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div>
            <div className="text-sm font-semibold text-white truncate max-w-md">
              {item.name}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>Original: {formatBytes(item.originalSize)}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 font-mono font-medium">
                Optimized: {formatBytes(item.result.size)} (-{item.result.savingsPercentage}%)
              </span>
              <span aria-hidden="true">·</span>
              <span>{item.result.durationMs}ms</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode */}
            <div className="flex items-center p-0.5 bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setViewMode('split')}
                title="Interactive Split Slider (Tab)"
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'split' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <SplitSquareVertical className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('side-by-side')}
                title="Side by Side Compare (Tab)"
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'side-by-side' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Columns className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Toggle */}
            <div className="flex items-center p-0.5 bg-slate-800 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(1, z - 0.5))}
                disabled={zoomLevel <= 1}
                title="Zoom Out (-)"
                className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-1.5 font-mono text-[11px] text-slate-300">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(3, z + 0.5))}
                disabled={zoomLevel >= 3}
                title="Zoom In (+)"
                className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              title="Copy to clipboard (C)"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
              <kbd className="hidden sm:inline-block px-1 py-0.2 text-[10px] font-mono text-slate-400 bg-slate-900 rounded">C</kbd>
            </button>

            {/* Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              title="Download image (D)"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
              <kbd className="hidden sm:inline-block px-1 py-0.2 text-[10px] font-mono text-indigo-200 bg-indigo-700/60 rounded">D</kbd>
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              title="Close modal (Esc)"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport Canvas Area */}
        <div className="flex-1 overflow-auto bg-slate-950 p-6 flex items-center justify-center select-none relative">
          {viewMode === 'split' ? (
            <div
              ref={containerRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              className="relative max-w-full max-h-full rounded-xl overflow-hidden cursor-ew-resize border border-slate-800 shadow-2xl flex items-center justify-center bg-checkered"
              style={{
                touchAction: 'none',
              }}
            >
              {/* Background: Compressed image */}
              <img
                src={item.result.url}
                alt="Compressed"
                referrerPolicy="no-referrer"
                className="max-h-[64vh] object-contain pointer-events-none transition-transform"
                style={{ transform: `scale(${zoomLevel})` }}
              />

              {/* Foreground: Original image clipped by slider position */}
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ width: `${sliderPos}%` }}
              >
                <img
                  src={item.originalUrl}
                  alt="Original"
                  referrerPolicy="no-referrer"
                  className="max-h-[64vh] object-contain pointer-events-none absolute left-0 top-0 transition-transform"
                  style={{
                    transform: `scale(${zoomLevel})`,
                    maxWidth: 'none',
                    height: '100%',
                    width: 'auto',
                  }}
                />
              </div>

              {/* Split Line & Handle */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none z-10"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-900 border-2 border-white shadow-xl flex items-center justify-center text-white text-[10px] font-bold">
                  ⇄
                </div>
              </div>

              {/* Corner Watermarks */}
              <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded bg-black/60 backdrop-blur-sm text-[11px] text-white font-mono">
                Original ({formatBytes(item.originalSize)})
              </div>
              <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded bg-black/60 backdrop-blur-sm text-[11px] text-emerald-400 font-mono font-medium">
                Optimized ({formatBytes(item.result.size)})
              </div>
            </div>
          ) : (
            /* Side-by-side mode */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full">
              <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-4 overflow-hidden">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
                  <span>ORIGINAL</span>
                  <span>
                    {item.originalWidth}×{item.originalHeight} · {formatBytes(item.originalSize)}
                  </span>
                </div>
                <div className="flex-1 flex items-center justify-center overflow-hidden">
                  <img
                    src={item.originalUrl}
                    alt="Original Master"
                    referrerPolicy="no-referrer"
                    className="max-h-[50vh] object-contain rounded"
                    style={{ transform: `scale(${zoomLevel})` }}
                  />
                </div>
              </div>

              <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-4 overflow-hidden">
                <div className="flex items-center justify-between text-xs text-emerald-400 mb-2 font-mono">
                  <span>OPTIMIZED ({item.result.format.replace('image/', '').toUpperCase()})</span>
                  <span>
                    {item.result.width}×{item.result.height} · {formatBytes(item.result.size)} (-{item.result.savingsPercentage}%)
                  </span>
                </div>
                <div className="flex-1 flex items-center justify-center overflow-hidden">
                  <img
                    src={item.result.url}
                    alt="Optimized Output"
                    referrerPolicy="no-referrer"
                    className="max-h-[50vh] object-contain rounded"
                    style={{ transform: `scale(${zoomLevel})` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Specs Bar */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono tabular-nums shrink-0">
          <div className="flex items-center gap-4 text-slate-400">
            <span>
              Resolution: <strong className="text-white">{item.originalWidth}×{item.originalHeight}</strong> →{' '}
              <strong className="text-indigo-300">{item.result.width}×{item.result.height}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              MIME: <strong className="text-white">{item.originalType}</strong> →{' '}
              <strong className="text-indigo-300">{item.result.format}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <span>Shortcuts:</span>
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">← / →</kbd>
            <span>nudge slider</span>
            <span aria-hidden="true">·</span>
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">+/-</kbd>
            <span>zoom</span>
            <span aria-hidden="true">·</span>
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">Tab</kbd>
            <span>view mode</span>
            <span aria-hidden="true">·</span>
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">Esc</kbd>
            <span>close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
