import React from 'react';
import { ImageQueueItem } from '../types';
import { formatBytes } from '../utils/imageProcessor';

interface StatsBarProps {
  items: ImageQueueItem[];
}

export const StatsBar: React.FC<StatsBarProps> = ({ items }) => {
  const totalCount = items.length;
  const processedItems = items.filter((item) => item.status === 'done' && item.result);

  const totalOrigBytes = items.reduce((acc, item) => acc + item.originalSize, 0);
  const totalResultBytes = processedItems.reduce(
    (acc, item) => acc + (item.result?.size || item.originalSize),
    0
  );

  const savedBytes = Math.max(0, totalOrigBytes - totalResultBytes);
  const overallSavingsPercent =
    totalOrigBytes > 0 ? Math.round((savedBytes / totalOrigBytes) * 100) : 0;

  return (
    <section className="bg-slate-900 border-b border-slate-800 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-slate-400 font-medium">Batch Queue</div>
            <div className="text-base font-semibold text-white font-mono tabular-nums mt-0.5">
              {totalCount} {totalCount === 1 ? 'image' : 'images'}
              <span className="text-xs text-slate-400 font-sans ml-1.5 font-normal">
                ({processedItems.length} optimized)
              </span>
            </div>
          </div>

          <div>
            <div className="text-slate-400 font-medium">Original Weight</div>
            <div className="text-base font-semibold text-slate-200 font-mono tabular-nums mt-0.5">
              {formatBytes(totalOrigBytes)}
            </div>
          </div>

          <div>
            <div className="text-slate-400 font-medium">Optimized Weight</div>
            <div className="text-base font-semibold text-indigo-300 font-mono tabular-nums mt-0.5">
              {processedItems.length > 0 ? formatBytes(totalResultBytes) : '—'}
            </div>
          </div>

          <div>
            <div className="text-slate-400 font-medium">Storage Reduction</div>
            <div className="text-base font-semibold text-emerald-400 font-mono tabular-nums mt-0.5">
              {savedBytes > 0 ? (
                <>
                  -{formatBytes(savedBytes)}{' '}
                  <span className="text-xs text-emerald-300/80 font-sans ml-1 font-normal">
                    ({overallSavingsPercent}% saved)
                  </span>
                </>
              ) : (
                '0%'
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
