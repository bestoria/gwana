import React from 'react';

interface CyberpunkBadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  pulse?: boolean;
  className?: string;
}

const CyberpunkBadge: React.FC<CyberpunkBadgeProps> = ({
  children,
  variant = 'primary',
  pulse = false,
  className = ''
}) => {
  const variantColors = {
    primary: { base: 'var(--accent-cyan)', rgb: '0, 255, 255' },
    secondary: { base: 'var(--accent-magenta)', rgb: '255, 0, 255' },
    success: { base: 'var(--accent-green)', rgb: '0, 255, 0' },
    danger: { base: '#ff0055', rgb: '255, 0, 85' },
    warning: { base: 'var(--accent-amber)', rgb: '255, 200, 0' }
  };

  const color = variantColors[variant];

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${
        pulse ? 'animate-pulse' : ''
      } ${className}`}
      style={{
        borderColor: color.base,
        color: color.base,
        background: `rgba(${color.rgb}, 0.1)`,
        boxShadow: `0 0 10px ${color.base}60, inset 0 0 5px ${color.base}30`
      }}
    >
      {children}
    </span>
  );
};

export default CyberpunkBadge;
