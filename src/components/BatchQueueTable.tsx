import React, { useState } from 'react';
import {
  Eye,
  Download,
  Trash2,
  Sliders,
  Copy,
  Check,
  LayoutGrid,
  List,
  RefreshCw,
  AlertCircle,
  FileImage,
} from 'lucide-react';
import { ImageQueueItem } from '../types';
import { formatBytes } from '../utils/imageProcessor';
import { copyBlobToClipboard, downloadBlob } from '../utils/zipExport';

interface BatchQueueTableProps {
  items: ImageQueueItem[];
  onInspect: (item: ImageQueueItem) => void;
  onCustomizeItem: (item: ImageQueueItem) => void;
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  onReprocessAll: () => void;
  isProcessing: boolean;
}

export const BatchQueueTable: React.FC<BatchQueueTableProps> = ({
  items,
  onInspect,
  onCustomizeItem,
  onRemoveItem,
  onClearAll,
  onReprocessAll,
  isProcessing,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (item: ImageQueueItem) => {
    if (!item.result) return;
    const ok = await copyBlobToClipboard(item.result.blob);
    if (ok) {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1800);
    }
  };

  const handleDownload = (item: ImageQueueItem) => {
    if (!item.result) return;
    downloadBlob(item.result.blob, item.result.fileName);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Table Toolbar */}
      <div className="px-5 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-900/80">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-white">Batch Queue</h2>
          <span className="text-xs text-slate-400 font-mono">
            {items.length} {items.length === 1 ? 'file' : 'files'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div className="flex items-center p-0.5 bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              title="Table View"
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Grid View"
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onReprocessAll}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700/60 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>Re-compress</span>
          </button>

          <button
            type="button"
            onClick={onClearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Queue</span>
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        /* Dense Data Table */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-medium">
                <th className="py-2.5 px-4 w-14">Preview</th>
                <th className="py-2.5 px-4">Filename</th>
                <th className="py-2.5 px-4">Original Specs</th>
                <th className="py-2.5 px-4">Output Specs</th>
                <th className="py-2.5 px-4 text-right">Saved</th>
                <th className="py-2.5 px-4 text-center">Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {items.map((item) => {
                const res = item.result;
                const hasCustom = Boolean(item.customSettings);

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    {/* Thumbnail */}
                    <td className="py-2 px-4">
                      <div
                        onClick={() => res && onInspect(item)}
                        className={`w-10 h-10 rounded-md overflow-hidden bg-slate-800 border border-slate-700/80 shrink-0 cursor-pointer relative ${
                          res ? 'hover:ring-2 hover:ring-indigo-500' : ''
                        }`}
                      >
                        <img
                          src={res ? res.url : item.originalUrl}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>

                    {/* File Name */}
                    <td className="py-2 px-4 max-w-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-200 truncate" title={item.name}>
                          {item.name}
                        </span>
                        {hasCustom && (
                          <span className="text-[10px] text-amber-400 font-mono" title="Custom override active">
                            [Custom]
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {item.originalType.replace('image/', '')}
                      </div>
                    </td>

                    {/* Original Specs */}
                    <td className="py-2 px-4 text-slate-300 font-mono tabular-nums whitespace-nowrap">
                      <div>{item.originalWidth}×{item.originalHeight} px</div>
                      <div className="text-[11px] text-slate-400">{formatBytes(item.originalSize)}</div>
                    </td>

                    {/* Output Specs */}
                    <td className="py-2 px-4 font-mono tabular-nums whitespace-nowrap">
                      {res ? (
                        <>
                          <div className="text-indigo-300">{res.width}×{res.height} px</div>
                          <div className="text-[11px] text-slate-300 flex items-center gap-1">
                            <span>{formatBytes(res.size)}</span>
                            <span className="text-[10px] text-slate-400 uppercase">
                              ({res.format.replace('image/', '')})
                            </span>
                          </div>
                        </>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>

                    {/* Savings */}
                    <td className="py-2 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                      {res ? (
                        <div>
                          <div className="text-emerald-400 font-semibold">
                            -{res.savingsPercentage}%
                          </div>
                          <div className="text-[11px] text-emerald-400/70">
                            -{formatBytes(res.savingsBytes)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-2 px-4 text-center whitespace-nowrap">
                      {item.status === 'done' && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                          <Check className="w-3.5 h-3.5" />
                          <span>Ready</span>
                        </span>
                      )}
                      {item.status === 'processing' && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-indigo-400 font-medium">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Compressing</span>
                        </span>
                      )}
                      {item.status === 'pending' && (
                        <span className="text-[11px] text-slate-500">Queued</span>
                      )}
                      {item.status === 'error' && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-rose-400" title={item.errorMessage}>
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Error</span>
                        </span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="py-2 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {res && (
                          <button
                            type="button"
                            onClick={() => onInspect(item)}
                            title="Interactive Slider Compare"
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onCustomizeItem(item)}
                          title="Override individual settings"
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>

                        {res && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleCopy(item)}
                              title="Copy image to clipboard"
                              className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors"
                            >
                              {copiedId === item.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDownload(item)}
                              title="Download compressed image"
                              className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          title="Remove file"
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid Card View */
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const res = item.result;
            return (
              <div
                key={item.id}
                className="bg-slate-950/60 border border-slate-800 rounded-xl overflow-hidden flex flex-col group hover:border-slate-700 transition-colors"
              >
                <div
                  onClick={() => res && onInspect(item)}
                  className="aspect-video bg-slate-900 overflow-hidden relative cursor-pointer"
                >
                  <img
                    src={res ? res.url : item.originalUrl}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {res && (
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-mono text-emerald-400 font-semibold">
                      -{res.savingsPercentage}%
                    </div>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="text-xs font-semibold text-white truncate" title={item.name}>
                      {item.name}
                    </h4>
                    <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center justify-between">
                      <span>{formatBytes(item.originalSize)}</span>
                      <span>→</span>
                      <span className="text-indigo-300">
                        {res ? formatBytes(res.size) : 'Queued'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onCustomizeItem(item)}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>Custom</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {res && (
                        <>
                          <button
                            type="button"
                            onClick={() => onInspect(item)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                            title="Compare"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownload(item)}
                            className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 rounded"
                            title="Download"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
