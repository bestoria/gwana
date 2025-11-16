import React, { useMemo } from 'react';
import { BookOpen, Layers, Target, HelpCircle, TrendingUp, FileText, Calendar, Award, Clock, Flame } from 'lucide-react';
import type { StudyHubItem, StudyProgress } from '@/src/lib/types';

interface StudyDashboardProps {
  items: StudyHubItem[];
  studyProgress: StudyProgress;
  onItemClick: (item: StudyHubItem) => void;
}

const ItemIcon: React.FC<{ type: StudyHubItem['type'] }> = ({ type }) => {
  switch(type) {
    case 'guide': return <FileText size={20} style={{ color: 'var(--accent-cyan)' }} />;
    case 'cards': return <Layers size={20} style={{ color: 'var(--accent-magenta)' }} />;
    case 'practice': return <Target size={20} style={{ color: 'var(--accent-amber)' }} />;
    case 'quiz': return <HelpCircle size={20} style={{ color: 'var(--accent-green)' }} />;
    case 'learningPath': return <TrendingUp size={20} style={{ color: 'var(--accent-magenta)' }} />;
    default: return <BookOpen size={20} style={{ color: 'var(--text-secondary)' }} />;
  }
};

const StudyDashboard: React.FC<StudyDashboardProps> = ({ items, studyProgress, onItemClick }) => {
  const studyStreak = useMemo(() => {
    if (!studyProgress.studyDays || studyProgress.studyDays.length === 0) return 0;
    const uniqueDays = [...new Set(studyProgress.studyDays)].sort().reverse();
    const today = new Date();
    const todayUTC = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
    const mostRecentDay = new Date(uniqueDays[0] + 'T00:00:00Z').getTime();
    const diffFromToday = (todayUTC - mostRecentDay) / (1000 * 60 * 60 * 24);
    if (diffFromToday > 1) return 0;
    let streak = 1;
    for (let i = 0; i < uniqueDays.length - 1; i++) {
      const currentDay = new Date(uniqueDays[i] + 'T00:00:00Z').getTime();
      const nextDay = new Date(uniqueDays[i + 1] + 'T00:00:00Z').getTime();
      const diffBetweenDays = (currentDay - nextDay) / (1000 * 60 * 60 * 24);
      if (diffBetweenDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [studyProgress.studyDays]);

  // Calculate today's study time (mock for now)
  const todayMinutes = 45; // TODO: Implement real tracking

  return (
    <div className="space-y-4 p-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-black/40 border border-[var(--border-color)] p-4 rounded-md text-center">
          <div className="flex items-center justify-center gap-2 text-3xl font-bold text-cyan-300 mb-1">
            <Flame size={28} className="text-orange-400 animate-pulse" />
            {studyStreak}
          </div>
          <div className="text-xs text-gray-400 font-mono">DAY STREAK</div>
        </div>
        <div className="bg-black/40 border border-[var(--border-color)] p-4 rounded-md text-center">
          <div className="text-3xl font-bold text-cyan-300 mb-1">{studyProgress.totalItems || 0}</div>
          <div className="text-xs text-gray-400 font-mono">ITEMS CREATED</div>
        </div>
        <div className="bg-black/40 border border-[var(--border-color)] p-4 rounded-md text-center">
          <div className="flex items-center justify-center gap-2 text-3xl font-bold text-cyan-300 mb-1">
            <Clock size={24} className="text-green-400" />
            {todayMinutes}
          </div>
          <div className="text-xs text-gray-400 font-mono">MIN TODAY</div>
        </div>
      </div>

      {/* Weekly Heatmap */}
      <div className="bg-black/40 border border-[var(--border-color)] p-4 rounded-md">
        <div className="flex items-center gap-2 mb-3 text-sm font-mono text-cyan-300">
          <Calendar size={16} />
          <span>STUDY ACTIVITY</span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const dateStr = date.toISOString().split('T')[0];
            const hasActivity = studyProgress.studyDays?.includes(dateStr);
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div 
                  className={`w-8 h-8 rounded border transition-all ${
                    hasActivity 
                      ? 'bg-cyan-400/40 border-cyan-400 shadow-[0_0_8px_rgba(0,255,255,0.5)]' 
                      : 'bg-black/40 border-gray-700'
                  }`}
                  title={dateStr}
                />
                <div className="text-[10px] text-gray-500 font-mono">
                  {['S','M','T','W','T','F','S'][date.getDay()]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Materials List */}
      <div className="bg-black/40 border border-[var(--border-color)] p-4 rounded-md">
        <div className="flex items-center gap-2 mb-3 text-sm font-mono text-cyan-300">
          <BookOpen size={16} />
          <span>STUDY MATERIALS</span>
        </div>
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BookOpen size={48} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No study materials yet</p>
            <p className="text-xs mt-1">Create content in Classroom mode</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {items.map(item => (
              <div
                key={item.id}
                onClick={() => onItemClick(item)}
                className="bg-black/30 border border-[var(--border-color)] p-3 rounded flex items-center gap-3 hover:bg-cyan-400/10 hover:border-cyan-400 transition-all cursor-pointer group"
              >
                <ItemIcon type={item.type} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-200 truncate group-hover:text-cyan-300">
                    {item.title}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : ''}
                  </div>
                </div>
                <div className="text-xs px-2 py-1 rounded bg-cyan-400/20 text-cyan-300 font-mono">
                  {item.type.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Achievements Preview */}
      <div className="bg-black/40 border border-[var(--border-color)] p-4 rounded-md">
        <div className="flex items-center gap-2 mb-3 text-sm font-mono text-cyan-300">
          <Award size={16} />
          <span>RECENT ACHIEVEMENTS</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {studyStreak >= 7 && (
            <div className="bg-amber-500/20 border border-amber-500 p-2 rounded text-center">
              <div className="text-2xl mb-1">🔥</div>
              <div className="text-[10px] text-amber-300 font-mono">7-DAY STREAK</div>
            </div>
          )}
          {studyProgress.totalItems >= 10 && (
            <div className="bg-purple-500/20 border border-purple-500 p-2 rounded text-center">
              <div className="text-2xl mb-1">📚</div>
              <div className="text-[10px] text-purple-300 font-mono">10 MATERIALS</div>
            </div>
          )}
          {studyProgress.totalItems >= 25 && (
            <div className="bg-green-500/20 border border-green-500 p-2 rounded text-center">
              <div className="text-2xl mb-1">🎓</div>
              <div className="text-[10px] text-green-300 font-mono">SCHOLAR</div>
            </div>
          )}
        </div>
        {studyStreak < 7 && studyProgress.totalItems < 10 && (
          <div className="text-center py-4 text-gray-500 text-xs">
            Keep studying to unlock achievements!
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyDashboard;
