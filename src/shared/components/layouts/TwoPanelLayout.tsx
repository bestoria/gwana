import React, { ReactNode, useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface TwoPanelLayoutProps {
  leftContent: ReactNode;
  rightControls: ReactNode;
  className?: string;
}

const TwoPanelLayout: React.FC<TwoPanelLayoutProps> = ({ 
  leftContent, 
  rightControls, 
  className = '' 
}) => {
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);

  return (
    <div className={`flex h-full w-full gap-0 ${className}`}>
      {/* Left Panel - Content Area (2/3) */}
      <div 
        className={`flex-shrink-0 transition-all duration-300 ${
          isRightPanelCollapsed ? 'w-full' : 'w-2/3'
        } h-full overflow-hidden border-r border-[var(--border-color)] bg-black/10`}
      >
        <div className="h-full overflow-y-auto overflow-x-hidden">
          {leftContent}
        </div>
      </div>

      {/* Right Panel - Controls Area (1/3) */}
      <div 
        className={`flex-shrink-0 transition-all duration-300 ${
          isRightPanelCollapsed ? 'w-0' : 'w-1/3'
        } h-full overflow-hidden bg-black/20 relative`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-6 h-12 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-l-md flex items-center justify-center hover:bg-[var(--accent-cyan)]/20 transition-colors group"
          title={isRightPanelCollapsed ? 'Show Controls' : 'Hide Controls'}
        >
          {isRightPanelCollapsed ? (
            <ChevronLeft size={16} className="text-cyan-300 group-hover:text-cyan-100" />
          ) : (
            <ChevronRight size={16} className="text-cyan-300 group-hover:text-cyan-100" />
          )}
        </button>

        {/* Controls Content */}
        <div className={`h-full overflow-y-auto overflow-x-hidden p-4 ${isRightPanelCollapsed ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
          {rightControls}
        </div>
      </div>
    </div>
  );
};

export default TwoPanelLayout;
