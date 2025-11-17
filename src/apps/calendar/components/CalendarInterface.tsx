import React, { useState } from 'react';
import { CalendarView } from './CalendarView';
import { EventList } from './EventList';
import { EventFormModal } from './EventFormModal';
import type { CalendarEvent } from '@/src/lib/types';
import { Plus } from 'lucide-react';

interface CalendarInterfaceProps {
  events?: CalendarEvent[];
  onAddEvent?: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
  onDeleteEvent?: (eventId: string) => Promise<void>;
}

export const CalendarInterface: React.FC<CalendarInterfaceProps> = ({
  events = [],
  onAddEvent = async () => {},
  onDeleteEvent = async () => {}
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="flex h-full bg-background">
      <div className="flex-1 flex flex-col">
        <div className="border-b border-border bg-card p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Calendar</h2>
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
            Add Event
          </button>
        </div>

        <CalendarView
          events={events}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
      </div>

      <EventList
        events={events}
        selectedDate={selectedDate}
        onDeleteEvent={onDeleteEvent}
      />

      <EventFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onAddEvent={onAddEvent}
      />
    </div>
  );
};
