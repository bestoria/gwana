import React from 'react';
import { Target, CheckCircle, ArrowUpCircle } from 'lucide-react';
import type { SynergyAnalysisContent } from '@/src/lib/types';

interface SynergyAnalysisDisplayProps {
  analysis: SynergyAnalysisContent;
}

const SynergyAnalysisDisplay: React.FC<SynergyAnalysisDisplayProps> = ({ analysis }) => {
    if (!analysis) return null;

    const getScoreColor = (score: number) => {
        if (score > 75) return 'bg-green-500';
        if (score > 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="mt-2 p-3 border border-purple-500/50 bg-black/30 rounded-lg font-mono text-xs max-w-xl relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-purple-400"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-purple-400"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-purple-400"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-purple-400"></div>
            
            <h3 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
                <Target size={16} /> RESUME SYNERGY ANALYSIS
            </h3>

            <div className="p-3 bg-black/40 rounded-md border border-gray-700 mb-4">
                <p className="font-bold text-gray-200 text-base">{analysis.jobTitle}</p>
                <p className="text-sm text-gray-400">{analysis.company}</p>
                <div className="mt-3">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-300">Synergy Score</span>
                        <span className={`font-bold text-lg ${getScoreColor(analysis.synergyScore).replace('bg-','text-')}`}>{analysis.synergyScore}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div 
                            className={`${getScoreColor(analysis.synergyScore)} h-2.5 rounded-full transition-all duration-500`} 
                            style={{ width: `${analysis.synergyScore}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2"><CheckCircle size={16} /> Strengths</h4>
                    <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm">
                        {analysis.strengths.map((item, index) => (
                            <li key={`str-${index}`}>{item}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2"><ArrowUpCircle size={16} /> Opportunities</h4>
                     <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm">
                        {analysis.opportunities.map((item, index) => (
                            <li key={`opp-${index}`}>{item}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SynergyAnalysisDisplay;