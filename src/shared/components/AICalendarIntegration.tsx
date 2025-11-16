import React, { useState } from 'react';
import { Calendar, Plus, Brain, Sparkles, Clock, Loader } from 'lucide-react';
import { getAssistantResponse } from '@/src/services/geminiService';
import type { CalendarEvent } from '@/src/lib/types';
import HolographicPanel from '@/src/shared/components/cyberpunk/HolographicPanel';
import HolographicText from '@/src/shared/components/cyberpunk/HolographicText';
import NeonButton from '@/src/shared/components/cyberpunk/NeonButton';

interface AICalendarIntegrationProps {
  events: CalendarEvent[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
  onClose: () => void;
}

const AICalendarIntegration: React.FC<AICalendarIntegrationProps> = ({ events, onAddEvent, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleAnalyzeSchedule = async () => {
    if (!events.length) {
      setSuggestions(['No events found. Start by adding your first event!']);
      return;
    }

    setIsProcessing(true);
    const eventsList = events.map(e => 
      `${new Date(e.startTime).toLocaleString()} - ${e.title}`
    ).join('\n');

    const analysisPrompt = `Analyze this schedule and provide 3-5 smart suggestions for optimization, time management, or new events to add:

${eventsList}

Respond with a JSON array of strings: ["suggestion 1", "suggestion 2", ...]`;

    try {
      const response = await getAssistantResponse(analysisPrompt);
      const parsed = JSON.parse(response || '[]');
      setSuggestions(Array.isArray(parsed) ? parsed : [response || 'No suggestions available']);
    } catch (error) {
      setSuggestions(['Unable to analyze schedule. Please try again.']);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSmartAdd = async () => {
    if (!prompt.trim()) return;

    setIsProcessing(true);
    const smartPrompt = `Parse this natural language event request and create a structured event:

"${prompt}"

Current date/time: ${new Date().toLocaleString()}

Respond with JSON:
{
  "title": "event title",
  "description": "description",
  "startTime": <timestamp in milliseconds>,
  "endTime": <timestamp in milliseconds>
}`;

    try {
      const response = await getAssistantResponse(smartPrompt);
      const event = JSON.parse(response || '{}');
      
      if (event.title && event.startTime && event.endTime) {
        await onAddEvent(event);
        setPrompt('');
        setSuggestions(['✓ Event added successfully!']);
      } else {
        setSuggestions(['Unable to parse event. Please be more specific.']);
      }
    } catch (error) {
      setSuggestions(['Error creating event. Please try again.']);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <HolographicPanel glowColor="cyan" withGrid withCorners className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <HolographicText className="text-lg font-bold flex items-center gap-2" glowColor="cyan">
              <Brain size={20} />
              AI CALENDAR ASSISTANT
            </HolographicText>
            <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
          </div>

          {/* Smart Event Creation */}
          <div className="space-y-2">
            <HolographicText className="text-xs opacity-70">SMART ADD</HolographicText>
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'Team meeting tomorrow at 3pm for 1 hour'"
                className="flex-1 rounded px-3 py-2 text-sm focus:outline-none"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSmartAdd()}
              />
              <NeonButton onClick={handleSmartAdd} color="cyan" disabled={isProcessing || !prompt.trim()}>
                {isProcessing ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />}
                Add
              </NeonButton>
            </div>
          </div>

          {/* Schedule Analysis */}
          <NeonButton onClick={handleAnalyzeSchedule} fullWidth color="purple" disabled={isProcessing}>
            {isProcessing ? <Loader size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Analyze My Schedule
          </NeonButton>

          {/* AI Suggestions */}
          {suggestions.length > 0 && (
            <HolographicPanel glowColor="purple" withScanlines={false}>
              <div className="p-4 space-y-2">
                <HolographicText className="text-xs font-bold flex items-center gap-2" glowColor="purple">
                  <Sparkles size={14} />
                  AI SUGGESTIONS
                </HolographicText>
                <ul className="space-y-1">
                  {suggestions.map((suggestion, i) => (
                    <li key={i} className="text-xs flex items-start gap-2" style={{ color: 'var(--text-primary)' }}>
                      <span style={{ color: 'var(--accent-magenta)' }} className="mt-0.5">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </HolographicPanel>
          )}

          {/* Quick Examples */}
          <div className="space-y-2">
            <HolographicText className="text-xs opacity-70">EXAMPLES</HolographicText>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Lunch with Sarah next Monday at noon',
                'Weekly standup every Tuesday 9am',
                'Doctor appointment Thursday 2pm',
                'Gym session tomorrow 6am for 45 minutes'
              ].map((example, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(example)}
                  className="px-2 py-1 bg-black/30 border border-cyan-600/30 rounded text-[10px] text-left hover:border-cyan-500 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </HolographicPanel>
    </div>
  );
};

export default AICalendarIntegration;
