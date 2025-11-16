import React from 'react';
import { Persona } from '@/src/lib/types';

interface AssistantEmojiProps {
  persona: Persona;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isAnimated?: boolean;
}

const AssistantEmoji: React.FC<AssistantEmojiProps> = ({ 
  persona, 
  size = 'md',
  isAnimated = false 
}) => {
  const emoji = persona === 'Agent Zero' ? '👨‍💼' : '👩‍💼';
  
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
    xl: 'text-8xl'
  };

  return (
    <div className={`${sizeClasses[size]} ${isAnimated ? 'animate-pulse' : ''}`}>
      {emoji}
    </div>
  );
};

export default AssistantEmoji;
