import { BatchSettings, ImageProcessingResult, ImageQueueItem, SupportedFormat } from '../types';
import { DIMENSION_PRESETS } from './presets';

/**
 * Format bytes into human readable string (KB, MB, GB)
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
  return `${val} ${sizes[i]}`;
}

/**
 * Check if the browser supports encoding to a given MIME type
 */
export function isMimeSupported(mime: string): boolean {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const dataUrl = canvas.toDataURL(mime);
    return dataUrl.startsWith(`data:${mime}`);
  } catch {
    return false;
  }
}

/**
 * Determine effective target MIME type and extension
 */
export function resolveTargetFormat(
  requestedFormat: SupportedFormat,
  originalType: string,
  originalName: string
): { mime: string; ext: string } {
  if (requestedFormat === 'original') {
    if (originalType === 'image/webp') return { mime: 'image/webp', ext: 'webp' };
    if (originalType === 'image/png') return { mime: 'image/png', ext: 'png' };
    if (originalType === 'image/avif' && isMimeSupported('image/avif')) return { mime: 'image/avif', ext: 'avif' };
    return { mime: 'image/jpeg', ext: 'jpg' };
  }

  if (requestedFormat === 'image/avif') {
    if (isMimeSupported('image/avif')) {
      return { mime: 'image/avif', ext: 'avif' };
    }
    // Fallback to WebP if AVIF encoding isn't natively supported by this browser engine
    return { mime: 'image/webp', ext: 'webp' };
  }

  if (requestedFormat === 'image/webp') return { mime: 'image/webp', ext: 'webp' };
  if (requestedFormat === 'image/png') return { mime: 'image/png', ext: 'png' };
  return { mime: 'image/jpeg', ext: 'jpg' };
}

/**
 * Calculate target dimensions based on resize mode and user parameters
 */
export function calculateTargetDimensions(
  origWidth: number,
  origHeight: number,
  settings: BatchSettings
): { width: number; height: number } {
  if (origWidth <= 0 || origHeight <= 0) {
    return { width: 100, height: 100 };
  }

  const aspectRatio = origWidth / origHeight;

  switch (settings.resizeMode) {
    case 'percentage': {
      const scale = Math.max(0.05, Math.min(5.0, settings.resizePercent / 100));
      return {
        width: Math.max(1, Math.round(origWidth * scale)),
        height: Math.max(1, Math.round(origHeight * scale)),
      };
    }

    case 'fit': {
      const maxW = Math.max(16, settings.fitMaxWidth || 1920);
      const maxH = Math.max(16, settings.fitMaxHeight || 1080);
      const scale = Math.min(maxW / origWidth, maxH / origHeight, 1.0);
      return {
        width: Math.max(1, Math.round(origWidth * scale)),
        height: Math.max(1, Math.round(origHeight * scale)),
      };
    }

    case 'exact': {
      if (settings.keepAspectRatio) {
        if (settings.exactWidth && !settings.exactHeight) {
          const w = Math.max(16, settings.exactWidth);
          return { width: w, height: Math.max(1, Math.round(w / aspectRatio)) };
        }
        if (settings.exactHeight && !settings.exactWidth) {
          const h = Math.max(16, settings.exactHeight);
          return { width: Math.max(1, Math.round(h * aspectRatio)), height: h };
        }
        if (settings.exactWidth && settings.exactHeight) {
          // Fit inside while preserving ratio
          const scale = Math.min(settings.exactWidth / origWidth, settings.exactHeight / origHeight);
          return {
            width: Math.max(1, Math.round(origWidth * scale)),
            height: Math.max(1, Math.round(origHeight * scale)),
          };
        }
      }
      return {
        width: Math.max(16, settings.exactWidth || origWidth),
        height: Math.max(16, settings.exactHeight || origHeight),
      };
    }

    case 'preset': {
      const preset = DIMENSION_PRESETS.find((p) => p.id === settings.selectedPresetId);
      if (!preset) return { width: origWidth, height: origHeight };

      if (settings.keepAspectRatio) {
        // Fit within preset bounds
        const scale = Math.min(preset.width / origWidth, preset.height / origHeight);
        return {
          width: Math.max(1, Math.round(origWidth * scale)),
          height: Math.max(1, Math.round(origHeight * scale)),
        };
      }
      return { width: preset.width, height: preset.height };
    }

    case 'none':
    default:
      return { width: origWidth, height: origHeight };
  }
}

