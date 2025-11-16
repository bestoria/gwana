import React from 'react';
import { Phone, MessageSquare, Settings as SettingsIcon, Home } from 'lucide-react';
import type { View, AiMode } from '@/src/lib/types';
import { useLiveAPIContext } from '../contexts/LiveAPIContext';

interface MobileFooterProps {
    view: View;
    setView: (view: View) => void;
    setAiMode: (mode: AiMode) => void;
}

const MobileFooter: React.FC<MobileFooterProps> = ({ view, setView, setAiMode }) => {
    const { startCall } = useLiveAPIContext();

    const navItems = [
        { icon: Home, label: "Home", targetView: 'dashboard' },
        { icon: MessageSquare, label: "Chat", targetView: 'chat' },
        { icon: 'APPS', label: "Apps", targetView: 'appDrawer' },
        { icon: Phone, label: "Call", onClick: () => startCall() },
        { icon: SettingsIcon, label: "Settings", targetView: 'settings' }
    ];

    return (
        <footer className="mobile-footer">
            {navItems.map(({ icon: Icon, label, onClick, targetView }) => {
                const isActive = view === targetView;
                
                const handleClick = () => {
                    if (onClick) {
                        onClick();
                    } else if (targetView) {
                        if (targetView === 'chat') setAiMode('default');
                        setView(targetView as View);
                    }
                };

                if (label === 'Apps') {
                    return (
                        <button key={label} onClick={handleClick} className="nav-btn-main">
                             <span className="grid grid-cols-3 gap-1">
                                {[...Array(9)].map((_, i) => <span key={i} className="w-1.5 h-1.5 bg-black/50 rounded-full"></span>)}
                            </span>
                        </button>
                    );
                }

                return (
                    <button key={label} onClick={handleClick} className={`nav-btn ${isActive ? 'active' : ''}`}>
                        <Icon size={24} />
                        <span className="label">{label}</span>
                    </button>
                );
            })}
        </footer>
    );
};

export default MobileFooter;