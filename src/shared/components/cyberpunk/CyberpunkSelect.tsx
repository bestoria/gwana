import React from 'react';
import { ChevronDown } from 'lucide-react';

interface CyberpunkSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
  glowColor?: 'cyan' | 'magenta' | 'green' | 'amber';
  disabled?: boolean;
  placeholder?: string;
}

const CyberpunkSelect: React.FC<CyberpunkSelectProps> = ({
  value,
  onChange,
  options,
  className = '',
  glowColor = 'cyan',
  disabled = false,
  placeholder = 'Select...'
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

  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full bg-black/50 backdrop-blur-md border-2 rounded-lg px-4 py-2 pr-10 text-white font-mono focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
        style={baseStyles}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-black">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
        size={20}
        style={{ color: selectedGlow }}
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

export default CyberpunkSelect;
