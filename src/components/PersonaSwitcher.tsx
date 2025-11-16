import React from 'react';
import { User, Users } from 'lucide-react';
import { Persona } from '@/src/lib/types';

interface PersonaSwitcherProps {
  currentPersona: Persona;
  onSwitch: (persona: Persona) => void;
}

const PersonaSwitcher: React.FC<PersonaSwitcherProps> = ({ currentPersona, onSwitch }) => {
  const personas: { name: Persona; emoji: string; label: string }[] = [
    { name: 'Agent Zero', emoji: '👨‍💼', label: 'Agent Zero (Male)' },
    { name: 'Agent Zara', emoji: '👩‍💼', label: 'Agent Zara (Female)' }
  ];

  return (
    <div className="flex items-center gap-2 p-2 bg-background/50 border border-border rounded-lg">
      <Users size={16} className="text-muted-foreground" />
      <div className="flex gap-1">
        {personas.map((persona) => (
          <button
            key={persona.name}
            onClick={() => onSwitch(persona.name)}
            className={`px-3 py-1.5 rounded text-2xl transition-all ${
              currentPersona === persona.name
                ? 'bg-primary/20 border border-primary scale-110'
                : 'hover:bg-muted/50 opacity-60 hover:opacity-100'
            }`}
            title={persona.label}
          >
            {persona.emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PersonaSwitcher;
