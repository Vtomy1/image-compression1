import React from 'react';
import {
  Sliders,
  Maximize2,
  FileArchive,
  RefreshCw,
  Check,
  Lock,
  Unlock,
  Sparkles,
  BookmarkCheck,
} from 'lucide-react';
import { BatchSettings, CompressionMode, ResizeMode, SupportedFormat } from '../types';
import { DIMENSION_PRESETS } from '../utils/presets';

interface BatchSettingsPanelProps {
  settings: BatchSettings;
  onChange: (updated: BatchSettings) => void;
  onApplyAndProcess: () => void;
  onSaveSettings: () => void;
  isProcessing: boolean;
  itemCount: number;
  isMac?: boolean;
}

export const BatchSettingsPanel: React.FC<BatchSettingsPanelProps> = ({
  settings,
  onChange,
  onApplyAndProcess,
  onSaveSettings,
  isProcessing,
  itemCount,
  isMac = false,
}) => {
  const modKey = isMac ? '⌘' : 'Ctrl';

  const updateSetting = <K extends keyof BatchSettings>(key: K, value: BatchSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  const handleReset = () => {
    onChange({
      format: 'image/webp',
      compressionMode: 'quality',
      quality: 0.8,
      targetSizeKB: 250,
      resizeMode: 'none',
      resizePercent: 75,
      fitMaxWidth: 1920,
      fitMaxHeight: 1080,
      exactWidth: 1200,
      exactHeight: 800,
      keepAspectRatio: true,
      selectedPresetId: 'ig-square',
      smoothingQuality: 'high',
      matteColor: '#ffffff',
      suffix: '-min',
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            Batch Optimization Parameters
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure target format, compression intensity, and resizing across all {itemCount} queued files.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSaveSettings}
            title={`Save current settings to your browser (${modKey}+S)`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Save Profile</span>
            <kbd className="hidden sm:inline-block px-1 py-0.2 text-[10px] font-mono text-slate-400 bg-slate-900 rounded">
              {modKey}+S
            </kbd>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Reset Defaults
          </button>

          <button
            type="button"
            onClick={onApplyAndProcess}
            disabled={isProcessing || itemCount === 0}
            title={`Run batch optimization (${modKey}+Enter)`}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              itemCount > 0 && !isProcessing
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>{isProcessing ? 'Processing Batch...' : 'Process All Images'}</span>
            <kbd className="hidden sm:inline-block ml-0.5 px-1.5 py-0.2 text-[10px] font-mono text-indigo-200 bg-indigo-700/60 rounded">
              {modKey}+↵
            </kbd>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Format Conversion */}
        <div className="space-y-4">
          <label className="block text-xs font-medium text-slate-300">
            Target Output Format
          </label>

          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: 'image/webp', name: 'WebP', note: 'Recommended' },
                { id: 'image/jpeg', name: 'JPEG', note: 'Universal' },
                { id: 'image/png', name: 'PNG', note: 'Lossless' },
                { id: 'image/avif', name: 'AVIF', note: 'Next-Gen' },
                { id: 'original', name: 'Keep Original', note: 'Same MIME' },
              ] as const
            ).map((fmt) => (
              <button
                key={fmt.id}
                type="button"
                onClick={() => updateSetting('format', fmt.id as SupportedFormat)}
                className={`p-2.5 text-left rounded-lg border text-xs transition-colors ${
                  settings.format === fmt.id
                    ? 'border-indigo-500 bg-indigo-950/40 text-white'
                    : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700'
                } ${fmt.id === 'original' ? 'col-span-2' : ''}`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span>{fmt.name}</span>
                  {settings.format === fmt.id && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{fmt.note}</div>
              </button>
            ))}
          </div>

          {settings.format === 'image/jpeg' && (
            <div className="pt-2 text-xs">
              <label className="text-slate-400 block mb-1">Transparency Fill (Matte)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.matteColor}
                  onChange={(e) => updateSetting('matteColor', e.target.value)}
                  className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <span className="text-xs text-slate-300 font-mono">{settings.matteColor}</span>
              </div>
            </div>
          )}
        </div>

        {/* Column 2: Compression & Quality Mode */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-300">Compression Mode</label>
            <div className="flex items-center p-0.5 bg-slate-800 rounded-md">
              <button
                type="button"
                onClick={() => updateSetting('compressionMode', 'quality')}
                className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                  settings.compressionMode === 'quality'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Quality Slider
              </button>
              <button
                type="button"
                onClick={() => updateSetting('compressionMode', 'target_size')}
                className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                  settings.compressionMode === 'target_size'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Target File Size
              </button>
            </div>
          </div>

          {settings.compressionMode === 'quality' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Quality Factor</span>
                <span className="text-white font-mono tabular-nums font-semibold">
                  {Math.round(settings.quality * 100)}%
                </span>
              </div>

              <input
                type="range"
                min="0.10"
                max="1.0"
                step="0.01"
                value={settings.quality}
                onChange={(e) => updateSetting('quality', parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />

              {/* Quality Presets */}
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => updateSetting('quality', 0.5)}
                  className={`flex-1 py-1 text-[10px] font-medium rounded border transition-colors ${
                    Math.round(settings.quality * 100) === 50
                      ? 'border-indigo-500 text-indigo-300 bg-indigo-950/40'
                      : 'border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Max Save (50%)
                </button>
                <button
                  type="button"
                  onClick={() => updateSetting('quality', 0.8)}
                  className={`flex-1 py-1 text-[10px] font-medium rounded border transition-colors ${
                    Math.round(settings.quality * 100) === 80
                      ? 'border-indigo-500 text-indigo-300 bg-indigo-950/40'
                      : 'border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Balanced (80%)
                </button>
                <button
                  type="button"
                  onClick={() => updateSetting('quality', 0.92)}
                  className={`flex-1 py-1 text-[10px] font-medium rounded border transition-colors ${
                    Math.round(settings.quality * 100) === 92
                      ? 'border-indigo-500 text-indigo-300 bg-indigo-950/40'
                      : 'border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  High Res (92%)
                </button>
              </div>

              <p className="text-[11px] text-slate-400 pt-1">
                {settings.quality >= 0.85
                  ? 'Nearly indistinguishable from master raw image with ~40-60% size drop.'
                  : settings.quality >= 0.7
                  ? 'Sweet spot for high-speed websites with ~70-85% reduction.'
                  : 'Aggressive compression, maximum bandwidth conservation.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Max File Size Cap</span>
                <span className="text-white font-mono tabular-nums font-semibold">
                  {settings.targetSizeKB} KB
                </span>
              </div>

              <input
                type="number"
                min="10"
                max="10000"
                step="10"
                value={settings.targetSizeKB}
                onChange={(e) => updateSetting('targetSizeKB', Math.max(10, parseInt(e.target.value) || 100))}
                className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
              />

              <div className="flex items-center gap-1.5">
                {[100, 200, 500, 1000].map((kb) => (
                  <button
                    key={kb}
                    type="button"
                    onClick={() => updateSetting('targetSizeKB', kb)}
                    className={`flex-1 py-1 text-[10px] font-medium rounded border transition-colors ${
                      settings.targetSizeKB === kb
                        ? 'border-indigo-500 text-indigo-300 bg-indigo-950/40'
                        : 'border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {kb >= 1000 ? `${kb / 1000}MB` : `${kb}KB`}
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-slate-400">
                Iterative binary search automatically adjusts compression to stay strictly under the limit.
              </p>
            </div>
          )}
        </div>

        {/* Column 3: Batch Resizing */}
        <div className="space-y-4">
          <label className="block text-xs font-medium text-slate-300">
            Batch Resizing Options
          </label>

          <div className="flex flex-wrap gap-1 p-1 bg-slate-800 rounded-lg">
            {(
              [
                { id: 'none', label: 'Original' },
                { id: 'percentage', label: 'Percent' },
                { id: 'fit', label: 'Fit Box' },
                { id: 'exact', label: 'Exact' },
                { id: 'preset', label: 'Presets' },
              ] as const
            ).map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => updateSetting('resizeMode', mode.id as ResizeMode)}
                className={`flex-1 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap ${
                  settings.resizeMode === mode.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {/* Conditional Resizing Subcontrols */}
          {settings.resizeMode === 'percentage' && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Scale Ratio</span>
                <span className="text-white font-mono tabular-nums font-semibold">
                  {settings.resizePercent}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="150"
                step="5"
                value={settings.resizePercent}
                onChange={(e) => updateSetting('resizePercent', parseInt(e.target.value) || 50)}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex items-center gap-1.5">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => updateSetting('resizePercent', pct)}
                    className={`flex-1 py-1 text-[10px] font-medium rounded border ${
                      settings.resizePercent === pct
                        ? 'border-indigo-500 text-indigo-300 bg-indigo-950/40'
                        : 'border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          )}

          {settings.resizeMode === 'fit' && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Max Width (px)</label>
                <input
                  type="number"
                  min="64"
                  max="7680"
                  value={settings.fitMaxWidth}
                  onChange={(e) => updateSetting('fitMaxWidth', parseInt(e.target.value) || 1920)}
                  className="w-full px-2.5 py-1 text-xs bg-slate-800 border border-slate-700 rounded text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Max Height (px)</label>
                <input
                  type="number"
                  min="64"
                  max="4320"
                  value={settings.fitMaxHeight}
                  onChange={(e) => updateSetting('fitMaxHeight', parseInt(e.target.value) || 1080)}
                  className="w-full px-2.5 py-1 text-xs bg-slate-800 border border-slate-700 rounded text-white font-mono"
                />
              </div>
            </div>
          )}

          {settings.resizeMode === 'exact' && (
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Width (px)</label>
                  <input
                    type="number"
                    min="32"
                    max="7680"
                    value={settings.exactWidth}
                    onChange={(e) => updateSetting('exactWidth', parseInt(e.target.value) || 1200)}
                    className="w-full px-2.5 py-1 text-xs bg-slate-800 border border-slate-700 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Height (px)</label>
                  <input
                    type="number"
                    min="32"
                    max="4320"
                    value={settings.exactHeight}
                    onChange={(e) => updateSetting('exactHeight', parseInt(e.target.value) || 800)}
                    className="w-full px-2.5 py-1 text-xs bg-slate-800 border border-slate-700 rounded text-white font-mono"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('keepAspectRatio', !settings.keepAspectRatio)}
                className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-200"
              >
                {settings.keepAspectRatio ? (
                  <Lock className="w-3 h-3 text-indigo-400" />
                ) : (
                  <Unlock className="w-3 h-3 text-slate-500" />
                )}
                <span>Maintain aspect ratio constraint</span>
              </button>
            </div>
          )}

          {settings.resizeMode === 'preset' && (
            <div className="pt-1">
              <label className="text-[10px] text-slate-400 block mb-1">Select Dimension Preset</label>
              <select
                value={settings.selectedPresetId}
                onChange={(e) => updateSetting('selectedPresetId', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded text-white"
              >
                <optgroup label="Social Media">
                  {DIMENSION_PRESETS.filter((p) => p.category === 'social').map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.name} ({preset.width}x{preset.height})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Web & Displays">
                  {DIMENSION_PRESETS.filter((p) => p.category === 'web').map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.name} ({preset.width}x{preset.height})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          )}

          {/* Suffix file name */}
          <div className="pt-2 flex items-center justify-between text-xs">
            <span className="text-slate-400">File Name Suffix</span>
            <input
              type="text"
              value={settings.suffix}
              onChange={(e) => updateSetting('suffix', e.target.value)}
              placeholder="-min"
              className="w-24 px-2 py-0.5 text-xs bg-slate-800 border border-slate-700 rounded text-white font-mono text-right"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
