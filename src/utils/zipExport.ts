import JSZip from 'jszip';
import { ImageQueueItem } from '../types';

/**
 * Triggers a direct download for a single blob file
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/**
 * Package all processed images into a ZIP archive and trigger download
 */
export async function downloadAllAsZip(
  items: ImageQueueItem[],
  onProgress?: (percent: number) => void
): Promise<void> {
  const completedItems = items.filter((item) => item.status === 'done' && item.result);
  if (completedItems.length === 0) {
    throw new Error('No compressed images ready for download');
  }

  const zip = new JSZip();
  const usedNames = new Set<string>();

  for (const item of completedItems) {
    if (!item.result) continue;
    let fileName = item.result.fileName;

    // Disambiguate duplicate file names in the zip archive
    if (usedNames.has(fileName)) {
      const dotIndex = fileName.lastIndexOf('.');
      const base = dotIndex > 0 ? fileName.substring(0, dotIndex) : fileName;
      const ext = dotIndex > 0 ? fileName.substring(dotIndex) : '';
      let counter = 1;
      while (usedNames.has(`${base}_${counter}${ext}`)) {
        counter++;
      }
      fileName = `${base}_${counter}${ext}`;
    }
    usedNames.add(fileName);

    zip.file(fileName, item.result.blob);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' }, (metadata) => {
    if (onProgress) {
      onProgress(Math.round(metadata.percent));
    }
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const zipFileName = `optipress_batch_${timestamp}.zip`;

  downloadBlob(zipBlob, zipFileName);
}

/**
 * Copy processed image blob to system clipboard (PNG/JPEG)
 */
export async function copyBlobToClipboard(blob: Blob): Promise<boolean> {
  if (!navigator.clipboard || !window.ClipboardItem) {
    return false;
  }

  try {
    // Clipboard API strictly supports 'image/png' natively on most OSes.
    // If blob is WebP or JPEG, we can convert or check browser support
    if (blob.type === 'image/png') {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      return true;
    }

    // Convert to PNG on offscreen canvas for clipboard compatibility
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    ctx.drawImage(bitmap, 0, 0);

    const pngBlob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'));
    if (!pngBlob) return false;

    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': pngBlob }),
    ]);
    return true;
  } catch (err) {
    console.warn('Clipboard copy failed:', err);
    return false;
  }
}
