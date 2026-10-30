import React, { useEffect } from 'react';
import { X, Command, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMac: boolean;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose, isMac }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modKey = isMac ? '⌘' : 'Ctrl';

  const shortcutGroups = [
    {
      category: 'Batch Workflow',
      items: [
        { keys: [modKey, 'Enter'], description: 'Process / optimize all queued images' },
        { keys: [modKey, 'S'], description: 'Save current settings as your default profile' },
        { keys: [modKey, 'D'], description: 'Download all processed images as a ZIP archive' },
        { keys: [modKey, 'O'], description: 'Open file picker to add new images' },
        { keys: ['Esc'], description: 'Close modals, drawers, and active inspectors' },
      ],
    },
    {
      category: 'Navigation & Views',
      items: [
        { keys: ['1'], description: 'Switch to Batch Queue tab' },
        { keys: ['2'], description: 'Switch to Compression Presets tab' },
        { keys: ['3'], description: 'Switch to Format Specifications tab' },
        { keys: ['?'], description: 'Toggle this keyboard shortcuts cheat sheet' },
      ],
    },
    {
      category: 'Comparison Inspector (Inside Modal)',
      items: [
        { keys: ['←', '→'], description: 'Nudge split curtain divider left / right' },
        { keys: ['+', '-'], description: 'Zoom in / Zoom out' },
        { keys: ['Tab'], description: 'Toggle between Split Slider and Side-by-Side views' },
        { keys: ['C'], description: 'Copy optimized image to clipboard' },
        { keys: ['D'], description: 'Download inspected image directly' },
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Global Keyboard Shortcuts</h3>
              <p className="text-xs text-slate-400 mt-0.5">Streamline high-volume batch optimization workflows</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-5 text-xs max-h-[60vh] overflow-y-auto pr-1">
          {shortcutGroups.map((group) => (
            <div key={group.category} className="space-y-2.5">
              <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase font-mono">
                {group.category}
              </div>
              <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl bg-slate-950/40 overflow-hidden">
                {group.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3.5 py-2.5 hover:bg-slate-800/30 transition-colors"
                  >
                    <span className="text-slate-300">{item.description}</span>
                    <div className="flex items-center gap-1 shrink-0 ml-4 font-mono">
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="px-2 py-0.5 text-[11px] font-semibold text-slate-200 bg-slate-800 border border-slate-700 rounded shadow-xs"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Shortcuts are inactive while actively editing text input fields</span>
          <kbd className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded border border-slate-700">
            Esc to close
          </kbd>
        </div>
      </div>
    </div>
  );
};
