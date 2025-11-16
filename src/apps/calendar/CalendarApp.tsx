import React from 'react';
import CalendarScreen from '@/src/components/CalendarScreen';

interface CalendarAppProps {
  // Add props as needed
}

export const CalendarApp: React.FC<CalendarAppProps> = () => {
  return (
    <div className="h-full w-full overflow-auto">
      <CalendarScreen />
    </div>
  );
};
