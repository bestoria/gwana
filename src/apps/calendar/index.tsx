import React from 'react';
import { CalendarInterface } from './components/CalendarInterface';
import type { CalendarEvent } from '@/src/lib/types';

interface CalendarAppProps {
  events?: CalendarEvent[];
  onAddEvent?: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
  onDeleteEvent?: (eventId: string) => Promise<void>;
}

export const CalendarApp: React.FC<CalendarAppProps> = (props) => {
  return (
    <div className="h-full w-full">
      <CalendarInterface {...props} />
    </div>
  );
};
