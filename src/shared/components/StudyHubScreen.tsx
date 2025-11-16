import React, { useMemo } from 'react';
import { ArrowLeft, BookOpen, Layers, Target, HelpCircle, Trash2, FileText, TrendingUp, Zap } from 'lucide-react';
import type { View, StudyHubItem, StudyProgress } from '@/src/lib/types';

interface StudyHubScreenProps {
  items: StudyHubItem[];
  onRemove: (id: string) => void;
  setView: (view: View) => void;
  studyProgress: StudyProgress;
}

const ItemIcon: React.FC<{ type: StudyHubItem['type'] }> = ({ type }) => {
    switch(type) {
        case 'guide': return <FileText size={24} style={{ color: 'var(--accent-cyan)' }} />;
        case 'cards': return <Layers size={24} style={{ color: 'var(--accent-magenta)' }} />;
        case 'practice': return <Target size={24} style={{ color: 'var(--accent-amber)' }} />;
        case 'quiz': return <HelpCircle size={24} style={{ color: 'var(--accent-green)' }} />;
        case 'learningPath': return <TrendingUp size={24} style={{ color: 'var(--accent-magenta)' }} />;
        default: return <BookOpen size={24} style={{ color: 'var(--text-secondary)' }} />;
    }
};

export const ProgressTracker: React.FC<{ progress: StudyProgress }> = ({ progress }) => {
    const studyStreak = useMemo(() => {
        if (!progress.studyDays || progress.studyDays.length === 0) return 0;

        const uniqueDays = [...new Set(progress.studyDays)].sort().reverse();
        
        const today = new Date();
        const todayUTC = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());

        const mostRecentDay = new Date(uniqueDays[0] + 'T00:00:00Z').getTime();

        const diffFromToday = (todayUTC - mostRecentDay) / (1000 * 60 * 60 * 24);

        if (diffFromToday > 1) {
            return 0; // Streak is broken if the last session was before yesterday.
        }

        let streak = 1;
        for (let i = 0; i < uniqueDays.length - 1; i++) {
            const currentDay = new Date(uniqueDays[i] + 'T00:00:00Z').getTime();
            const nextDay = new Date(uniqueDays[i + 1] + 'T00:00:00Z').getTime();
            
            const diffBetweenDays = (currentDay - nextDay) / (1000 * 60 * 60 * 24);
            
            if (diffBetweenDays === 1) {
                streak++;
            } else {
                break; // Streak is broken
            }
        }
        return streak;
    }, [progress.studyDays]);

    return (
        <div className="bg-black/30 border border-[var(--border-color)] p-4 rounded-md grid grid-cols-2 gap-4">
            <div className="text-center">
                <p className="text-3xl font-bold text-cyan-300 flex items-center justify-center gap-2">
                    <Zap size={24} className="text-yellow-400" /> {studyStreak}
                </p>
                <p className="text-sm text-gray-400">Day Streak</p>
            </div>
            <div className="text-center">
                <p className="text-3xl font-bold text-cyan-300">{progress.totalItems}</p>
                <p className="text-sm text-gray-400">Items Mastered</p>
            </div>
        </div>
    );
};


const StudyHubScreen: React.FC<StudyHubScreenProps> = ({ items, onRemove, setView, studyProgress }) => {
  const handleItemClick = (item: StudyHubItem) => {
    // TODO: Open item viewer
    console.log('Opening item:', item);
  };

  return (
    <div className="flex-1 bg-transparent text-white flex flex-col font-mono">
        <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                    <BookOpen size={64} className="mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-300">Your Study Hub is Empty</h2>
                    <p className="max-w-sm mt-2">Materials you create in Classroom mode will be automatically saved here for you to review later.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map(item => (
                        <div key={item.id} className="bg-black/30 border border-[var(--border-color)] p-4 rounded-md flex items-center gap-4 animate-fade-in group">
                            <ItemIcon type={item.type} />
                            <div className="flex-1 overflow-hidden">
                                <p className="font-semibold text-white capitalize">{item.type === 'learningPath' ? 'Learning Path' : item.type}</p>
                                <h3 className="text-lg text-cyan-300 group-hover:text-white transition-colors truncate">{item.type === 'learningPath' ? item.goal : item.topic}</h3>
                            </div>
                            <button
                                onClick={() => onRemove(item.id)}
                                className="p-2 text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                title="Remove from Hub"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};

export default StudyHubScreen;