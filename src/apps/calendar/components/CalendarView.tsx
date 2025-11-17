import React from 'react';
import { Calendar } from 'lucide-react';
import type { CalendarEvent } from '@/src/lib/types';

interface CalendarViewProps {
  events: CalendarEvent[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  selectedDate,
  onDateSelect
}) => {
  const daysInMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    1
  ).getDay();

  const monthName = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-foreground">{monthName}</h3>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}

          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
            const dayEvents = events.filter(e => {
              const eventDate = new Date(e.startTime);
              return eventDate.getDate() === day &&
                eventDate.getMonth() === selectedDate.getMonth() &&
                eventDate.getFullYear() === selectedDate.getFullYear();
            });

            const isToday = new Date().toDateString() === date.toDateString();
            const isSelected = selectedDate.toDateString() === date.toDateString();

            return (
              <button
                key={day}
                onClick={() => onDateSelect(date)}
                className={`aspect-square p-2 rounded-lg border transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : isToday
                    ? 'border-primary/50 bg-accent'
                    : 'border-border hover:bg-accent'
                }`}
              >
                <div className="text-sm font-medium text-foreground">{day}</div>
                {dayEvents.length > 0 && (
                  <div className="mt-1 flex gap-1 justify-center">
                    {dayEvents.slice(0, 3).map((_, i) => (
                      <div key={i} className="w-1 h-1 rounded-full bg-primary" />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
