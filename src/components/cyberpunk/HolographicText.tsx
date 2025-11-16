import React from 'react';

interface HolographicTextProps {
  children: React.ReactNode;
  className?: string;
  glitchEffect?: boolean;
  flickerEffect?: boolean;
  glowColor?: 'cyan' | 'magenta' | 'green' | 'amber';
}

const HolographicText: React.FC<HolographicTextProps> = ({
  children,
  className = '',
  glitchEffect = false,
  flickerEffect = false,
  glowColor = 'cyan'
}) => {
  const glowColors = {
    cyan: 'var(--accent-cyan)',
    magenta: 'var(--accent-magenta)',
    green: 'var(--accent-green)',
    amber: 'var(--accent-amber)'
  };

  const selectedGlow = glowColors[glowColor];

  return (
    <span 
      className={`${className} ${glitchEffect ? 'animate-glitch-in' : ''}`}
      style={{
        textShadow: flickerEffect 
          ? undefined
          : `0 0 10px ${selectedGlow}, 0 0 20px ${selectedGlow}, 0 0 30px ${selectedGlow}`,
        animation: flickerEffect ? 'flicker 5s linear infinite' : undefined
      }}
    >
      {children}
    </span>
  );
};

export default HolographicText;
