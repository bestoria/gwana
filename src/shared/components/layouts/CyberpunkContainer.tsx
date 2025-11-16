import React from 'react';
import DeepSpaceBackground from '../DeepSpaceBackground';
import type { AiMode } from '@/src/lib/types';

interface CyberpunkContainerProps {
  children: React.ReactNode;
  aiMode?: AiMode;
  className?: string;
  withBackground?: boolean;
}

const CyberpunkContainer: React.FC<CyberpunkContainerProps> = ({
  children,
  aiMode = 'chat',
  className = '',
  withBackground = true
}) => {
  return (
    <div className={`relative min-h-screen ${className}`}>
      {withBackground && <DeepSpaceBackground aiMode={aiMode} />}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default CyberpunkContainer;
