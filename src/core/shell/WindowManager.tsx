import React, { useState, useCallback, ReactNode } from 'react';
import { X, Minus, Square } from 'lucide-react';
import type { WindowState } from '@/src/core/types';
import { getAppById } from '@/src/apps/registry';

interface WindowManagerProps {
  windows: WindowState[];
  onCloseWindow: (id: string) => void;
  onMinimizeWindow: (id: string) => void;
  onMaximizeWindow: (id: string) => void;
  onFocusWindow: (id: string) => void;
  renderWindowContent: (appId: string) => ReactNode;
}

export const WindowManager: React.FC<WindowManagerProps> = ({
  windows,
  onCloseWindow,
  onMinimizeWindow,
  onMaximizeWindow,
  onFocusWindow,
  renderWindowContent
}) => {
  return (
    <>
      {windows.map(window => {
        if (window.isMinimized) return null;
        
        const app = getAppById(window.appId);
        if (!app) return null;

        const Icon = app.icon;
        
        return (
          <div
            key={window.id}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center"
            style={{ zIndex: 30 + window.zIndex }}
            onClick={() => onFocusWindow(window.id)}
          >
            <div
              className={`
                bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-2xl 
                flex flex-col animate-glitch-in transition-all duration-300 ease-in-out
                ${window.isMaximized 
                  ? 'w-screen h-[calc(100vh-48px)] rounded-none' 
                  : 'w-full h-full max-w-[92vw] max-h-[90vh]'
                }
              `}
              style={{
                clipPath: window.isMaximized ? 'none' : 'polygon(15px 0, calc(100% - 15px) 0, 100% 15px, 100% calc(100% - 15px), calc(100% - 15px) 100%, 15px 100%, 0 calc(100% - 15px), 0 15px)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Title Bar */}
              <header className="flex-shrink-0 h-10 bg-black/30 border-b border-[var(--border-color)] flex items-center justify-between px-3 cursor-move">
                <div className="flex items-center gap-2 text-sm text-cyan-300 font-mono">
                  <Icon size={16} />
                  <span>{window.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onMinimizeWindow(window.id)}
                    className="p-1 text-gray-400 hover:text-white"
                    title="Minimize"
                  >
                    <Minus size={16} />
                  </button>
                  <button
                    onClick={() => onMaximizeWindow(window.id)}
                    className="p-1 text-gray-400 hover:text-white"
                    title={window.isMaximized ? "Restore" : "Maximize"}
                  >
                    {window.isMaximized ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                      </svg>
                    ) : (
                      <Square size={14} />
                    )}
                  </button>
                  <button
                    onClick={() => onCloseWindow(window.id)}
                    className="p-1 text-gray-400 hover:bg-red-600 hover:text-white rounded-sm"
                    title="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
              </header>

              {/* Content */}
              <main className="flex-1 overflow-hidden relative bg-black/20 flex flex-col">
                {renderWindowContent(window.appId)}
              </main>
            </div>
          </div>
        );
      })}
    </>
  );
};

export const useWindowManager = () => {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [nextZIndex, setNextZIndex] = useState(1);

  const openWindow = useCallback((appId: string, title: string) => {
    const windowId = `${appId}-${Date.now()}`;
    const newWindow: WindowState = {
      id: windowId,
      appId,
      title,
      isMaximized: false,
      isMinimized: false,
      zIndex: nextZIndex
    };
    
    setWindows(prev => [...prev, newWindow]);
    setNextZIndex(prev => prev + 1);
    return windowId;
  }, [nextZIndex]);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, isMinimized: true } : w
    ));
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
    ));
  }, []);

  const focusWindow = useCallback((id: string) => {
    setWindows(prev => {
      const maxZ = Math.max(...prev.map(w => w.zIndex), 0);
      return prev.map(w => 
        w.id === id ? { ...w, zIndex: maxZ + 1 } : w
      );
    });
    setNextZIndex(prev => prev + 1);
  }, []);

  const restoreWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, isMinimized: false } : w
    ));
  }, []);

  return {
    windows,
    openWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    restoreWindow
  };
};
