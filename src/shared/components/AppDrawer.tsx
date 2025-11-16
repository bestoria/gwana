import React from 'react';
import { ArrowLeft, Calculator, Calendar, Sparkles, Code, BookOpen, Phone } from 'lucide-react';
import { AI_MODES } from '@/src/lib/constants';
import type { View, AiMode } from '@/src/lib/types';

interface AppDrawerProps {
    setView: (view: View) => void;
    setAiMode: (mode: AiMode) => void;
}

const AppDrawer: React.FC<AppDrawerProps> = ({ setView, setAiMode }) => {
    
    const apps = [
        ...AI_MODES.map(m => ({
            label: m.name,
            icon: m.iconComponent,
            onClick: () => {
                setAiMode(m.mode);
                setView('chat');
            }
        })),
        {
            label: 'Calendar',
            icon: Calendar,
            onClick: () => setView('calendar')
        },
        {
            label: 'Study Hub',
            icon: AI_MODES.find(m => m.mode === 'study')?.iconComponent,
            onClick: () => setView('studyHub')
        },
        {
            label: 'AI Writer',
            icon: Sparkles,
            onClick: () => setView('aiWriter')
        },
        {
            label: 'Code Helper',
            icon: Code,
            onClick: () => setView('codeHelper')
        },
        {
            label: 'Voice Journal',
            icon: BookOpen,
            onClick: () => setView('voiceJournal')
        },
        {
            label: 'Call',
            icon: Phone,
            onClick: () => setView('callApp')
        },
        {
            label: 'Calculator',
            icon: Calculator,
            onClick: () => alert('Calculator app coming soon!')
        },
    ];

    return (
        <div className="app-drawer-container">
            <div className="flex items-center gap-4 mb-4">
                <button onClick={() => setView('dashboard')} className="p-2 text-cyan-300">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-cyan-300">All Apps</h1>
            </div>
            
            <div className="flex-1 overflow-y-auto">
                <div className="app-drawer-grid">
                    {apps.map(({ label, icon: Icon, onClick }) => (
                         <button key={label} onClick={onClick} className="desktop-shortcut">
                             <div className="w-16 h-16 bg-black/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/10">
                                {Icon && <Icon size={32} />}
                            </div>
                            <span>{label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AppDrawer;