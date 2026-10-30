export type SupportedFormat = 'original' | 'image/webp' | 'image/jpeg' | 'image/png' | 'image/avif';

export type ResizeMode = 'none' | 'percentage' | 'fit' | 'exact' | 'preset';

export type CompressionMode = 'quality' | 'target_size';

export interface DimensionPreset {
  id: string;
  category: 'social' | 'web' | 'device';
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
  description: string;
}

export interface BatchSettings {
  format: SupportedFormat;
  compressionMode: CompressionMode;
  quality: number; // 0.05 to 1.0
  targetSizeKB: number; // target size in KB (for target_size mode)
  resizeMode: ResizeMode;
  resizePercent: number; // 10 to 200
  fitMaxWidth: number;
  fitMaxHeight: number;
  exactWidth: number;
  exactHeight: number;
  keepAspectRatio: boolean;
  selectedPresetId?: string;
  smoothingQuality: 'high' | 'medium' | 'low';
  matteColor: string; // for filling transparent backgrounds when exporting to JPEG
  suffix: string; // e.g. '-min' or '-compressed'
}

export interface ImageProcessingResult {
  blob: Blob;
  url: string;
  size: number;
  width: number;
  height: number;
  format: string;
  fileName: string;
  savingsBytes: number;
  savingsPercentage: number;
  durationMs: number;
}

export interface ImageQueueItem {
  id: string;
  originalFile?: File;
  name: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  originalType: string;
  originalUrl: string;
  aspectRatio: number;
  status: 'pending' | 'processing' | 'done' | 'error';
  errorMessage?: string;
  result?: ImageProcessingResult;
  customSettings?: Partial<BatchSettings>;
}

export interface ProcessingProgress {
  total: number;
  completed: number;
  failed: number;
  isProcessing: boolean;
}
