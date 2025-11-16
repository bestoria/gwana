import React from 'react';
import { CheckSquare, ChevronDown, TrendingUp } from 'lucide-react';
import type { LearningPathContent } from '@/src/lib/types';

interface LearningPathDisplayProps {
  learningPath: LearningPathContent;
}

const LearningPathDisplay: React.FC<LearningPathDisplayProps> = ({ learningPath }) => {
    if (!learningPath) return null;

    return (
        <div className="mt-2 p-3 border border-cyan-500/50 bg-black/30 rounded-lg font-mono text-xs max-w-xl relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-400"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400"></div>

            <h3 className="text-base font-semibold text-cyan-300 mb-2 flex items-center gap-2" style={{ textShadow: '0 0 4px var(--accent-cyan)' }}>
                <TrendingUp size={18} /> LEARNING PATH
            </h3>
            <p className="text-sm text-gray-200 mb-1"><strong>Goal:</strong> {learningPath.goal}</p>
            <p className="text-sm text-gray-400 mb-4"><strong>Duration:</strong> {learningPath.durationWeeks} Weeks</p>

            <div className="space-y-2">
                {learningPath.modules.map((module) => (
                    <details key={module.week} className="bg-black/40 rounded-md border border-gray-700 transition-all group open:border-cyan-500">
                        <summary className="w-full flex items-center justify-between p-3 text-left cursor-pointer">
                            <p className="font-semibold text-gray-100 text-sm flex-1 pr-2">
                                Week {module.week}: {module.title}
                            </p>
                            <ChevronDown
                                size={20}
                                className="text-gray-400 transition-transform group-open:rotate-180"
                            />
                        </summary>
                        <div className="px-3 pb-3 pt-1 border-t border-gray-700/50">
                            <ul className="list-none space-y-2 text-gray-300 text-sm">
                                {module.topics.map((topic, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <CheckSquare size={16} style={{ color: 'var(--accent-green)' }} className="mt-0.5 flex-shrink-0" />
                                <span>{topic}</span>
                            </li>
                                ))}
                            </ul>
                        </div>
                    </details>
                ))}
            </div>
        </div>
    );
};

export default LearningPathDisplay;
