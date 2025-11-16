import React from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface CyberpunkTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  glowColor?: 'cyan' | 'magenta' | 'green' | 'amber';
  compact?: boolean;
}

const CyberpunkTabs: React.FC<CyberpunkTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
  glowColor = 'cyan',
  compact = false
}) => {
  const glowColorMap = {
    cyan: 'var(--accent-cyan)',
    magenta: 'var(--accent-magenta)',
    green: 'var(--accent-green)',
    amber: 'var(--accent-amber)'
  };

  const selectedGlow = glowColorMap[glowColor];

  return (
    <div className={`flex gap-1 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`${
              compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
            } font-mono font-bold uppercase border-2 rounded-lg transition-all duration-300 flex items-center gap-2`}
            style={{
              borderColor: isActive ? selectedGlow : 'transparent',
              color: isActive ? selectedGlow : '#888',
              background: isActive
                ? `rgba(${glowColor === 'cyan' ? '0, 255, 255' : glowColor === 'magenta' ? '255, 0, 255' : glowColor === 'green' ? '0, 255, 0' : '255, 200, 0'}, 0.1)`
                : 'transparent',
              boxShadow: isActive
                ? `0 0 15px ${selectedGlow}60, inset 0 0 10px ${selectedGlow}30`
                : 'none',
              textShadow: isActive ? `0 0 10px ${selectedGlow}` : 'none'
            }}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CyberpunkTabs;
