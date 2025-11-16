import React, { ReactNode, useRef, useEffect, useState } from 'react';
import { X, Minus, Square } from 'lucide-react';

interface WindowProps {
    title: string;
    icon: React.ReactNode;
    children: ReactNode;
    onClose: () => void;
}

const Window: React.FC<WindowProps> = ({ title, icon, children, onClose }) => {
    const windowRef = useRef<HTMLDivElement>(null);
    const [isMaximized, setIsMaximized] = useState(false);

    // Handle click outside to close the window
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Do not close if maximized, user must use close button
            if (isMaximized) return;
            if (windowRef.current && !windowRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose, isMaximized]);
    
    const windowClasses = `
        bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-2xl flex flex-col animate-glitch-in
        transition-all duration-300 ease-in-out absolute
        ${isMaximized 
            ? 'top-0 left-0 w-screen h-[calc(100vh-48px)] rounded-none' // 48px is taskbar height
            : 'w-full h-full max-w-5xl max-h-[85vh]'
        }
    `;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 flex items-center justify-center">
            <div 
                ref={windowRef}
                className={windowClasses}
                style={{ clipPath: isMaximized ? 'none' : 'polygon(15px 0, calc(100% - 15px) 0, 100% 15px, 100% calc(100% - 15px), calc(100% - 15px) 100%, 15px 100%, 0 calc(100% - 15px), 0 15px)' }}
            >
                {/* Title Bar */}
                <header className="flex-shrink-0 h-10 bg-black/30 border-b border-[var(--border-color)] flex items-center justify-between px-3 cursor-move">
                    <div className="flex items-center gap-2 text-sm text-cyan-300 font-mono">
                        {icon}
                        <span>{title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => alert('Minimize functionality coming soon!')} className="p-1 text-gray-400 hover:text-white" title="Minimize"><Minus size={16} /></button>
                        <button onClick={() => setIsMaximized(!isMaximized)} className="p-1 text-gray-400 hover:text-white" title={isMaximized ? "Restore" : "Maximize"}>
                            {isMaximized ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg> : <Square size={14} />}
                        </button>
                        <button onClick={onClose} className="p-1 text-gray-400 hover:bg-red-600 hover:text-white rounded-sm" title="Close"><X size={16} /></button>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-hidden relative bg-black/20 flex flex-col">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Window;
