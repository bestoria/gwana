import React, { useState } from 'react';
import { StudyMaterialView } from './StudyMaterialView';
import { StudyControlBar } from './StudyControlBar';
import { StudySessionPanel } from './StudySessionPanel';
import type { StudyHubItem, StudyProgress } from '@/src/lib/types';

interface StudyInterfaceProps {
  items?: StudyHubItem[];
  studyProgress?: StudyProgress;
}

export const StudyInterface: React.FC<StudyInterfaceProps> = ({
  items = [],
  studyProgress = { totalItems: 0, completedItems: 0, averageScore: 0 }
}) => {
  const [currentMode, setCurrentMode] = useState<'review' | 'learn' | 'test' | 'timed' | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StudyHubItem | null>(null);

  const handleStartSession = (mode: 'review' | 'learn' | 'test' | 'timed') => {
    setCurrentMode(mode);
    setIsSessionActive(true);
  };

  const handleStopSession = () => {
    setIsSessionActive(false);
    setCurrentMode(null);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <StudyControlBar
        currentMode={currentMode}
        isSessionActive={isSessionActive}
        onStartSession={handleStartSession}
        onStopSession={handleStopSession}
        studyProgress={studyProgress}
      />
      
      <div className="flex-1 overflow-hidden flex">
        <StudyMaterialView
          items={items}
          selectedItem={selectedItem}
          onItemSelect={setSelectedItem}
        />
        
        {isSessionActive && (
          <StudySessionPanel
            mode={currentMode}
            item={selectedItem}
          />
        )}
      </div>
    </div>
  );
};
