import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Settings, BookOpen, Brain, Zap, Target, Clock, Filter, Save, Share2, Printer } from 'lucide-react';
import NeonButton from '../cyberpunk/NeonButton';

interface StudyControlPanelProps {
  currentMode: 'review' | 'learn' | 'test' | 'timed' | null;
  isSessionActive: boolean;
  onStartSession: (mode: 'review' | 'learn' | 'test' | 'timed') => void;
  onPauseSession: () => void;
  onStopSession: () => void;
  sessionStats?: {
    timeElapsed: number;
    itemsCompleted: number;
    accuracy: number;
  };
}

const StudyControlPanel: React.FC<StudyControlPanelProps> = ({
  currentMode,
  isSessionActive,
  onStartSession,
  onPauseSession,
  onStopSession,
  sessionStats
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [itemsPerSession, setItemsPerSession] = useState(20);
  const [randomizeOrder, setRandomizeOrder] = useState(true);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Session Timer & Stats */}
      {isSessionActive && sessionStats && (
        <div className="bg-black/60 border border-cyan-400 p-4 rounded-md animate-pulse-glow">
          <div className="text-xs text-cyan-300 font-mono mb-2 flex items-center gap-1">
            <Clock size={12} />
            SESSION ACTIVE
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-bold text-cyan-300">{formatTime(sessionStats.timeElapsed)}</div>
              <div className="text-[10px] text-gray-400">TIME</div>
            </div>
            <div>
              <div className="text-lg font-bold text-cyan-300">{sessionStats.itemsCompleted}</div>
              <div className="text-[10px] text-gray-400">COMPLETED</div>
            </div>
            <div>
              <div className="text-lg font-bold text-cyan-300">{sessionStats.accuracy}%</div>
              <div className="text-[10px] text-gray-400">ACCURACY</div>
            </div>
          </div>
        </div>
      )}

      {/* Study Mode Selection */}
      <div className="bg-black/40 border border-[var(--border-color)] p-3 rounded-md">
        <div className="text-xs text-cyan-300 font-mono mb-2 flex items-center gap-1">
          <Brain size={12} />
          STUDY MODE
        </div>
        <div className="grid grid-cols-2 gap-2">
          <NeonButton
            onClick={() => !isSessionActive && onStartSession('review')}
            variant="outline"
            size="sm"
            className={`text-xs ${currentMode === 'review' ? 'bg-cyan-400/20' : ''}`}
            disabled={isSessionActive}
          >
            <RotateCcw size={14} />
            Review
          </NeonButton>
          <NeonButton
            onClick={() => !isSessionActive && onStartSession('learn')}
            variant="outline"
            size="sm"
            className={`text-xs ${currentMode === 'learn' ? 'bg-cyan-400/20' : ''}`}
            disabled={isSessionActive}
          >
            <BookOpen size={14} />
            Learn New
          </NeonButton>
          <NeonButton
            onClick={() => !isSessionActive && onStartSession('test')}
            variant="outline"
            size="sm"
            className={`text-xs ${currentMode === 'test' ? 'bg-cyan-400/20' : ''}`}
            disabled={isSessionActive}
          >
            <Target size={14} />
            Test Mode
          </NeonButton>
          <NeonButton
            onClick={() => !isSessionActive && onStartSession('timed')}
            variant="outline"
            size="sm"
            className={`text-xs ${currentMode === 'timed' ? 'bg-cyan-400/20' : ''}`}
            disabled={isSessionActive}
          >
            <Zap size={14} />
            Timed
          </NeonButton>
        </div>
      </div>

      {/* Session Controls */}
      <div className="bg-black/40 border border-[var(--border-color)] p-3 rounded-md">
        <div className="text-xs text-cyan-300 font-mono mb-2 flex items-center gap-1">
          <Settings size={12} />
          SESSION SETTINGS
        </div>
        <div className="space-y-3">
          {/* Difficulty */}
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">DIFFICULTY</label>
            <div className="grid grid-cols-3 gap-1">
              {(['easy', 'medium', 'hard'] as const).map(diff => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  disabled={isSessionActive}
                  className={`px-2 py-1 rounded text-[10px] font-mono border transition-all ${
                    selectedDifficulty === diff
                      ? 'bg-cyan-400/30 border-cyan-400 text-cyan-300'
                      : 'bg-black/30 border-gray-700 text-gray-400 hover:border-gray-500'
                  } ${isSessionActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {diff.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Items per session */}
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">ITEMS PER SESSION</label>
            <input
              type="number"
              value={itemsPerSession}
              onChange={(e) => setItemsPerSession(parseInt(e.target.value) || 20)}
              disabled={isSessionActive}
              min={5}
              max={100}
              className="w-full bg-black/50 border border-gray-700 rounded px-2 py-1 text-xs text-cyan-300 font-mono disabled:opacity-50"
            />
          </div>

          {/* Randomize toggle */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400">RANDOMIZE ORDER</span>
            <button
              onClick={() => setRandomizeOrder(!randomizeOrder)}
              disabled={isSessionActive}
              className={`w-10 h-5 rounded-full border transition-all ${
                randomizeOrder
                  ? 'bg-cyan-400/30 border-cyan-400'
                  : 'bg-black/30 border-gray-700'
              } ${isSessionActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className={`w-3 h-3 rounded-full bg-cyan-300 transition-transform ${
                randomizeOrder ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-black/40 border border-[var(--border-color)] p-3 rounded-md space-y-2">
        {isSessionActive ? (
          <>
            <NeonButton
              onClick={onPauseSession}
              variant="primary"
              fullWidth
              size="sm"
            >
              <Pause size={14} />
              Pause Session
            </NeonButton>
            <NeonButton
              onClick={onStopSession}
              variant="secondary"
              fullWidth
              size="sm"
            >
              Stop & Save
            </NeonButton>
          </>
        ) : (
          <NeonButton
            onClick={() => currentMode && onStartSession(currentMode)}
            variant="primary"
            fullWidth
            disabled={!currentMode}
          >
            <Play size={16} />
            Start Session
          </NeonButton>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-black/40 border border-[var(--border-color)] p-3 rounded-md">
        <div className="text-xs text-cyan-300 font-mono mb-2">QUICK ACTIONS</div>
        <div className="grid grid-cols-2 gap-2">
          <button className="bg-black/50 border border-gray-700 hover:border-cyan-400 p-2 rounded text-[10px] text-gray-400 hover:text-cyan-300 transition-all flex flex-col items-center gap-1">
            <Save size={14} />
            Save
          </button>
          <button className="bg-black/50 border border-gray-700 hover:border-cyan-400 p-2 rounded text-[10px] text-gray-400 hover:text-cyan-300 transition-all flex flex-col items-center gap-1">
            <Share2 size={14} />
            Share
          </button>
          <button className="bg-black/50 border border-gray-700 hover:border-cyan-400 p-2 rounded text-[10px] text-gray-400 hover:text-cyan-300 transition-all flex flex-col items-center gap-1">
            <Printer size={14} />
            Print
          </button>
          <button className="bg-black/50 border border-gray-700 hover:border-cyan-400 p-2 rounded text-[10px] text-gray-400 hover:text-cyan-300 transition-all flex flex-col items-center gap-1">
            <Filter size={14} />
            Filter
          </button>
        </div>
      </div>

      {/* AI Assistant */}
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 p-3 rounded-md">
        <div className="text-xs text-purple-300 font-mono mb-2 flex items-center gap-1">
          <Brain size={12} />
          AI STUDY ASSISTANT
        </div>
        <div className="space-y-1">
          <button className="w-full bg-black/50 border border-purple-500/30 hover:border-purple-400 p-2 rounded text-[10px] text-gray-300 hover:text-purple-300 transition-all text-left">
            💡 Explain this concept
          </button>
          <button className="w-full bg-black/50 border border-purple-500/30 hover:border-purple-400 p-2 rounded text-[10px] text-gray-300 hover:text-purple-300 transition-all text-left">
            📝 Generate similar problems
          </button>
          <button className="w-full bg-black/50 border border-purple-500/30 hover:border-purple-400 p-2 rounded text-[10px] text-gray-300 hover:text-purple-300 transition-all text-left">
            🧠 Create mnemonic device
          </button>
          <button className="w-full bg-black/50 border border-purple-500/30 hover:border-purple-400 p-2 rounded text-[10px] text-gray-300 hover:text-purple-300 transition-all text-left">
            🔍 Suggest related topics
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudyControlPanel;
