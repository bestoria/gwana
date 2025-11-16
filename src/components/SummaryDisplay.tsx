import React from 'react';
import { BookText } from 'lucide-react';
import { formatText, linkifyText } from '@/src/lib/utils';

interface SummaryDisplayProps {
  content: string;
}

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ content }) => {
  return (
    <div className="mt-2 p-3 border border-purple-500/50 bg-black/30 rounded-lg font-mono text-xs max-w-xl relative">
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-purple-400"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-purple-400"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-purple-400"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-purple-400"></div>
        <h3 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
            <BookText size={16} /> CONVERSATION SUMMARY
        </h3>
        <div className="text-sm text-gray-200 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: linkifyText(formatText(content)) }} />
    </div>
  );
};

export default SummaryDisplay;