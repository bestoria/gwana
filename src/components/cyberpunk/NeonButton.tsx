import React from 'react';

const COLOR_MAP = {
  cyan: 'var(--accent-cyan)',
  magenta: 'var(--accent-magenta)',
  green: 'var(--accent-green)',
  amber: 'var(--accent-amber)',
  purple: 'var(--accent-magenta)' // Map purple to magenta for consistency
};

interface NeonButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  color?: 'cyan' | 'magenta' | 'green' | 'amber' | 'purple';
  shape?: 'circle' | 'hexagon' | 'square';
  size?: 'sm' | 'md' | 'lg' | 'large';
  className?: string;
  title?: string;
  glowing?: boolean;
  fullWidth?: boolean;
}

const NeonButton: React.FC<NeonButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  color,
  shape = 'circle',
  size = 'md',
  className = '',
  title,
  glowing = false,
  fullWidth = false
}) => {
  // Determine color from either color prop or variant
  const getColor = () => {
    if (color) {
      const mapped = COLOR_MAP[color];
      const rgbMap: Record<string, string> = {
        'var(--accent-cyan)': '0, 255, 255',
        'var(--accent-magenta)': '255, 0, 255',
        'var(--accent-green)': '0, 255, 0',
        'var(--accent-amber)': '255, 200, 0'
      };
      return { base: mapped, rgb: rgbMap[mapped] || '0, 255, 255' };
    }
    
    const variantColors = {
      primary: { base: 'var(--accent-cyan)', rgb: '0, 255, 255' },
      secondary: { base: 'var(--accent-magenta)', rgb: '255, 0, 255' },
      danger: { base: '#ff0055', rgb: '255, 0, 85' },
      success: { base: 'var(--accent-green)', rgb: '0, 255, 0' }
    };
    return variantColors[variant];
  };

  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    large: 'px-6 py-3 text-sm font-bold'
  };

  const colorObj = getColor();
  const sizeClass = sizeClasses[size];

  const baseStyles = {
    background: `linear-gradient(135deg, rgba(${colorObj.rgb}, 0.1), rgba(${colorObj.rgb}, 0.2))`,
    borderColor: colorObj.base,
    boxShadow: glowing 
      ? `0 0 20px ${colorObj.base}, 0 0 40px ${colorObj.base}, inset 0 0 10px rgba(${colorObj.rgb}, 0.2)`
      : `0 0 10px rgba(${colorObj.rgb}, 0.5), inset 0 0 5px rgba(${colorObj.rgb}, 0.1)`,
    color: colorObj.base
  };

  const shapeClass = shape === 'circle' && size !== 'large'
    ? 'rounded-full' 
    : shape === 'hexagon' 
    ? 'clip-hexagon' 
    : 'rounded-lg';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${fullWidth ? 'w-full' : sizeClass} ${shapeClass} border-2 flex items-center justify-center gap-2
                  transition-all duration-300 hover:scale-105 
                  disabled:opacity-30 disabled:cursor-not-allowed
                  ${glowing ? 'animate-pulse-glow' : ''} ${className}`}
      style={baseStyles}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.boxShadow = `0 0 30px ${colorObj.base}, 0 0 60px ${colorObj.base}, inset 0 0 15px rgba(${colorObj.rgb}, 0.3)`;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.boxShadow = glowing
            ? `0 0 20px ${colorObj.base}, 0 0 40px ${colorObj.base}, inset 0 0 10px rgba(${colorObj.rgb}, 0.2)`
            : `0 0 10px rgba(${colorObj.rgb}, 0.5), inset 0 0 5px rgba(${colorObj.rgb}, 0.1)`;
        }
      }}
    >
      {children}
    </button>
  );
};

export default NeonButton;
