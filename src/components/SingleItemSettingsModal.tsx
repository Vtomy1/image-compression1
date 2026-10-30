import React, { useState } from 'react';
import { X, Sliders, Check } from 'lucide-react';
import { BatchSettings, ImageQueueItem, ResizeMode, SupportedFormat } from '../types';
import { DIMENSION_PRESETS } from '../utils/presets';

interface SingleItemSettingsModalProps {
  item: ImageQueueItem | null;
  globalSettings: BatchSettings;
  onSave: (itemId: string, customSettings: Partial<BatchSettings> | undefined) => void;
  onClose: () => void;
}

export const SingleItemSettingsModal: React.FC<SingleItemSettingsModalProps> = ({
  item,
  globalSettings,
  onSave,
  onClose,
}) => {
  if (!item) return null;

  const initialSettings = { ...globalSettings, ...(item.customSettings || {}) };

  const [format, setFormat] = useState<SupportedFormat>(initialSettings.format);
  const [quality, setQuality] = useState<number>(initialSettings.quality);
  const [resizeMode, setResizeMode] = useState<ResizeMode>(initialSettings.resizeMode);
  const [resizePercent, setResizePercent] = useState<number>(initialSettings.resizePercent);
  const [exactWidth, setExactWidth] = useState<number>(initialSettings.exactWidth);
  const [exactHeight, setExactHeight] = useState<number>(initialSettings.exactHeight);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    initialSettings.selectedPresetId || 'ig-square'
  );

  const handleApply = () => {
    onSave(item.id, {
      format,
      quality,
      resizeMode,
      resizePercent,
      exactWidth,
      exactHeight,
      selectedPresetId,
    });
    onClose();
  };

  const handleResetToBatch = () => {
    onSave(item.id, undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">Item Override Settings</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-slate-400">
          Target overrides for <strong className="text-white">{item.name}</strong> ({item.originalWidth}×{item.originalHeight})
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300">Format</label>
          <div className="grid grid-cols-4 gap-1.5">
            {(['image/webp', 'image/jpeg', 'image/png', 'original'] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setFormat(fmt)}
                className={`py-1.5 text-xs font-medium rounded border transition-colors ${
                  format === fmt
                    ? 'border-indigo-500 bg-indigo-950/40 text-white'
                    : 'border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {fmt === 'image/webp' ? 'WebP' : fmt === 'image/jpeg' ? 'JPEG' : fmt === 'image/png' ? 'PNG' : 'Original'}
              </button>
            ))}
          </div>
        </div>

        {/* Quality */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-medium text-slate-300">Quality Factor</label>
            <span className="font-mono text-white font-semibold">{Math.round(quality * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.10"
            max="1.0"
            step="0.05"
            value={quality}
            onChange={(e) => setQuality(parseFloat(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>

        {/* Resize Mode */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300">Resizing</label>
          <div className="grid grid-cols-4 gap-1.5">
            {(['none', 'percentage', 'exact', 'preset'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setResizeMode(mode)}
                className={`py-1.5 text-xs font-medium rounded border transition-colors ${
                  resizeMode === mode
                    ? 'border-indigo-500 bg-indigo-950/40 text-white'
                    : 'border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode === 'none' ? 'None' : mode === 'percentage' ? 'Scale %' : mode === 'exact' ? 'Exact px' : 'Preset'}
              </button>
            ))}
          </div>

          {resizeMode === 'percentage' && (
            <div className="pt-2 flex items-center gap-3 text-xs">
              <span className="text-slate-400">Scale:</span>
              <input
                type="number"
                min="10"
                max="200"
                value={resizePercent}
                onChange={(e) => setResizePercent(parseInt(e.target.value) || 50)}
                className="w-20 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white font-mono"
              />
              <span className="text-slate-400">%</span>
            </div>
          )}

          {resizeMode === 'exact' && (
            <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Width (px)</label>
                <input
                  type="number"
                  value={exactWidth}
                  onChange={(e) => setExactWidth(parseInt(e.target.value) || 800)}
                  className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Height (px)</label>
                <input
                  type="number"
                  value={exactHeight}
                  onChange={(e) => setExactHeight(parseInt(e.target.value) || 600)}
                  className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white font-mono"
                />
              </div>
            </div>
          )}

          {resizeMode === 'preset' && (
            <div className="pt-2 text-xs">
              <select
                value={selectedPresetId}
                onChange={(e) => setSelectedPresetId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-white"
              >
                {DIMENSION_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.width}x{p.height})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={handleResetToBatch}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            Reset to Batch Defaults
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Override</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
