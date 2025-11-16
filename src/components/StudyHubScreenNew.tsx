import React, { useState } from 'react';
import TwoPanelLayout from './layouts/TwoPanelLayout';
import StudyDashboard from './study/StudyDashboard';
import StudyControlPanel from './study/StudyControlPanel';
import type { StudyHubItem, StudyProgress } from '@/src/lib/types';

interface StudyHubScreenNewProps {
  items: StudyHubItem[];
  studyProgress: StudyProgress;
}

const StudyHubScreenNew: React.FC<StudyHubScreenNewProps> = ({ items, studyProgress }) => {
  const [currentMode, setCurrentMode] = useState<'review' | 'learn' | 'test' | 'timed' | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionStats, setSessionStats] = useState({ timeElapsed: 0, itemsCompleted: 0, accuracy: 0 });

  const handleItemClick = (item: StudyHubItem) => {
    console.log('Opening item:', item);
  };

  const handleStartSession = (mode: 'review' | 'learn' | 'test' | 'timed') => {
    setCurrentMode(mode);
    setIsSessionActive(true);
  };

  const handlePauseSession = () => {
    setIsSessionActive(false);
  };

  const handleStopSession = () => {
    setIsSessionActive(false);
    setCurrentMode(null);
  };

  return (
    <TwoPanelLayout
      leftContent={
        <StudyDashboard
          items={items}
          studyProgress={studyProgress}
          onItemClick={handleItemClick}
        />
      }
      rightControls={
        <StudyControlPanel
          currentMode={currentMode}
          isSessionActive={isSessionActive}
          onStartSession={handleStartSession}
          onPauseSession={handlePauseSession}
          onStopSession={handleStopSession}
          sessionStats={isSessionActive ? sessionStats : undefined}
        />
      }
    />
  );
};

export default StudyHubScreenNew;
