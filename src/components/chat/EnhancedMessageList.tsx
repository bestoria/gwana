import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, Calendar, Star, Image, Code, FileText, Pin, Download } from 'lucide-react';
import type { Message } from '@/src/lib/types';

interface EnhancedMessageListProps {
  messages: Message[];
  children: React.ReactNode;
  onSearch: (query: string) => void;
  onFilter: (filter: 'all' | 'starred' | 'media' | 'code') => void;
  onExport: () => void;
}

const EnhancedMessageList: React.FC<EnhancedMessageListProps> = ({
  messages,
  children,
  onSearch,
  onFilter,
  onExport
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'starred' | 'media' | 'code'>('all');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showSearchBar && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearchBar]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleFilterChange = (filter: 'all' | 'starred' | 'media' | 'code') => {
    setActiveFilter(filter);
    onFilter(filter);
  };

  const starredCount = messages.filter(m => m.starred).length;
  const mediaCount = messages.filter(m => m.imageUrls && m.imageUrls.length > 0).length;
  const codeCount = messages.filter(m => m.text.includes('```')).length;

  return (
    <div className="flex flex-col h-full">
      {/* Enhanced Toolbar */}
      <div className="flex-shrink-0 bg-black/40 border-b border-[var(--border-color)] p-2">
        <div className="flex items-center gap-2">
          {/* Search Toggle */}
          <button
            onClick={() => setShowSearchBar(!showSearchBar)}
            className={`p-2 rounded transition-all ${
              showSearchBar
                ? 'bg-cyan-400/30 text-cyan-300 border border-cyan-400'
                : 'text-gray-400 hover:text-cyan-300 hover:bg-cyan-400/10'
            }`}
            title="Search messages"
          >
            <Search size={16} />
          </button>

          {/* Filter Buttons */}
          <div className="flex gap-1 flex-1">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                activeFilter === 'all'
                  ? 'bg-cyan-400/30 text-cyan-300 border border-cyan-400'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
              }`}
            >
              ALL ({messages.length})
            </button>
            <button
              onClick={() => handleFilterChange('starred')}
              className={`px-3 py-1 rounded text-xs font-mono transition-all flex items-center gap-1 ${
                activeFilter === 'starred'
                  ? 'bg-amber-400/30 text-amber-300 border border-amber-400'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Star size={12} />
              {starredCount}
            </button>
            <button
              onClick={() => handleFilterChange('media')}
              className={`px-3 py-1 rounded text-xs font-mono transition-all flex items-center gap-1 ${
                activeFilter === 'media'
                  ? 'bg-purple-400/30 text-purple-300 border border-purple-400'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Image size={12} />
              {mediaCount}
            </button>
            <button
              onClick={() => handleFilterChange('code')}
              className={`px-3 py-1 rounded text-xs font-mono transition-all flex items-center gap-1 ${
                activeFilter === 'code'
                  ? 'bg-green-400/30 text-green-300 border border-green-400'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Code size={12} />
              {codeCount}
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={onExport}
            className="p-2 rounded text-gray-400 hover:text-cyan-300 hover:bg-cyan-400/10 transition-all"
            title="Export conversation"
          >
            <Download size={16} />
          </button>
        </div>

        {/* Search Bar */}
        {showSearchBar && (
          <div className="mt-2">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search messages..."
              className="w-full bg-black/50 border border-gray-700 focus:border-cyan-400 rounded px-3 py-2 text-sm text-cyan-300 font-mono placeholder-gray-600 outline-none transition-all"
            />
          </div>
        )}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default EnhancedMessageList;
