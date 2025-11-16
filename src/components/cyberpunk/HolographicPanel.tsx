import React from 'react';

interface HolographicPanelProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'cyan' | 'magenta' | 'green' | 'amber';
  withScanlines?: boolean;
  withCorners?: boolean;
  withGrid?: boolean;
}

const HolographicPanel: React.FC<HolographicPanelProps> = ({ 
  children, 
  className = '', 
  glowColor = 'cyan',
  withScanlines = true,
  withCorners = true,
  withGrid = false
}) => {
  const glowColorMap = {
    cyan: 'var(--accent-cyan)',
    magenta: 'var(--accent-magenta)',
    green: 'var(--accent-green)',
    amber: 'var(--accent-amber)'
  };

  const selectedGlow = glowColorMap[glowColor];

  return (
    <div className={`relative ${className}`}>
      {/* Main panel with glass-morphism */}
      <div className="relative backdrop-blur-md bg-black/40 border rounded-lg overflow-hidden"
           style={{ 
             borderColor: selectedGlow,
             boxShadow: `0 0 20px ${selectedGlow}40, inset 0 0 20px ${selectedGlow}20`
           }}>
        
        {/* Grid pattern */}
        {withGrid && (
          <div className="absolute inset-0 opacity-10 pointer-events-none"
               style={{
                 backgroundImage: `linear-gradient(${selectedGlow} 1px, transparent 1px), linear-gradient(90deg, ${selectedGlow} 1px, transparent 1px)`,
                 backgroundSize: '20px 20px'
               }} />
        )}

        {/* Scanlines */}
        {withScanlines && (
          <div className="absolute inset-0 pointer-events-none opacity-20"
               style={{
                 backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
                 animation: 'scanline-flicker 8s infinite'
               }} />
        )}

        {/* Corner accents */}
        {withCorners && (
          <>
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: selectedGlow }} />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: selectedGlow }} />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: selectedGlow }} />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: selectedGlow }} />
          </>
        )}

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
};

export default HolographicPanel;
