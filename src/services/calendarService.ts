import type { CalendarEvent } from '@/src/lib/types';

const CALENDAR_STORAGE_KEY = 'kwararru_calendar_events';

const safeJsonParse = <T,>(jsonString: string | null, defaultValue: T): T => {
    if (!jsonString) return defaultValue;
    try {
        return JSON.parse(jsonString) as T;
    } catch (e) {
        console.warn('Could not parse stored JSON for calendar, falling back to default.', { content: jsonString, error: e });
        return defaultValue;
    }
};

// This service now interacts with localStorage to provide a persistent, user-manageable calendar.
export const getUpcomingEvents = async (): Promise<CalendarEvent[]> => {
  try {
      const storedEvents = localStorage.getItem(CALENDAR_STORAGE_KEY);
      const events = safeJsonParse<CalendarEvent[]>(storedEvents, []);
      return Promise.resolve(events.sort((a, b) => a.startTime - b.startTime));
  } catch (error) {
      console.error("Failed to retrieve calendar events from localStorage:", error);
      return Promise.resolve([]);
  }
};

export const addCalendarEvent = async (eventData: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> => {
    try {
        const events = await getUpcomingEvents();
        const newEvent: CalendarEvent = {
            ...eventData,
            id: `evt_${Date.now()}`
        };
        const updatedEvents = [...events, newEvent];
        localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(updatedEvents));
        return newEvent;
    } catch (error) {
        console.error("Failed to add calendar event to localStorage:", error);
        throw new Error("Could not save the event.");
    }
};

export const deleteCalendarEvent = async (eventId: string): Promise<void> => {
    try {
        const events = await getUpcomingEvents();
        const updatedEvents = events.filter(event => event.id !== eventId);
        localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(updatedEvents));
        return Promise.resolve();
    } catch (error) {
        console.error("Failed to delete calendar event from localStorage:", error);
        throw new Error("Could not delete the event.");
    }
};
