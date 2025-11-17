import React from 'react';
import { Radio, Square } from 'lucide-react';

interface NewsControlPanelProps {
  isBroadcasting: boolean;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onToggleBroadcast: () => void;
}

const categories = [
  { id: 'all', label: 'All News' },
  { id: 'tech', label: 'Technology' },
  { id: 'politics', label: 'Politics' },
  { id: 'business', label: 'Business' },
  { id: 'health', label: 'Health' },
  { id: 'sports', label: 'Sports' }
];

export const NewsControlPanel: React.FC<NewsControlPanelProps> = ({
  isBroadcasting,
  selectedCategory,
  onCategoryChange,
  onToggleBroadcast
}) => {
  return (
    <div className="border-b border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent hover:bg-accent/80 text-accent-foreground'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <button
          onClick={onToggleBroadcast}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
            isBroadcasting
              ? 'bg-destructive text-destructive-foreground'
              : 'bg-primary text-primary-foreground'
          }`}
        >
          {isBroadcasting ? (
            <>
              <Square size={16} />
              Stop Broadcast
            </>
          ) : (
            <>
              <Radio size={16} />
              Start Broadcast
            </>
          )}
        </button>
      </div>
    </div>
  );
};
