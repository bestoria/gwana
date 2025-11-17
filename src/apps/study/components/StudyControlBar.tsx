import React from 'react';
import { BookOpen, Play, Square, Trophy } from 'lucide-react';
import type { StudyProgress } from '@/src/lib/types';

interface StudyControlBarProps {
  currentMode: 'review' | 'learn' | 'test' | 'timed' | null;
  isSessionActive: boolean;
  onStartSession: (mode: 'review' | 'learn' | 'test' | 'timed') => void;
  onStopSession: () => void;
  studyProgress: StudyProgress;
}

export const StudyControlBar: React.FC<StudyControlBarProps> = ({
  currentMode,
  isSessionActive,
  onStartSession,
  onStopSession,
  studyProgress
}) => {
  const modes = [
    { id: 'learn' as const, label: 'Learn', icon: BookOpen },
    { id: 'review' as const, label: 'Review', icon: BookOpen },
    { id: 'test' as const, label: 'Test', icon: Trophy },
    { id: 'timed' as const, label: 'Timed', icon: Trophy }
  ];

  return (
    <div className="border-b border-border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Study Hub</h2>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{studyProgress.completedItems} / {studyProgress.totalItems} completed</span>
          <span>Avg: {studyProgress.averageScore}%</span>
        </div>
      </div>

      <div className="flex gap-2">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => isSessionActive ? onStopSession() : onStartSession(mode.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              currentMode === mode.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-accent hover:bg-accent/80 text-accent-foreground'
            }`}
          >
            {currentMode === mode.id && isSessionActive ? (
              <Square size={16} />
            ) : (
              <Play size={16} />
            )}
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  );
};
