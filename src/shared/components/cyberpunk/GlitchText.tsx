import React, { useEffect, useState } from 'react';

interface GlitchTextProps {
  children: string;
  className?: string;
  glitchIntensity?: 'low' | 'medium' | 'high';
  continuous?: boolean;
}

const GlitchText: React.FC<GlitchTextProps> = ({
  children,
  className = '',
  glitchIntensity = 'low',
  continuous = false
}) => {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    if (!continuous) return;

    const intervals = {
      low: 8000,
      medium: 5000,
      high: 3000
    };

    const interval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 200);
    }, intervals[glitchIntensity]);

    return () => clearInterval(interval);
  }, [continuous, glitchIntensity]);

  return (
    <span
      className={`relative inline-block ${className} ${
        isGlitching ? 'animate-glitch-in' : ''
      }`}
      style={{
        textShadow: isGlitching
          ? '0.05em 0 0 rgba(255, 0, 0, 0.75), -0.025em -0.05em 0 rgba(0, 255, 0, 0.75), 0.025em 0.05em 0 rgba(0, 0, 255, 0.75)'
          : 'none'
      }}
    >
      {children}
    </span>
  );
};

export default GlitchText;
