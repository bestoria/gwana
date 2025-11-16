import React from 'react';
import { Calendar, X } from 'lucide-react';
import type { ProactiveCalendarSuggestionContent } from '@/src/lib/types';

interface ProactiveCalendarSuggestionProps {
    suggestion: ProactiveCalendarSuggestionContent;
    onAccept: () => void;
    onDismiss: () => void;
}

const ProactiveCalendarSuggestion: React.FC<ProactiveCalendarSuggestionProps> = ({ suggestion, onAccept, onDismiss }) => {
    return (
        <div className="mb-2 px-3 py-2 bg-yellow-900/50 border border-yellow-500/50 rounded-lg flex items-center justify-between gap-4 animate-fade-in" role="alert">
            <div className="flex items-center gap-3">
                <Calendar size={24} className="text-yellow-300 flex-shrink-0"/>
                <div>
                    <p className="text-sm text-gray-200 font-semibold">{suggestion.suggestionText}</p>
                    <p className="text-xs text-yellow-400">Upcoming: {suggestion.event.title}</p>
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={onAccept} className="px-3 py-1 text-sm bg-yellow-600 hover:bg-yellow-700 rounded-md font-semibold text-white">Yes</button>
                <button onClick={onDismiss} className="p-1 hover:bg-yellow-500/20 rounded-full text-gray-300"><X size={16}/></button>
            </div>
        </div>
    );
};

export default ProactiveCalendarSuggestion;
