import React, { useState, useEffect, useRef } from 'react';
import { Wifi, Volume2, HelpCircle, Settings } from 'lucide-react';
import { Logo } from './Logo';
import { AI_MODES } from '@/src/lib/constants';
import type { AiMode, View, Persona, CallState } from '@/src/lib/types';

interface TaskbarProps {
    activeMode: AiMode;
    setAiMode: (mode: AiMode) => void;
    activeView: View;
    setView: (view: View) => void;
    persona: Persona;
    callState: CallState;
    toggleAssistant: () => void;
}

const Clock: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    return (
        <div className="text-right">
            <div>{time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div>
            <div className="text-xs text-gray-400">{time.toLocaleDateString()}</div>
        </div>
    );
};

const Taskbar: React.FC<TaskbarProps> = ({ activeMode, setAiMode, activeView, setView, persona, callState, toggleAssistant }) => {
    const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
    const startMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (startMenuRef.current && !startMenuRef.current.contains(event.target as Node)) {
                setIsStartMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const activeApp = activeView === 'chat' 
        ? AI_MODES.find(m => m.mode === activeMode)
        : { name: activeView.charAt(0).toUpperCase() + activeView.slice(1), iconComponent: Settings };

    return (
        <footer className="taskbar">
            {/* Start Menu and Assistant */}
            <div className="flex items-center gap-2">
                <div className="relative">
                    <button onClick={() => setView('appDrawer')} title="Start" className="p-2 hover:bg-gray-700/50 rounded-md">
                        <Logo persona={persona} />
                    </button>
                </div>
                <button onClick={toggleAssistant} title="System Assistant" className="p-2 text-gray-300 hover:bg-gray-700/50 rounded-md">
                    <HelpCircle size={22} />
                </button>
            </div>

            {/* Pinned Apps / Open Windows */}
            <div className="flex-1 px-2 h-full flex items-center justify-center">
                {activeView !== 'dashboard' && activeView !== 'appDrawer' && activeApp && (
                    <button 
                        onClick={() => setView(activeView)}
                        className="h-full px-4 bg-cyan-900/50 border-b-2 border-cyan-400 text-cyan-300 text-sm flex items-center gap-2"
                    >
                        <activeApp.iconComponent size={16} />
                        <span>{activeApp.name}</span>
                    </button>
                )}
            </div>

            {/* System Tray */}
            <div className="system-tray">
                <Wifi size={18} />
                <Volume2 size={18} />
                <Clock />
            </div>
        </footer>
    );
};

export default Taskbar;
