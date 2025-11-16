import React from 'react';
import MobileFooter from '@/src/shared/components/MobileFooter';
import DeepSpaceBackground from '@/src/shared/components/DeepSpaceBackground';
import type { AiMode, View } from '@/src/core/types';

interface MobileProps {
  activeMode: AiMode;
  setAiMode: (mode: AiMode) => void;
  activeView: View;
  setView: (view: View) => void;
  children: React.ReactNode;
}

export const Mobile: React.FC<MobileProps> = ({
  activeMode,
  setAiMode,
  activeView,
  setView,
  children
}) => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black">
      <DeepSpaceBackground aiMode={activeMode} />
      
      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative z-10">
        {children}
      </main>

      {/* Mobile Footer Navigation */}
      <MobileFooter
        activeMode={activeMode}
        setAiMode={setAiMode}
        activeView={activeView}
        setView={setView}
      />
    </div>
  );
};
