import React from 'react';
import { Layers, Zap, Image, CheckCircle, Info } from 'lucide-react';
import { FORMAT_DETAILS } from '../utils/presets';

export const FormatGuide: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
      <div>
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-400" />
          Image Format Architecture & Compression Standards
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Technical breakdown of browser encoding standards and optimal use cases for production web deployment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(FORMAT_DETAILS).map(([mime, details]) => (
          <div
            key={mime}
            className="rounded-lg bg-slate-950/60 border border-slate-800 p-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{details.label}</span>
                <span className="text-[10px] text-slate-400 font-mono uppercase bg-slate-800 px-1.5 py-0.5 rounded">
                  .{details.ext}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {details.desc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
              <div>
                <strong>Primary strength:</strong>{' '}
                {mime === 'image/webp'
                  ? '30-80% smaller than JPEG with transparency'
                  : mime === 'image/jpeg'
                  ? 'Universal 100% device & OS support'
                  : mime === 'image/png'
                  ? 'Pixel-perfect lossless & alpha transparency'
                  : 'Ultra-efficient modern AV1 compression'}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800 text-xs">
        <div className="space-y-2">
          <h3 className="font-semibold text-white">Batch Resizing Mechanics</h3>
          <p className="text-slate-400 leading-relaxed">
            Resizing happens directly in your browser using hardware-accelerated 2D canvas with
            bicubic interpolation (<code className="text-indigo-300">imageSmoothingQuality: high</code>).
            When converting transparent images to JPEG, a customizable matte color fills the alpha channel
            to prevent black halos.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-white">Target File Size Convergence</h3>
          <p className="text-slate-400 leading-relaxed">
            In Target File Size mode, an iterative binary search evaluates encoder quality parameters
            across 5 cycles to guarantee that the output file size strictly satisfies your specified KB threshold
            while retaining maximum perceptual fidelity.
          </p>
        </div>
      </div>
    </div>
  );
};
