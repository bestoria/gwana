import React from 'react';

interface NeonButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  shape?: 'circle' | 'hexagon' | 'square';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  title?: string;
  glowing?: boolean;
}

const NeonButton: React.FC<NeonButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  shape = 'circle',
  size = 'md',
  className = '',
  title,
  glowing = false
}) => {
  const variantColors = {
    primary: { base: 'var(--accent-cyan)', rgb: '0, 255, 255' },
    secondary: { base: 'var(--accent-magenta)', rgb: '255, 0, 255' },
    danger: { base: '#ff0055', rgb: '255, 0, 85' },
    success: { base: 'var(--accent-green)', rgb: '0, 255, 0' }
  };

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const color = variantColors[variant];
  const sizeClass = sizeClasses[size];

  const baseStyles = {
    background: `linear-gradient(135deg, rgba(${color.rgb}, 0.1), rgba(${color.rgb}, 0.2))`,
    borderColor: color.base,
    boxShadow: glowing 
      ? `0 0 20px ${color.base}, 0 0 40px ${color.base}, inset 0 0 10px rgba(${color.rgb}, 0.2)`
      : `0 0 10px rgba(${color.rgb}, 0.5), inset 0 0 5px rgba(${color.rgb}, 0.1)`,
    color: color.base
  };

  const shapeClass = shape === 'circle' 
    ? 'rounded-full' 
    : shape === 'hexagon' 
    ? 'clip-hexagon' 
    : 'rounded-lg';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${sizeClass} ${shapeClass} border-2 flex items-center justify-center
                  transition-all duration-300 hover:scale-110 
                  disabled:opacity-30 disabled:cursor-not-allowed
                  ${glowing ? 'animate-pulse-glow' : ''} ${className}`}
      style={baseStyles}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.boxShadow = `0 0 30px ${color.base}, 0 0 60px ${color.base}, inset 0 0 15px rgba(${color.rgb}, 0.3)`;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.boxShadow = glowing
            ? `0 0 20px ${color.base}, 0 0 40px ${color.base}, inset 0 0 10px rgba(${color.rgb}, 0.2)`
            : `0 0 10px rgba(${color.rgb}, 0.5), inset 0 0 5px rgba(${color.rgb}, 0.1)`;
        }
      }}
    >
      {children}
    </button>
  );
};

export default NeonButton;
