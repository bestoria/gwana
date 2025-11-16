import React from 'react';
import { BookOpen, HelpCircle, Lightbulb } from 'lucide-react';
import type { StudyGuide } from '@/src/lib/types';

interface StudyGuideDisplayProps {
  studyGuide: StudyGuide;
}

const StudyGuideDisplay: React.FC<StudyGuideDisplayProps> = ({ studyGuide }) => {
    if (!studyGuide) return null;

    return (
        <div className="mt-2 p-3 border border-cyan-500/50 bg-black/30 rounded-lg font-mono text-xs max-w-xl relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-400"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400"></div>

            <h3 className="text-base font-semibold text-cyan-300 mb-2 flex items-center gap-2" style={{ textShadow: '0 0 4px var(--accent-cyan)' }}>
                <BookOpen size={18} /> STUDY GUIDE: {studyGuide.topic.toUpperCase()}
            </h3>
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">{studyGuide.summary}</p>

            <div className="mb-4">
                <h4 className="text-sm font-semibold text-cyan-400 mb-2 flex items-center gap-2"><Lightbulb size={16} /> Key Concepts</h4>
                <div className="space-y-2">
                    {studyGuide.keyConcepts.map((concept, index) => (
                        <div key={index} className="bg-black/40 p-3 rounded-md border border-gray-700">
                            <p className="font-bold text-gray-100 text-sm">{concept.term}</p>
                            <p className="text-gray-300 text-sm mt-1">{concept.definition}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="text-sm font-semibold text-cyan-400 mb-2 flex items-center gap-2"><HelpCircle size={16} /> Review Questions</h4>
                <ul className="list-decimal list-inside space-y-2 text-gray-300 pl-2 text-sm">
                    {studyGuide.reviewQuestions.map((question, index) => (
                        <li key={index}>{question}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default StudyGuideDisplay;