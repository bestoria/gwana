import React from 'react';
import type { AiSuggestion } from '@/src/lib/types';
import { audioManager } from '@/src/lib/utils';

interface SuggestionChipsProps {
  suggestions: AiSuggestion[];
  onClick: (prompt: string) => void;
}

const SuggestionChips: React.FC<SuggestionChipsProps> = ({ suggestions, onClick }) => (
  <div className="mt-3 flex flex-wrap gap-2 animate-fade-in">
    {suggestions.map((suggestion, index) => (
      <button
        key={index}
        onClick={() => {
          onClick(suggestion.prompt);
          audioManager.playSound('click');
        }}
        className="px-3 py-1.5 bg-cyan-900/50 border border-cyan-700 rounded-full text-cyan-300 text-sm hover:bg-cyan-800 transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
      >
        {suggestion.label}
      </button>
    ))}
  </div>
);

export default SuggestionChips;