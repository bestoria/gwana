import React, { useState, useMemo } from 'react';
import { ArrowLeft, Calendar, Plus, X, Trash2, Brain } from 'lucide-react';
import type { View, CalendarEvent } from '@/src/lib/types';
import AICalendarIntegration from '@/src/shared/components/AICalendarIntegration';

interface CalendarScreenProps {
  events: CalendarEvent[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
  onDeleteEvent: (eventId: string) => Promise<void>;
  setView: (view: View) => void;
  setIsFormOpen: (isOpen: boolean) => void;
}

export const EventFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAddEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
}> = ({ isOpen, onClose, onAddEvent }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!title || !startTime || !endTime) {
            setError('Title, start time, and end time are required.');
            return;
        }
        const start = new Date(startTime).getTime();
        const end = new Date(endTime).getTime();
        if (end <= start) {
            setError('End time must be after start time.');
            return;
        }
        setError('');
        await onAddEvent({ title, description, startTime: start, endTime: end });
        onClose();
        // Clear form for next time
        setTitle('');
        setDescription('');
        setStartTime('');
        setEndTime('');
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-black/50 border border-[var(--border-color)] rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-cyan-300 mb-4">Add New Event</h2>
                <div className="space-y-4">
                    <input type="text" placeholder="Event Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-black/50 border border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500"/>
                    <textarea placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-black/50 border border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500"/>
                    <div>
                        <label className="text-sm text-gray-400">Start Time</label>
                        <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-black/50 border border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500"/>
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">End Time</label>
                        <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-black/50 border border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500"/>
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-md hover:bg-gray-600/50">Cancel</button>
                    <button onClick={handleSubmit} className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700">Add Event</button>
                </div>
            </div>
        </div>
    );
};

const CalendarScreen: React.FC<CalendarScreenProps> = ({ events, onDeleteEvent, onAddEvent, setView, setIsFormOpen }) => {
    const [showAIAssistant, setShowAIAssistant] = useState(false);

    const groupedEvents = useMemo(() => {
        const groups: Record<string, CalendarEvent[]> = {};
        const sortedEvents = [...events].sort((a, b) => a.startTime - b.startTime);
        sortedEvents.forEach(event => {
            const date = new Date(event.startTime).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(event);
        });
        return groups;
    }, [events]);

    const timeFormatter = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <div className="flex-1 bg-transparent text-white flex flex-col font-mono">
        <div className="flex-1 overflow-y-auto p-4">
            {events.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                    <Calendar size={64} className="mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-300">Your Calendar is Empty</h2>
                    <p className="max-w-sm mt-2">Click "Add Event" to create a new entry, or ask the AI to schedule something for you in chat.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedEvents).map(([date, dayEvents]) => (
                        <div key={date}>
                            <h2 className="text-lg font-bold text-cyan-300 mb-2 border-b border-cyan-500/20 pb-1">{date}</h2>
                            <div className="space-y-2">
                                {(dayEvents as CalendarEvent[]).map(event => (
                                    <div key={event.id} className="bg-black/30 border border-gray-700 p-3 rounded-md flex items-start gap-4 group">
                                        <div className="text-center w-20 flex-shrink-0">
                                            <p className="text-sm font-semibold text-white">{timeFormatter.format(new Date(event.startTime))}</p>
                                            <p className="text-xs text-gray-400">to</p>
                                            <p className="text-xs text-gray-400">{timeFormatter.format(new Date(event.endTime))}</p>
                                        </div>
                                        <div className="flex-1 border-l border-gray-600 pl-4">
                                            <h3 className="font-semibold text-white">{event.title}</h3>
                                            {event.description && <p className="text-sm text-gray-400 mt-1">{event.description}</p>}
                                        </div>
                                        <button onClick={() => onDeleteEvent(event.id)} className="p-2 text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};

export default CalendarScreen;