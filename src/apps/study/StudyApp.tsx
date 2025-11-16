import React from 'react';
import StudyHubScreenNew from '@/src/shared/components/StudyHubScreenNew';

interface StudyAppProps {
  // Add props as needed
}

export const StudyApp: React.FC<StudyAppProps> = () => {
  return (
    <div className="h-full w-full overflow-auto">
      <StudyHubScreenNew />
    </div>
  );
};
