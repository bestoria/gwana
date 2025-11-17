import React from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import type { AiMode, Persona } from '@/src/core/types';
import { AI_MODES } from '@/src/lib/constants';

interface ChatHeaderProps {
  aiMode: AiMode;
  persona: Persona;
  messageCount: number;
  onClearChat: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  aiMode,
  persona,
  messageCount,
  onClearChat
}) => {
  const modeConfig = AI_MODES.find(m => m.mode === aiMode);
  
  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <MessageSquare className="text-primary" size={20} />
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {modeConfig?.name || 'Chat'}
          </h2>
          <p className="text-xs text-muted-foreground">
            {messageCount} messages • {persona} persona
          </p>
        </div>
      </div>
      
      {messageCount > 0 && (
        <button
          onClick={onClearChat}
          className="p-2 hover:bg-accent rounded-md transition-colors"
          title="Clear chat"
        >
          <Trash2 size={18} className="text-muted-foreground hover:text-destructive" />
        </button>
      )}
    </div>
  );
};
