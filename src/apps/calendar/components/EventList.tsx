import React from 'react';
import { Clock, Trash2 } from 'lucide-react';
import type { CalendarEvent } from '@/src/lib/types';

interface EventListProps {
  events: CalendarEvent[];
  selectedDate: Date;
  onDeleteEvent: (eventId: string) => Promise<void>;
}

export const EventList: React.FC<EventListProps> = ({
  events,
  selectedDate,
  onDeleteEvent
}) => {
  const dayEvents = events.filter(e => {
    const eventDate = new Date(e.startTime);
    return eventDate.toDateString() === selectedDate.toDateString();
  }).sort((a, b) => a.startTime - b.startTime);

  return (
    <div className="w-80 border-l border-border bg-card overflow-y-auto">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">
          {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
        </p>
      </div>

      <div className="divide-y divide-border">
        {dayEvents.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>No events scheduled</p>
          </div>
        ) : (
          dayEvents.map((event) => (
            <div key={event.id} className="p-4 hover:bg-accent/50 transition-colors group">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground mb-1">{event.title}</h4>
                  {event.description && (
                    <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock size={12} />
                    <span>
                      {new Date(event.startTime).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                      {' - '}
                      {new Date(event.endTime).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onDeleteEvent(event.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
