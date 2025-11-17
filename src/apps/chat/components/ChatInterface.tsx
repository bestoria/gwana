import React from 'react';
import { MessageList } from './MessageList';
import { ChatHeader } from './ChatHeader';
import ChatInput from '@/src/shared/components/chat/ChatInput';
import type { Message, Settings, AiMode, Persona } from '@/src/core/types';

interface ChatInterfaceProps {
  messages: Message[];
  aiMode: AiMode;
  persona: Persona;
  settings: Settings;
  onSendMessage: (message: string, image?: { data: string; mimeType: string }) => void;
  onClearChat: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  aiMode,
  persona,
  settings,
  onSendMessage,
  onClearChat
}) => {
  return (
    <div className="flex flex-col h-full bg-background">
      <ChatHeader 
        aiMode={aiMode}
        persona={persona}
        messageCount={messages.length}
        onClearChat={onClearChat}
      />
      
      <MessageList 
        messages={messages}
        settings={settings}
        aiMode={aiMode}
      />
      
      <div className="border-t border-border">
        <ChatInput
          onSendMessage={onSendMessage}
          aiMode={aiMode}
          persona={persona}
        />
      </div>
    </div>
  );
};
