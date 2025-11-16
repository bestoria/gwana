import React from 'react';

interface CyberpunkCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'cyan' | 'magenta' | 'green' | 'amber';
  withCorners?: boolean;
  withScanlines?: boolean;
  withGrid?: boolean;
  onClick?: () => void;
  hoverable?: boolean;
}

const CyberpunkCard: React.FC<CyberpunkCardProps> = ({
  children,
  className = '',
  glowColor = 'cyan',
  withCorners = true,
  withScanlines = true,
  withGrid = false,
  onClick,
  hoverable = false
}) => {
  const glowColorMap = {
    cyan: 'var(--accent-cyan)',
    magenta: 'var(--accent-magenta)',
    green: 'var(--accent-green)',
    amber: 'var(--accent-amber)'
  };

  const selectedGlow = glowColorMap[glowColor];

  return (
    <div
      className={`relative ${onClick ? 'cursor-pointer' : ''} ${
        hoverable ? 'transition-all duration-300 hover:scale-[1.02]' : ''
      } ${className}`}
      onClick={onClick}
      style={{
        ...(hoverable && {
          transition: 'all 0.3s ease'
        })
      }}
    >
      <div
        className="relative backdrop-blur-md bg-black/40 border rounded-lg overflow-hidden"
        style={{
          borderColor: selectedGlow,
          boxShadow: `0 0 20px ${selectedGlow}40, inset 0 0 20px ${selectedGlow}20`
        }}
      >
        {withGrid && (
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(${selectedGlow} 1px, transparent 1px), linear-gradient(90deg, ${selectedGlow} 1px, transparent 1px)`,
              backgroundSize: '20px 20px'
            }}
          />
        )}

        {withScanlines && (
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
              animation: 'scanline-flicker 8s infinite'
            }}
          />
        )}

        {withCorners && (
          <>
            <div
              className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2"
              style={{ borderColor: selectedGlow }}
            />
            <div
              className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2"
              style={{ borderColor: selectedGlow }}
            />
            <div
              className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2"
              style={{ borderColor: selectedGlow }}
            />
            <div
              className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2"
              style={{ borderColor: selectedGlow }}
            />
          </>
        )}

        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
};

export default CyberpunkCard;
