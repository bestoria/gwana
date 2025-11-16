import React from 'react';
import Taskbar from '@/src/shared/components/Taskbar';
import Sidebar from '@/src/shared/components/Sidebar';
import DeepSpaceBackground from '@/src/shared/components/DeepSpaceBackground';
import type { AiMode, View, Persona, CallState } from '@/src/core/types';

interface DesktopProps {
  activeMode: AiMode;
  setAiMode: (mode: AiMode) => void;
  activeView: View;
  setView: (view: View) => void;
  persona: Persona;
  callState: CallState;
  toggleAssistant: () => void;
  children: React.ReactNode;
}

export const Desktop: React.FC<DesktopProps> = ({
  activeMode,
  setAiMode,
  activeView,
  setView,
  persona,
  callState,
  toggleAssistant,
  children
}) => {
  return (
    <div className="flex h-screen overflow-hidden bg-black">
      <DeepSpaceBackground aiMode={activeMode} />
      
      {/* Left Sidebar */}
      <Sidebar
        activeMode={activeMode}
        setAiMode={setAiMode}
        activeView={activeView}
        setView={setView}
        persona={persona}
        callState={callState}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10">
        <main className="flex-1 overflow-hidden">
          {children}
        </main>

        {/* Taskbar */}
        <Taskbar
          activeMode={activeMode}
          setAiMode={setAiMode}
          activeView={activeView}
          setView={setView}
          persona={persona}
          callState={callState}
          toggleAssistant={toggleAssistant}
        />
      </div>
    </div>
  );
};
