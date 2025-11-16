import React from 'react';

interface CyberpunkInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number';
  className?: string;
  glowColor?: 'cyan' | 'magenta' | 'green' | 'amber';
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
}

const CyberpunkInput: React.FC<CyberpunkInputProps> = ({
  value,
  onChange,
  placeholder,
  type = 'text',
  className = '',
  glowColor = 'cyan',
  disabled = false,
  multiline = false,
  rows = 3
}) => {
  const glowColorMap = {
    cyan: 'var(--accent-cyan)',
    magenta: 'var(--accent-magenta)',
    green: 'var(--accent-green)',
    amber: 'var(--accent-amber)'
  };

  const selectedGlow = glowColorMap[glowColor];

  const baseStyles = {
    borderColor: selectedGlow,
    boxShadow: `0 0 10px ${selectedGlow}40, inset 0 0 10px ${selectedGlow}20`,
    transition: 'all 0.3s ease'
  };

  const focusStyles = {
    boxShadow: `0 0 20px ${selectedGlow}80, inset 0 0 15px ${selectedGlow}30`
  };

  const InputComponent = multiline ? 'textarea' : 'input';

  return (
    <div className={`relative ${className}`}>
      <InputComponent
        type={!multiline ? type : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={multiline ? rows : undefined}
        className="w-full bg-black/50 backdrop-blur-md border-2 rounded-lg px-4 py-2 text-white font-mono focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        style={baseStyles}
        onFocus={(e) => {
          Object.assign(e.currentTarget.style, focusStyles);
        }}
        onBlur={(e) => {
          Object.assign(e.currentTarget.style, baseStyles);
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-20 rounded-lg"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'
        }}
      />
    </div>
  );
};

export default CyberpunkInput;