/**
 * Load an image from URL or File into an HTMLImageElement
 */
export function loadImageElement(source: string | File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    let objectUrl: string | null = null;
    if (source instanceof File) {
      objectUrl = URL.createObjectURL(source);
      img.src = objectUrl;
    } else {
      img.src = source;
    }

    img.onload = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = (err) => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image file: ' + String(err)));
    };
  });
}

/**
 * Export canvas to Blob helper wrapped in a Promise
 */
function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas encoding to blob produced null result'));
        }
      },
      mime,
      quality
    );
  });
}

/**
 * Generate output filename with suffix and proper extension
 */
export function generateOutputFileName(
  originalName: string,
  suffix: string,
  targetExt: string
): string {
  const lastDot = originalName.lastIndexOf('.');
  const baseName = lastDot > 0 ? originalName.substring(0, lastDot) : originalName;
  const cleanSuffix = suffix.trim() || '';
  return `${baseName}${cleanSuffix}.${targetExt}`;
}

/**
 * Core image processing function: resizes and compresses according to settings
 */
export async function processSingleImage(
  item: ImageQueueItem,
  globalSettings: BatchSettings
): Promise<ImageProcessingResult> {
  const startTime = performance.now();
  const effectiveSettings: BatchSettings = {
    ...globalSettings,
    ...(item.customSettings || {}),
  };

  const img = await loadImageElement(item.originalFile || item.originalUrl);

  const origWidth = item.originalWidth || img.naturalWidth;
  const origHeight = item.originalHeight || img.naturalHeight;

  // Calculate target dimensions
  const { width: targetWidth, height: targetHeight } = calculateTargetDimensions(
    origWidth,
    origHeight,
    effectiveSettings
  );

  // Setup offscreen canvas for rendering
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d', { willReadFrequently: false });
  if (!ctx) {
    throw new Error('Unable to initialize 2D canvas context');
  }

  // Set high quality image scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = effectiveSettings.smoothingQuality || 'high';

  const { mime: targetMime, ext: targetExt } = resolveTargetFormat(
    effectiveSettings.format,
    item.originalType,
    item.name
  );

  // If exporting to JPEG or background matte is requested, fill background first to prevent black opacity artifacts
  if (targetMime === 'image/jpeg') {
    ctx.fillStyle = effectiveSettings.matteColor || '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  // Draw scaled image
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  let finalBlob: Blob;

  if (effectiveSettings.compressionMode === 'target_size' && targetMime !== 'image/png') {
    // Binary search quality convergence to hit target file size (in KB)
    const targetBytes = (effectiveSettings.targetSizeKB || 200) * 1024;
    let minQuality = 0.05;
    let maxQuality = 0.98;
    let bestBlob: Blob | null = null;

    // Up to 5 binary search iterations
    for (let iter = 0; iter < 5; iter++) {
      const testQuality = (minQuality + maxQuality) / 2;
      const testBlob = await canvasToBlob(canvas, targetMime, testQuality);

      if (testBlob.size <= targetBytes) {
        bestBlob = testBlob;
        minQuality = testQuality; // Try higher quality
      } else {
        maxQuality = testQuality; // Must reduce quality
        if (!bestBlob) {
          bestBlob = testBlob; // fallback
        }
      }
    }

    finalBlob = bestBlob || (await canvasToBlob(canvas, targetMime, 0.5));
  } else {
    // Standard quality compression
    const quality = targetMime === 'image/png' ? undefined : effectiveSettings.quality;
    finalBlob = await canvasToBlob(canvas, targetMime, quality as number);
  }

  const finalSize = finalBlob.size;
  const savingsBytes = Math.max(0, item.originalSize - finalSize);
  const savingsPercentage =
    item.originalSize > 0 ? Math.round(((item.originalSize - finalSize) / item.originalSize) * 100) : 0;

  const durationMs = Math.round(performance.now() - startTime);
  const fileName = generateOutputFileName(item.name, effectiveSettings.suffix, targetExt);
  const resultUrl = URL.createObjectURL(finalBlob);

  return {
    blob: finalBlob,
    url: resultUrl,
    size: finalSize,
    width: targetWidth,
    height: targetHeight,
    format: targetMime,
    fileName,
    savingsBytes,
    savingsPercentage,
    durationMs,
  };
}
