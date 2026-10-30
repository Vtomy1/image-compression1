/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { DropZone, DropZoneHandle } from './components/DropZone';
import { BatchSettingsPanel } from './components/BatchSettingsPanel';
import { BatchQueueTable } from './components/BatchQueueTable';
import { ComparisonModal } from './components/ComparisonModal';
import { SingleItemSettingsModal } from './components/SingleItemSettingsModal';
import { FormatGuide } from './components/FormatGuide';
import { ShortcutsModal } from './components/ShortcutsModal';
import { BatchSettings, ImageQueueItem } from './types';
import { loadImageElement, processSingleImage } from './utils/imageProcessor';
import { downloadAllAsZip } from './utils/zipExport';
import { SAMPLE_IMAGES } from './data/sampleImages';

const DEFAULT_SETTINGS: BatchSettings = {
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
};

const STORAGE_KEY = 'optipress_user_batch_settings_v1';

export default function App() {
  // Load saved settings if present in localStorage
  const [settings, setSettings] = useState<BatchSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // fallback to default
    }
    return DEFAULT_SETTINGS;
  });

  const [items, setItems] = useState<ImageQueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('queue');
  const [inspectedItem, setInspectedItem] = useState<ImageQueueItem | null>(null);
  const [editingItem, setEditingItem] = useState<ImageQueueItem | null>(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isLoadingSamples, setIsLoadingSamples] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const dropZoneRef = useRef<DropZoneHandle>(null);
  const initialLoadedRef = useRef(false);

  // Platform detection for ⌘ vs Ctrl
  const isMac = typeof window !== 'undefined' && /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);
  const modLabel = isMac ? '⌘' : 'Ctrl';

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 3200);
  }, []);

  /**
   * Save current settings to localStorage profile
   */
  const handleSaveSettingsProfile = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      showToast(`Settings profile saved to browser! (${modLabel}+S)`);
    } catch (err) {
      showToast('Could not save settings: ' + String(err));
    }
  }, [settings, modLabel, showToast]);

  /**
   * Process a single item and update queue state
   */
  const processItem = useCallback(
    async (item: ImageQueueItem, currentSettings: BatchSettings): Promise<ImageQueueItem> => {
      try {
        const result = await processSingleImage(item, currentSettings);
        return {
          ...item,
          status: 'done',
          result,
          errorMessage: undefined,
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          ...item,
          status: 'error',
          errorMessage: msg,
        };
      }
    },
    []
  );

  /**
   * Batch process all items in queue
   */
  const runBatchProcessing = useCallback(
    async (targetItems: ImageQueueItem[], targetSettings: BatchSettings) => {
      if (targetItems.length === 0 || isProcessing) return;

      setIsProcessing(true);

      // Set items to processing status
      setItems((prev) =>
        prev.map((it) => ({
          ...it,
          status: 'processing',
        }))
      );

      const updatedList: ImageQueueItem[] = [];

      for (const item of targetItems) {
        const processed = await processItem(item, targetSettings);
        updatedList.push(processed);

        // Update item in state progressively
        setItems((prev) =>
          prev.map((it) => (it.id === processed.id ? processed : it))
        );
      }

      setIsProcessing(false);
      showToast(`Batch optimization complete for ${updatedList.length} files (${modLabel}+Enter)`);
    },
    [isProcessing, processItem, showToast, modLabel]
  );

  /**
   * Download All as ZIP
   */
  const handleDownloadAllZip = useCallback(async () => {
    const readyItems = items.filter((it) => it.status === 'done' && it.result);
    if (readyItems.length === 0) {
      showToast('No processed images ready to download yet');
      return;
    }
    try {
      await downloadAllAsZip(items);
      showToast(`ZIP archive downloaded with ${readyItems.length} images`);
    } catch (err) {
      showToast('Error generating ZIP archive: ' + String(err));
    }
  }, [items, showToast]);

  /**
   * Add new files to the batch queue
   */
  const handleFilesAdded = async (files: File[]) => {
    const newItems: ImageQueueItem[] = [];

    for (const file of files) {
      try {
        const img = await loadImageElement(file);
        const id = 'img_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
        const objectUrl = URL.createObjectURL(file);

        newItems.push({
          id,
          originalFile: file,
          name: file.name,
          originalSize: file.size,
          originalWidth: img.naturalWidth,
          originalHeight: img.naturalHeight,
          originalType: file.type || 'image/jpeg',
          originalUrl: objectUrl,
          aspectRatio: img.naturalWidth / img.naturalHeight,
          status: 'pending',
        });
      } catch (err) {
        console.error('Failed to parse image file:', file.name, err);
      }
    }

    if (newItems.length > 0) {
      const merged = [...items, ...newItems];
      setItems(merged);
      setActiveSection('queue');
      runBatchProcessing(merged, settings);
    }
  };

  /**
   * Load the 3 pre-generated realistic sample gallery images
   */
  const handleLoadSamples = async () => {
    setIsLoadingSamples(true);
    const newItems: ImageQueueItem[] = [];

    for (const sample of SAMPLE_IMAGES) {
      try {
        const res = await fetch(sample.url);
        const blob = await res.blob();
        const file = new File([blob], sample.name, { type: blob.type || 'image/jpeg' });
        const img = await loadImageElement(sample.url);
        const id = 'sample_' + sample.id + '_' + Date.now();

        newItems.push({
          id,
          originalFile: file,
          name: sample.name,
          originalSize: blob.size,
          originalWidth: img.naturalWidth,
          originalHeight: img.naturalHeight,
          originalType: blob.type || 'image/jpeg',
          originalUrl: sample.url,
          aspectRatio: img.naturalWidth / img.naturalHeight,
          status: 'pending',
        });
      } catch (err) {
        console.error('Error fetching sample image:', sample.name, err);
      }
    }

    setIsLoadingSamples(false);

    if (newItems.length > 0) {
      const merged = [...items, ...newItems];
      setItems(merged);
      setActiveSection('queue');
      runBatchProcessing(merged, settings);
    }
  };

  // Pre-load samples on first visit so user immediately sees a populated, working studio
  useEffect(() => {
    if (!initialLoadedRef.current) {
      initialLoadedRef.current = true;
      handleLoadSamples();
    }
  }, []);

  /**
   * Global Keyboard Shortcuts Listener
   */
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      const target = e.target as HTMLElement;
      const isEditingText =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // 1. Esc: close modals in order of precedence
      if (e.key === 'Escape') {
        if (isShortcutsOpen) {
          e.preventDefault();
          setIsShortcutsOpen(false);
          return;
        }
        if (editingItem) {
          e.preventDefault();
          setEditingItem(null);
          return;
        }
        if (inspectedItem) {
          e.preventDefault();
          setInspectedItem(null);
          return;
        }
      }

      // 2. Ctrl/Cmd + S: Save Settings
      if (isCmdOrCtrl && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        handleSaveSettingsProfile();
        return;
      }

      // 3. Ctrl/Cmd + Enter: Process All
      if (isCmdOrCtrl && e.key === 'Enter') {
        e.preventDefault();
        if (items.length > 0 && !isProcessing) {
          runBatchProcessing(items, settings);
        }
        return;
      }

      // 4. Ctrl/Cmd + D: Download All ZIP
      if (isCmdOrCtrl && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        handleDownloadAllZip();
        return;
      }

      // 5. Ctrl/Cmd + O: Open File Browser
      if (isCmdOrCtrl && (e.key === 'o' || e.key === 'O')) {
        e.preventDefault();
        dropZoneRef.current?.openFilePicker();
        return;
      }

      // Shortcuts that only fire when NOT editing form inputs:
      if (!isEditingText) {
        // '?' opens shortcuts modal
        if (e.key === '?' || (e.shiftKey && e.key === '/')) {
          e.preventDefault();
          setIsShortcutsOpen((prev) => !prev);
          return;
        }

        // Section switches (1, 2, 3)
        if (e.key === '1') {
          e.preventDefault();
          setActiveSection('queue');
          return;
        }
        if (e.key === '2') {
          e.preventDefault();
          setActiveSection('settings');
          return;
        }
        if (e.key === '3') {
          e.preventDefault();
          setActiveSection('guide');
          return;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    isShortcutsOpen,
    editingItem,
    inspectedItem,
    handleSaveSettingsProfile,
    items,
    isProcessing,
    runBatchProcessing,
    settings,
    handleDownloadAllZip,
  ]);

  /**
   * Remove single image from queue
   */
  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target?.result?.url) {
        URL.revokeObjectURL(target.result.url);
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  /**
   * Clear all items
   */
  const handleClearAll = () => {
    items.forEach((it) => {
      if (it.result?.url) URL.revokeObjectURL(it.result.url);
    });
    setItems([]);
  };

  /**
   * Single item override saving
   */
  const handleSaveItemOverride = async (
    itemId: string,
    customSettings: Partial<BatchSettings> | undefined
  ) => {
    const targetItem = items.find((i) => i.id === itemId);
    if (!targetItem) return;

    const updatedItem: ImageQueueItem = {
      ...targetItem,
      customSettings,
      status: 'processing',
    };

    setItems((prev) => prev.map((i) => (i.id === itemId ? updatedItem : i)));

    const reprocessed = await processItem(updatedItem, settings);
    setItems((prev) => prev.map((i) => (i.id === itemId ? reprocessed : i)));
    showToast(`Updated custom settings for ${targetItem.name}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        items={items}
        isProcessing={isProcessing}
        onDownloadAllZip={handleDownloadAllZip}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        isMac={isMac}
      />

      {/* High-density Stats & Savings Summary */}
      <StatsBar items={items} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Upload & Drop Area */}
        <DropZone
          ref={dropZoneRef}
          onFilesAdded={handleFilesAdded}
          onLoadSamples={handleLoadSamples}
          isLoadingSamples={isLoadingSamples}
          isMac={isMac}
        />

        {/* Batch Settings Panel */}
        <section id="settings">
          <BatchSettingsPanel
            settings={settings}
            onChange={(updated) => setSettings(updated)}
            onApplyAndProcess={() => runBatchProcessing(items, settings)}
            onSaveSettings={handleSaveSettingsProfile}
            isProcessing={isProcessing}
            itemCount={items.length}
            isMac={isMac}
          />
        </section>

        {/* Batch Queue Table */}
        <section id="queue">
          <BatchQueueTable
            items={items}
            onInspect={(item) => setInspectedItem(item)}
            onCustomizeItem={(item) => setEditingItem(item)}
            onRemoveItem={handleRemoveItem}
            onClearAll={handleClearAll}
            onReprocessAll={() => runBatchProcessing(items, settings)}
            isProcessing={isProcessing}
          />
        </section>

        {/* Technical Format Guide & Resizing Mechanics */}
        <section id="guide">
          <FormatGuide />
        </section>
      </main>

      {/* Comparison Modal with arrow navigation & zoom shortcuts */}
      {inspectedItem && (
        <ComparisonModal
          item={inspectedItem}
          onClose={() => setInspectedItem(null)}
          isMac={isMac}
        />
      )}

      {/* Single Item Override Modal */}
      {editingItem && (
        <SingleItemSettingsModal
          item={editingItem}
          globalSettings={settings}
          onSave={handleSaveItemOverride}
          onClose={() => setEditingItem(null)}
        />
      )}

      {/* Global Keyboard Shortcuts Cheat Sheet */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        isMac={isMac}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Minimal clean footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">OptiPress Studio</span>
            <span aria-hidden="true">·</span>
            <span>Batch Image Compressor, Resizer & Format Converter</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span>Press <kbd className="px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800 text-slate-300 font-mono text-[11px]">?</kbd> for shortcuts</span>
            <span aria-hidden="true">·</span>
            <span>100% Client-Side In-Memory Processing</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
