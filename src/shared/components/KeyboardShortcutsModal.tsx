import React, { useEffect } from 'react';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
    onClose: () => void;
}

const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ onClose }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-md animate-glitch-in" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div 
        className="bg-black/50 border border-[var(--border-color)] rounded-lg p-6 max-w-md w-full shadow-2xl" 
        style={{ boxShadow: '0 0 20px var(--accent-cyan)'}} 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="shortcuts-title" className="text-xl font-bold text-cyan-300 flex items-center gap-2">
            <Keyboard size={24} /> Hotkeys
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded px-2"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        <div className="space-y-3 font-mono text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Search</span>
            <kbd className="px-2 py-1 bg-gray-900 border border-gray-700 rounded text-cyan-300">Ctrl/⌘ + K</kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Settings</span>
            <kbd className="px-2 py-1 bg-gray-900 border border-gray-700 rounded text-cyan-300">Ctrl/⌘ + ,</kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Export Log</span>
            <kbd className="px-2 py-1 bg-gray-900 border border-gray-700 rounded text-cyan-300">Ctrl/⌘ + E</kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Transmit</span>
            <kbd className="px-2 py-1 bg-gray-900 border border-gray-700 rounded text-cyan-300">Enter</kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Exit Modal</span>
            <kbd className="px-2 py-1 bg-gray-900 border border-gray-700 rounded text-cyan-300">Esc</kbd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;
