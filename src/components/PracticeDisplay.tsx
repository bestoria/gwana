import React, { useState } from 'react';
import { ChevronDown, Target, Lightbulb } from 'lucide-react';
import type { PracticeSession } from '@/src/lib/types';

interface PracticeDisplayProps {
  practice: PracticeSession;
}

const DrillItem: React.FC<{ drill: PracticeSession['drills'][0] }> = ({ drill }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [answerVisible, setAnswerVisible] = useState(false);

    return (
        <div className="bg-black/40 rounded-md border border-gray-700 hover:border-cyan-500 transition-colors">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3 text-left"
            >
                <p className="font-semibold text-gray-100 text-base flex-1 pr-2">{drill.question}</p>
                <ChevronDown
                    size={20}
                    className={`text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            {isOpen && (
                <div className="px-3 pb-3 pt-1 border-t border-gray-700/50">
                    {!answerVisible ? (
                        <button
                            onClick={() => setAnswerVisible(true)}
                            className="w-full text-center py-2 px-3 bg-cyan-900/50 hover:bg-cyan-800/70 text-cyan-300 rounded-md transition-colors text-sm font-semibold"
                        >
                            Reveal Answer
                        </button>
                    ) : (
                        <div className="text-gray-300 text-sm whitespace-pre-wrap animate-fade-in">
                            <h5 className="text-cyan-400 font-bold mb-1 flex items-center gap-1.5"><Lightbulb size={14}/> Explanation</h5>
                            {drill.answer}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const PracticeDisplay: React.FC<PracticeDisplayProps> = ({ practice }) => {
    if (!practice) return null;

    return (
        <div className="mt-2 p-3 border border-cyan-500/50 bg-black/30 rounded-lg font-mono text-xs max-w-xl relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-400"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400"></div>

            <h3 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2" style={{ textShadow: '0 0 4px var(--accent-cyan)' }}>
                <Target size={16} /> PRACTICE DRILLS: {practice.topic.toUpperCase()}
            </h3>
            <div className="space-y-2">
                {practice.drills.map((drill, index) => (
                    <DrillItem key={index} drill={drill} />
                ))}
            </div>
        </div>
    );
};

export default PracticeDisplay;