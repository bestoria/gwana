import React from 'react';
import { Globe } from 'lucide-react';

interface GroundingSource {
    title: string;
    uri: string;
}

interface GroundingSourcesDisplayProps {
    sources: GroundingSource[];
}

const GroundingSourcesDisplay: React.FC<GroundingSourcesDisplayProps> = ({ sources }) => {
    if (!sources || sources.length === 0) return null;
    return (
        <div className="mt-3 border-t border-cyan-500/10 pt-2">
            <h4 className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1.5 font-mono">
                <Globe size={14} /> SOURCES
            </h4>
            <div className="space-y-1">
                {sources.map((source, index) => (
                    <a
                        key={index}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs text-cyan-400 truncate hover:underline"
                        title={source.uri}
                    >
                        {source.title || new URL(source.uri).hostname}
                    </a>
                ))}
            </div>
        </div>
    );
};

export default GroundingSourcesDisplay;
