import React from 'react';

interface CyberpunkProgressProps {
  value: number;
  max?: number;
  className?: string;
  glowColor?: 'cyan' | 'magenta' | 'green' | 'amber';
  showLabel?: boolean;
  animated?: boolean;
}

const CyberpunkProgress: React.FC<CyberpunkProgressProps> = ({
  value,
  max = 100,
  className = '',
  glowColor = 'cyan',
  showLabel = false,
  animated = true
}) => {
  const glowColorMap = {
    cyan: 'var(--accent-cyan)',
    magenta: 'var(--accent-magenta)',
    green: 'var(--accent-green)',
    amber: 'var(--accent-amber)'
  };

  const selectedGlow = glowColorMap[glowColor];
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={`relative w-full ${className}`}>
      <div
        className="w-full h-6 bg-black/50 backdrop-blur-md border-2 rounded-lg overflow-hidden"
        style={{
          borderColor: selectedGlow,
          boxShadow: `0 0 10px ${selectedGlow}40, inset 0 0 10px ${selectedGlow}20`
        }}
      >
        <div
          className={`h-full ${animated ? 'transition-all duration-500' : ''}`}
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${selectedGlow}80, ${selectedGlow})`,
            boxShadow: `0 0 20px ${selectedGlow}, inset 0 0 10px ${selectedGlow}40`
          }}
        />
        
        {/* Energy flow effect */}
        {animated && (
          <div
            className="absolute inset-0 opacity-50"
            style={{
              background: `repeating-linear-gradient(90deg, transparent, transparent 10px, ${selectedGlow}40 10px, ${selectedGlow}40 20px)`,
              animation: 'energy-flow 1s linear infinite'
            }}
          />
        )}
      </div>
      
      {showLabel && (
        <div
          className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold"
          style={{ color: selectedGlow, textShadow: `0 0 10px ${selectedGlow}` }}
        >
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
};

export default CyberpunkProgress;
