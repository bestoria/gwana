import React from 'react';
import { X } from 'lucide-react';
import HolographicPanel from './HolographicPanel';
import NeonButton from './NeonButton';

interface CyberpunkModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  glowColor?: 'cyan' | 'magenta' | 'green' | 'amber';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const CyberpunkModal: React.FC<CyberpunkModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  glowColor = 'cyan',
  size = 'md'
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`w-full ${sizeClasses[size]} animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <HolographicPanel
          glowColor={glowColor}
          withCorners
          withScanlines
          className="max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: `var(--accent-${glowColor})` }}>
            {title && (
              <h2
                className="text-xl font-bold font-mono uppercase"
                style={{
                  color: `var(--accent-${glowColor})`,
                  textShadow: `0 0 10px var(--accent-${glowColor})`
                }}
              >
                {title}
              </h2>
            )}
            <NeonButton
              variant="danger"
              size="sm"
              onClick={onClose}
              title="Close"
            >
              <X size={16} />
            </NeonButton>
          </div>
          
          <div className="flex-1 overflow-auto p-4">
            {children}
          </div>
        </HolographicPanel>
      </div>
    </div>
  );
};

export default CyberpunkModal;
