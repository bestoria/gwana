import React from 'react';
import { BookOpen } from 'lucide-react';
import type { StudyHubItem } from '@/src/lib/types';

interface StudySessionPanelProps {
  mode: 'review' | 'learn' | 'test' | 'timed' | null;
  item: StudyHubItem | null;
}

export const StudySessionPanel: React.FC<StudySessionPanelProps> = ({
  mode,
  item
}) => {
  if (!item) {
    return (
      <div className="w-96 border-l border-border bg-card p-8 flex flex-col items-center justify-center">
        <BookOpen className="text-muted-foreground mb-4" size={48} />
        <p className="text-muted-foreground text-center">
          Select a study item to begin your session
        </p>
      </div>
    );
  }

  return (
    <div className="w-96 border-l border-border bg-card p-4 overflow-y-auto">
      <div className="mb-4">
        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
          {mode?.toUpperCase()} MODE
        </span>
        <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
      </div>
      
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-accent/50 border border-border">
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>Content for {mode} mode would appear here.</p>
        </div>
      </div>
    </div>
  );
};
