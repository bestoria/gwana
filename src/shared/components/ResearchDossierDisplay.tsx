import React from 'react';
import { BookText, ListChecks, ShieldAlert, ExternalLink, Search } from 'lucide-react';
import type { ResearchDossierContent } from '@/src/lib/types';

interface ResearchDossierDisplayProps {
  dossier: ResearchDossierContent;
}

const ResearchDossierDisplay: React.FC<ResearchDossierDisplayProps> = ({ dossier }) => {
    if (!dossier) return null;

    return (
        <div className="mt-2 p-3 border border-cyan-500/50 bg-black/30 rounded-lg font-mono text-xs max-w-xl relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-400"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400"></div>

            <h3 className="text-base font-semibold text-cyan-300 mb-3 flex items-center gap-2" style={{ textShadow: '0 0 4px var(--accent-cyan)' }}>
                <BookText size={18} /> RESEARCH DOSSIER
            </h3>
            
            <div className="mb-4">
                <h4 className="text-sm font-semibold text-cyan-400 mb-2">Executive Summary</h4>
                <p className="text-sm text-gray-300 leading-relaxed">{dossier.summary}</p>
            </div>

            <div className="mb-4">
                <h4 className="text-sm font-semibold text-cyan-400 mb-2 flex items-center gap-2"><ListChecks size={16} /> Key Findings</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-300 pl-2 text-sm">
                    {dossier.keyFindings.map((finding, index) => (
                        <li key={index}>{finding}</li>
                    ))}
                </ul>
            </div>

            <div className="mb-4">
                <h4 className="text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2"><ShieldAlert size={16} /> Counterarguments & Nuances</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-300 pl-2 text-sm">
                    {dossier.counterArguments.map((arg, index) => (
                        <li key={index}>{arg}</li>
                    ))}
                </ul>
            </div>

            <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Cited Sources</h4>
                <div className="space-y-1">
                    {dossier.sources.map((source, index) => (
                        <a 
                            key={index} 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-cyan-400 hover:underline text-xs"
                        >
                            <ExternalLink size={12} /> {source.title}
                        </a>
                    ))}
                </div>
            </div>
            
            <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2"><Search size={16} /> Further Reading</h4>
                 <ul className="list-disc list-inside space-y-2 text-gray-300 pl-2 text-sm">
                    {dossier.furtherReading.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ResearchDossierDisplay;