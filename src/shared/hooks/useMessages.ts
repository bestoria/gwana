import { useState, useCallback } from 'react';
import type { Message, AiMode } from '@/src/core/types';

export const useMessages = (initialMode: AiMode = 'chat') => {
  const [chatSessions, setChatSessions] = useState<Record<AiMode, Message[]>>(() => {
    const sessions: any = {};
    const modes: AiMode[] = ['chat', 'news', 'study', 'translate', 'debate', 'code', 'call', 'voice-journal'];
    modes.forEach(mode => {
      sessions[mode] = [];
    });
    return sessions;
  });

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>, mode?: AiMode) => {
    const newMessage: Message = {
      ...message,
      id: Date.now(),
      timestamp: new Date()
    };
    
    setChatSessions(prev => ({
      ...prev,
      [mode || initialMode]: [...(prev[mode || initialMode] || []), newMessage]
    }));
  }, [initialMode]);

  const appendMessageText = useCallback((id: number, textChunk: string, mode?: AiMode) => {
    setChatSessions(prev => ({
      ...prev,
      [mode || initialMode]: prev[mode || initialMode].map(msg =>
        msg.id === id ? { ...msg, text: msg.text + textChunk } : msg
      )
    }));
  }, [initialMode]);

  const updateMessageText = useCallback((id: number, newText: string, mode?: AiMode) => {
    setChatSessions(prev => ({
      ...prev,
      [mode || initialMode]: prev[mode || initialMode].map(msg =>
        msg.id === id ? { ...msg, text: newText } : msg
      )
    }));
  }, [initialMode]);

  const clearChat = useCallback((mode?: AiMode) => {
    setChatSessions(prev => ({
      ...prev,
      [mode || initialMode]: []
    }));
  }, [initialMode]);

  const exportChat = useCallback((mode?: AiMode) => {
    const messages = chatSessions[mode || initialMode];
    const chatText = messages
      .map(msg => `[${msg.sender}]: ${msg.text}`)
      .join('\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [chatSessions, initialMode]);

  const getMessages = useCallback((mode?: AiMode) => {
    return chatSessions[mode || initialMode] || [];
  }, [chatSessions, initialMode]);

  return {
    messages: chatSessions[initialMode] || [],
    chatSessions,
    addMessage,
    appendMessageText,
    updateMessageText,
    clearChat,
    exportChat,
    getMessages
  };
};
