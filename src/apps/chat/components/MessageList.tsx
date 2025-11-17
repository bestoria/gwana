import React, { useRef, useEffect } from 'react';
import AnimatedAiMessage from '@/src/shared/components/chat/AnimatedAiMessage';
import type { Message, Settings, AiMode } from '@/src/core/types';
import { formatTime } from '@/src/lib/utils';
import { User, Bot } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  settings: Settings;
  aiMode: AiMode;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  settings,
  aiMode
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-3 ${
            message.sender === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          {message.sender === 'ai' && (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Bot size={16} className="text-primary" />
            </div>
          )}
          
          <div className={`max-w-[70%] ${message.sender === 'user' ? 'order-first' : ''}`}>
            <div
              className={`rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border'
              }`}
            >
              {message.sender === 'ai' ? (
                <AnimatedAiMessage
                  text={message.text}
                  isComplete={!message.isStreaming}
                  settings={settings}
                />
              ) : (
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 px-1">
              {formatTime(message.timestamp)}
            </p>
          </div>

          {message.sender === 'user' && (
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
              <User size={16} className="text-accent-foreground" />
            </div>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};
