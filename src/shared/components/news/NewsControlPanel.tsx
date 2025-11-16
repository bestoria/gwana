import React, { useState } from 'react';
import { Settings, Filter, Globe, Newspaper, Radio, Mic, StopCircle, Volume2, Play, BookmarkCheck, TrendingUp, Search } from 'lucide-react';
import NeonButton from '../cyberpunk/NeonButton';

interface NewsControlPanelProps {
  isBroadcasting: boolean;
  onStartBroadcast: () => void;
  onStopBroadcast: () => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onSearchArticles: (query: string) => void;
}

const NEWS_CATEGORIES = [
  { id: 'tech', name: 'Technology', icon: '💻' },
  { id: 'business', name: 'Business', icon: '💼' },
  { id: 'world', name: 'World', icon: '🌍' },
  { id: 'general', name: 'Top Stories', icon: '📰' },
  { id: 'politics', name: 'Politics', icon: '🏛️' },
  { id: 'science', name: 'Science', icon: '🔬' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
  { id: 'health', name: 'Health', icon: '🏥' }
];

const NEWS_SOURCES = [
  { id: 'bbc', name: 'BBC News', credibility: 5 },
  { id: 'reuters', name: 'Reuters', credibility: 5 },
  { id: 'ap', name: 'Associated Press', credibility: 5 },
  { id: 'cnn', name: 'CNN', credibility: 4 },
  { id: 'techcrunch', name: 'TechCrunch', credibility: 4 },
  { id: 'verge', name: 'The Verge', credibility: 4 },
  { id: 'bloomberg', name: 'Bloomberg', credibility: 5 },
  { id: 'guardian', name: 'The Guardian', credibility: 4 }
];

const NewsControlPanel: React.FC<NewsControlPanelProps> = ({
  isBroadcasting,
  onStartBroadcast,
  onStopBroadcast,
  selectedCategory,
  onCategoryChange,
  onSearchArticles
}) => {
  const [selectedSources, setSelectedSources] = useState<string[]>(['bbc', 'reuters', 'ap']);
  const [searchQuery, setSearchQuery] = useState('');
  const [broadcastVoice, setBroadcastVoice] = useState<'male' | 'female'>('female');
  const [speakingSpeed, setSpeakingSpeed] = useState(1.0);
  const [showBookmarks, setShowBookmarks] = useState(false);

  const toggleSource = (sourceId: string) => {
    setSelectedSources(prev =>
      prev.includes(sourceId)
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearchArticles(searchQuery);
    }
  };

  return (
    <div className="space-y-4">
      {/* Broadcast Status & Controls */}
      <div className={`border p-3 rounded-md transition-all ${
        isBroadcasting
          ? 'bg-red-500/10 border-red-500 animate-pulse'
          : 'bg-black/40 border-[var(--border-color)]'
      }`}>
        <div className="text-xs text-cyan-300 font-mono mb-2 flex items-center gap-2">
          <Radio size={12} className={isBroadcasting ? 'animate-pulse' : ''} />
          AI NEWS ANCHOR
        </div>
        <div className="flex items-center justify-center mb-3">
          <div className={`w-3 h-3 rounded-full mr-2 ${
            isBroadcasting ? 'bg-red-500 animate-pulse' : 'bg-gray-600'
          }`} />
          <span className={`text-sm font-bold font-mono ${
            isBroadcasting ? 'text-red-400' : 'text-gray-500'
          }`}>
            {isBroadcasting ? 'ON AIR' : 'OFF AIR'}
          </span>
        </div>
        
        {isBroadcasting ? (
          <NeonButton
            onClick={onStopBroadcast}
            variant="secondary"
            fullWidth
            size="sm"
          >
            <StopCircle size={14} />
            Stop Broadcast
          </NeonButton>
        ) : (
          <NeonButton
            onClick={onStartBroadcast}
            variant="primary"
            fullWidth
          >
            <Play size={16} />
            Start Broadcast
          </NeonButton>
        )}

        {/* Broadcast Settings */}
        {!isBroadcasting && (
          <div className="mt-3 space-y-2">
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">VOICE</label>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => setBroadcastVoice('male')}
                  className={`px-2 py-1 rounded text-[10px] font-mono border transition-all ${
                    broadcastVoice === 'male'
                      ? 'bg-cyan-400/30 border-cyan-400 text-cyan-300'
                      : 'bg-black/30 border-gray-700 text-gray-400'
                  }`}
                >
                  MALE
                </button>
                <button
                  onClick={() => setBroadcastVoice('female')}
                  className={`px-2 py-1 rounded text-[10px] font-mono border transition-all ${
                    broadcastVoice === 'female'
                      ? 'bg-cyan-400/30 border-cyan-400 text-cyan-300'
                      : 'bg-black/30 border-gray-700 text-gray-400'
                  }`}
                >
                  FEMALE
                </button>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">
                SPEED: {speakingSpeed.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={speakingSpeed}
                onChange={(e) => setSpeakingSpeed(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="bg-black/40 border border-[var(--border-color)] p-3 rounded-md">
        <div className="text-xs text-cyan-300 font-mono mb-2 flex items-center gap-1">
          <Search size={12} />
          SEARCH NEWS
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search articles..."
            className="flex-1 bg-black/50 border border-gray-700 rounded px-2 py-1 text-xs text-cyan-300 font-mono placeholder-gray-600"
          />
          <button
            onClick={handleSearch}
            className="bg-cyan-400/20 border border-cyan-400 px-3 py-1 rounded text-xs text-cyan-300 hover:bg-cyan-400/30 transition-all"
          >
            GO
          </button>
        </div>
      </div>

      {/* Category Selection */}
      <div className="bg-black/40 border border-[var(--border-color)] p-3 rounded-md max-h-[300px] overflow-y-auto">
        <div className="text-xs text-cyan-300 font-mono mb-2 flex items-center gap-1">
          <Filter size={12} />
          CATEGORIES
        </div>
        <div className="space-y-1">
          {NEWS_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`w-full px-2 py-1.5 rounded text-xs text-left flex items-center gap-2 transition-all ${
                selectedCategory === cat.id
                  ? 'bg-cyan-400/30 border border-cyan-400 text-cyan-300'
                  : 'bg-black/30 border border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              <span className="text-base">{cat.icon}</span>
              <span className="font-mono">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* News Sources */}
      <div className="bg-black/40 border border-[var(--border-color)] p-3 rounded-md max-h-[250px] overflow-y-auto">
        <div className="text-xs text-cyan-300 font-mono mb-2 flex items-center gap-1">
          <Globe size={12} />
          NEWS SOURCES
        </div>
        <div className="space-y-1">
          {NEWS_SOURCES.map(source => (
            <button
              key={source.id}
              onClick={() => toggleSource(source.id)}
              className={`w-full px-2 py-1.5 rounded text-xs text-left flex items-center justify-between transition-all ${
                selectedSources.includes(source.id)
                  ? 'bg-green-400/20 border border-green-400 text-green-300'
                  : 'bg-black/30 border border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              <span className="font-mono">{source.name}</span>
              <div className="flex gap-0.5">
                {Array.from({ length: source.credibility }).map((_, i) => (
                  <div key={i} className="w-1 h-1 bg-yellow-400 rounded-full" />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bookmarks */}
      <div className="bg-black/40 border border-[var(--border-color)] p-3 rounded-md">
        <button
          onClick={() => setShowBookmarks(!showBookmarks)}
          className="w-full flex items-center justify-between text-xs text-cyan-300 font-mono hover:text-cyan-100 transition-colors"
        >
          <span className="flex items-center gap-1">
            <BookmarkCheck size={12} />
            SAVED ARTICLES
          </span>
          <span className="bg-cyan-400/20 px-2 py-0.5 rounded">12</span>
        </button>
      </div>

      {/* Reading Stats */}
      <div className="bg-black/40 border border-[var(--border-color)] p-3 rounded-md">
        <div className="text-xs text-cyan-300 font-mono mb-2 flex items-center gap-1">
          <TrendingUp size={12} />
          TODAY'S STATS
        </div>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-cyan-300">8</div>
            <div className="text-[10px] text-gray-400">ARTICLES READ</div>
          </div>
          <div>
            <div className="text-lg font-bold text-cyan-300">42</div>
            <div className="text-[10px] text-gray-400">MIN READING</div>
          </div>
        </div>
      </div>

      {/* AI Tools */}
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 p-3 rounded-md">
        <div className="text-xs text-purple-300 font-mono mb-2">AI NEWS TOOLS</div>
        <div className="space-y-1">
          <button className="w-full bg-black/50 border border-purple-500/30 hover:border-purple-400 p-2 rounded text-[10px] text-gray-300 hover:text-purple-300 transition-all text-left">
            📝 Summarize article
          </button>
          <button className="w-full bg-black/50 border border-purple-500/30 hover:border-purple-400 p-2 rounded text-[10px] text-gray-300 hover:text-purple-300 transition-all text-left">
            ✅ Fact-check claims
          </button>
          <button className="w-full bg-black/50 border border-purple-500/30 hover:border-purple-400 p-2 rounded text-[10px] text-gray-300 hover:text-purple-300 transition-all text-left">
            🔍 Compare sources
          </button>
          <button className="w-full bg-black/50 border border-purple-500/30 hover:border-purple-400 p-2 rounded text-[10px] text-gray-300 hover:text-purple-300 transition-all text-left">
            🎯 Analyze bias
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsControlPanel;
