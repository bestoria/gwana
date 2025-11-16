import React from 'react';

interface HexagonButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  title?: string;
}

const HexagonButton: React.FC<HexagonButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  title
}) => {
  const variantColors = {
    primary: { base: 'var(--accent-cyan)', rgb: '0, 255, 255' },
    secondary: { base: 'var(--accent-magenta)', rgb: '255, 0, 255' },
    danger: { base: '#ff0055', rgb: '255, 0, 85' },
    success: { base: 'var(--accent-green)', rgb: '0, 255, 0' }
  };

  const sizeMap = {
    sm: { width: 60, height: 52 },
    md: { width: 80, height: 69 },
    lg: { width: 100, height: 87 }
  };

  const color = variantColors[variant];
  const dimensions = sizeMap[size];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`relative flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed ${className}`}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        clipPath:
          'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        background: `linear-gradient(135deg, rgba(${color.rgb}, 0.1), rgba(${color.rgb}, 0.2))`,
        border: `2px solid ${color.base}`,
        boxShadow: `0 0 20px ${color.base}80, inset 0 0 10px rgba(${color.rgb}, 0.2)`,
        color: color.base
      }}
    >
      <div className="relative z-10">{children}</div>
    </button>
  );
};

export default HexagonButton;
