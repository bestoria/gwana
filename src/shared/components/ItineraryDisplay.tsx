import React from 'react';
import { Plane, Utensils, Bed, MapPin } from 'lucide-react';
import type { ItineraryContent, ItineraryActivity } from '@/src/lib/types';

interface ItineraryDisplayProps {
  itinerary: ItineraryContent;
}

const ActivityIcon: React.FC<{ type: ItineraryActivity['type'] }> = ({ type }) => {
    switch (type) {
        case 'travel': return <Plane size={16} style={{ color: 'var(--accent-cyan)' }} />;
        case 'dining': return <Utensils size={16} style={{ color: 'var(--accent-amber)' }} />;
        case 'lodging': return <Bed size={16} style={{ color: 'var(--accent-magenta)' }} />;
        case 'activity': return <MapPin size={16} style={{ color: 'var(--accent-green)' }} />;
        default: return <MapPin size={16} style={{ color: 'var(--text-secondary)' }} />;
    }
};

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary }) => {
    if (!itinerary) return null;

    return (
        <div className="mt-2 p-3 border border-cyan-500/50 bg-black/30 rounded-lg font-mono text-xs max-w-xl relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-400"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400"></div>

            <h3 className="text-base font-semibold text-cyan-300 mb-3" style={{ textShadow: '0 0 4px var(--accent-cyan)' }}>
                {itinerary.title.toUpperCase()}
            </h3>

            <div className="space-y-4">
                {itinerary.days.map((day) => (
                    <div key={day.day} className="bg-black/40 p-3 rounded-md border border-gray-700">
                        <h4 className="text-sm font-bold text-cyan-400 mb-2 border-b border-cyan-500/20 pb-1">
                            Day {day.day} <span className="text-xs text-gray-400 font-normal ml-2">{day.date}</span>
                        </h4>
                        <ul className="space-y-2">
                            {day.activities.map((activity, index) => (
                                <li key={index} className="flex gap-3 items-start">
                                    <div className="mt-0.5"><ActivityIcon type={activity.type} /></div>
                                    <div className="flex-1">
                                        <p className="text-gray-200 text-sm">
                                            <span className="font-semibold">{activity.time}: </span>
                                            {activity.description}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ItineraryDisplay;