import React from 'react';
import { ChatUI } from '@/src/components/ChatUI';
import type { AiMode, Persona, Message, Settings } from '@/src/core/types';

interface ChatAppProps {
  messages: Message[];
  aiMode: AiMode;
  persona: Persona;
  settings: Settings;
  onSendMessage: (message: string, image?: { data: string; mimeType: string }) => void;
  onClearChat: () => void;
}

export const ChatApp: React.FC<ChatAppProps> = (props) => {
  return (
    <div className="h-full w-full">
      <ChatUI {...props} />
    </div>
  );
};
