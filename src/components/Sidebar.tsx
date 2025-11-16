import React, { useMemo } from 'react';
import { Settings, Code, MessageSquare, BookOpen, Car, Calendar, Globe } from 'lucide-react';
import type { AiMode, View, Persona, CallState } from '@/src/lib/types';
import { AI_MODES } from '@/src/lib/constants';
import { Logo } from './Logo';

interface SidebarProps {
  activeMode: AiMode;
  setAiMode: (mode: AiMode) => void;
  activeView: View;
  setView: (view: View) => void;
  persona: Persona;
  callState: CallState;
}

interface NavButtonProps {
  label: string;
  icon: string | React.ReactElement;
  mode?: AiMode;
  view?: View;
  isActive: boolean;
  onClick: () => void;
  disabled: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({
  label,
  icon,
  mode,
  view,
  isActive,
  onClick,
  disabled,
}) => {
  return (
    <button
      id={mode === 'news' ? 'onboarding-sidebar-news-button' : undefined}
      onClick={onClick}
      title={label}
      disabled={disabled}
      className={`w-14 h-14 rounded-lg flex items-center justify-center transition-all duration-200 relative group ${ disabled ? 'opacity-50 cursor-not-allowed' : ''} ${
        isActive
          ? 'bg-cyan-900/50 text-cyan-300'
          : 'text-gray-400 hover:bg-gray-800'
      }`}
    >
      {typeof icon === 'string' ? <span className="text-2xl">{icon}</span> : icon}
      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-cyan-400 rounded-r-full" style={{boxShadow: '0 0 10px var(--accent-cyan)'}}></div>}
      <div className="absolute left-full ml-3 w-max px-3 py-1.5 bg-black/80 text-white text-xs font-semibold rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        {label}
      </div>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ activeMode, setAiMode, activeView, setView, persona, callState }) => {
  const isCallActive = callState !== 'idle' && callState !== 'standby';
  
  return (
    <div className="h-full w-20 bg-black flex flex-col items-center justify-between py-4 border-r border-gray-800">
      <div className="flex flex-col items-center gap-2">
        <div className="mb-4" title="Kwararru AI">
            <Logo persona={persona} />
        </div>
        
        {AI_MODES.map(modeInfo => {
          const Icon = modeInfo.iconComponent;
          return (
            <NavButton
              key={modeInfo.mode}
              label={modeInfo.name}
              icon={<Icon size={24} />}
              mode={modeInfo.mode}
              isActive={activeView === 'chat' && activeMode === modeInfo.mode}
              onClick={() => {
                  setView('chat');
                  setAiMode(modeInfo.mode);
              }}
              disabled={isCallActive}
            />
          );
        })}
        
        <div className="w-10 border-b border-gray-700 my-2" />

        <NavButton
            label="Study Hub"
            icon={<BookOpen size={24} />}
            view="studyHub"
            isActive={activeView === 'studyHub'}
            onClick={() => setView('studyHub')}
            disabled={isCallActive}
        />

      </div>
      <div className="flex flex-col items-center gap-4">
        <button
            onClick={() => setView('settings')}
            title="Settings"
            disabled={isCallActive}
            className={`w-14 h-14 rounded-lg flex items-center justify-center transition-all duration-200 relative group ${isCallActive ? 'opacity-50 cursor-not-allowed' : ''} ${
              activeView === 'settings'
                ? 'bg-cyan-900/50 text-cyan-300'
                : 'text-gray-400 hover:bg-gray-800'
            }`}
        >
            <Settings size={24} />
            {activeView === 'settings' && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-cyan-400 rounded-r-full" style={{boxShadow: '0 0 10px var(--accent-cyan)'}}></div>}
            <div className="absolute left-full ml-3 w-max px-3 py-1.5 bg-black/80 text-white text-xs font-semibold rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              Settings
            </div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;