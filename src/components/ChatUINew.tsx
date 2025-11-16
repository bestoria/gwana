import React, { useState } from 'react';
import TwoPanelLayout from './layouts/TwoPanelLayout';
import EnhancedMessageList from './chat/EnhancedMessageList';
import ChatControlPanel from './chat/ChatControlPanel';
import { ChatUI } from './ChatUI';
import type { AiMode, Persona } from '@/src/lib/types';

interface ChatUINewProps {
  messages: any[];
  aiMode: AiMode;
  persona: Persona;
  onModeChange: (mode: AiMode) => void;
  onPersonaChange: (persona: Persona) => void;
  chatUIProps: any;
}

const ChatUINew: React.FC<ChatUINewProps> = ({
  messages,
  aiMode,
  persona,
  onModeChange,
  onPersonaChange,
  chatUIProps
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'starred' | 'media' | 'code'>('all');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (newFilter: 'all' | 'starred' | 'media' | 'code') => {
    setFilter(newFilter);
  };

  return (
    <TwoPanelLayout
      leftContent={
        <EnhancedMessageList
          messages={messages}
          onSearch={handleSearch}
          onFilter={handleFilter}
          onExport={() => console.log('Exporting conversation')}
        >
          <ChatUI {...chatUIProps} />
        </EnhancedMessageList>
      }
      rightControls={
        <ChatControlPanel
          aiMode={aiMode}
          persona={persona}
          onModeChange={onModeChange}
          onPersonaChange={onPersonaChange}
          onGenerateImage={() => console.log('Generate image')}
          onCreateDiagram={() => console.log('Create diagram')}
          onSummarize={() => console.log('Summarize')}
          onExport={() => console.log('Export')}
        />
      }
    />
  );
};

export default ChatUINew;
