import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles } from 'lucide-react';

export interface DropZoneHandle {
  openFilePicker: () => void;
}

interface DropZoneProps {
  onFilesAdded: (files: File[]) => void;
  onLoadSamples: () => void;
  isLoadingSamples: boolean;
  isMac?: boolean;
}

export const DropZone = forwardRef<DropZoneHandle, DropZoneProps>(({
  onFilesAdded,
  onLoadSamples,
  isLoadingSamples,
  isMac = false,
}, ref) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modKey = isMac ? '⌘' : 'Ctrl';

  useImperativeHandle(ref, () => ({
    openFilePicker: () => {
      fileInputRef.current?.click();
    },
  }));

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles: File[] = [];
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const file = e.dataTransfer.files[i];
        if (file.type.startsWith('image/') || /\.(jpe?g|png|webp|avif|gif|bmp|svg)$/i.test(file.name)) {
          validFiles.push(file);
        }
      }
      if (validFiles.length > 0) {
        onFilesAdded(validFiles);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFilesAdded(filesArray);
      // Reset input value so re-selecting same files triggers change
      e.target.value = '';
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all ${
        isDragging
          ? 'border-indigo-400 bg-indigo-950/20 shadow-inner'
          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.gif,.bmp"
        onChange={handleFileInputChange}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center max-w-xl mx-auto space-y-4">
        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 border border-slate-700/60">
          <UploadCloud className="w-6 h-6" />
        </div>

        <div>
          <h2 className="text-base font-semibold text-white">
            Drop images here, or browse files from your computer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Supports batch processing for JPEG, PNG, WebP, AVIF, BMP, and SVG up to 50MB each.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
          >
            <span>Browse Files</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] font-mono text-indigo-200 bg-indigo-700/60 rounded">
              {modKey}+O
            </kbd>
          </button>

          <button
            type="button"
            onClick={onLoadSamples}
            disabled={isLoadingSamples}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isLoadingSamples ? 'Loading Samples...' : 'Load Sample Photos (3)'}</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 pt-2 flex items-center gap-2">
          <span>Private & 100% Client-Side</span>
          <span aria-hidden="true">·</span>
          <span>No Server Upload</span>
          <span aria-hidden="true">·</span>
          <span>Instant Hardware Acceleration</span>
        </div>
      </div>
    </div>
  );
});
