import React, { useState, useEffect } from 'react';
import { Mic, BookOpen, Sparkles, Calendar, TrendingUp, Heart, Brain, Target, Loader } from 'lucide-react';
import { useLiveAPIContext } from '../contexts/LiveAPIContext';
import { getAssistantResponse } from '../services/geminiService';
import HolographicPanel from './cyberpunk/HolographicPanel';
import HolographicText from './cyberpunk/HolographicText';
import NeonButton from './cyberpunk/NeonButton';
import FrequencyVisualizer from './cyberpunk/FrequencyVisualizer';

interface JournalEntry {
    id: string;
    date: string;
    transcript: string;
    analysis?: {
        mood: string;
        themes: string[];
        insights: string;
        suggestions: string[];
    };
}

const VoiceJournal: React.FC = () => {
    const { 
        callState, 
        startCall, 
        endCall,
        isUserSpeaking,
        liveTranslatedText 
    } = useLiveAPIContext();
    
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

    const isRecording = callState === 'connected';

    // Load entries from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('voice_journal_entries');
        if (stored) {
            try {
                setEntries(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to load journal entries', e);
            }
        }
    }, []);

    // Save entries to localStorage
    useEffect(() => {
        if (entries.length > 0) {
            localStorage.setItem('voice_journal_entries', JSON.stringify(entries));
        }
    }, [entries]);

    const handleStartRecording = () => {
        const systemInstruction = `You are a supportive journaling companion. Listen carefully to the user's thoughts and feelings. 
        
When they're done speaking, acknowledge what they shared with empathy and understanding. 
Keep your responses brief and encouraging. Help them feel heard and validated.`;
        
        startCall(undefined, undefined, systemInstruction);
        setCurrentEntry({
            id: Date.now().toString(),
            date: new Date().toISOString(),
            transcript: ''
        });
    };

    const handleStopRecording = async () => {
        if (!currentEntry) return;

        const finalTranscript = liveTranslatedText;
        const updatedEntry = { ...currentEntry, transcript: finalTranscript };
        
        endCall();
        setIsAnalyzing(true);

        try {
            // Analyze the journal entry
            const analysisPrompt = `Analyze this journal entry and provide:
1. Overall mood (one word: happy, anxious, peaceful, stressed, etc.)
2. 2-3 main themes or topics
3. A brief insight or observation
4. 2-3 supportive suggestions or reflections

Journal entry: "${finalTranscript}"

Respond in JSON format:
{
  "mood": "...",
  "themes": ["...", "..."],
  "insights": "...",
  "suggestions": ["...", "..."]
}`;

            const response = await getAssistantResponse(analysisPrompt);
            const analysisText = response || '{}';
            
            try {
                const analysis = JSON.parse(analysisText);
                updatedEntry.analysis = analysis;
            } catch (e) {
                // If JSON parsing fails, create basic analysis
                updatedEntry.analysis = {
                    mood: 'reflective',
                    themes: ['personal reflection'],
                    insights: 'Thank you for sharing your thoughts.',
                    suggestions: ['Continue journaling regularly', 'Take time for self-reflection']
                };
            }

            setEntries(prev => [updatedEntry, ...prev]);
            setCurrentEntry(null);
            setSelectedEntry(updatedEntry);
        } catch (error) {
            console.error('Analysis failed:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getMoodColor = (mood?: string) => {
        if (!mood) return 'gray';
        const moodLower = mood.toLowerCase();
        if (moodLower.includes('happy') || moodLower.includes('joy')) return 'green';
        if (moodLower.includes('sad') || moodLower.includes('down')) return 'blue';
        if (moodLower.includes('anxi') || moodLower.includes('stress')) return 'orange';
        if (moodLower.includes('peace') || moodLower.includes('calm')) return 'cyan';
        if (moodLower.includes('angry') || moodLower.includes('frust')) return 'red';
        return 'purple';
    };

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-[#0a0a1a] to-[#1a1a2e] p-4 overflow-y-auto">
            <div className="max-w-6xl mx-auto w-full space-y-4">
                <HolographicPanel glowColor="purple" withGrid withCorners>
                    <div className="p-6 space-y-4">
                        <HolographicText 
                            className="text-center text-lg font-bold tracking-widest flex items-center justify-center gap-2" 
                            glowColor="purple" 
                            flickerEffect
                        >
                            <BookOpen size={24} className="animate-pulse" />
                            VOICE JOURNAL
                            <Brain size={20} />
                        </HolographicText>

                        {/* Visualizer */}
                        <div className="relative overflow-hidden rounded-lg border-2" style={{ borderColor: 'var(--accent-purple)' }}>
                            <FrequencyVisualizer 
                                isActive={isUserSpeaking} 
                                color="purple" 
                                height={100}
                            />
                        </div>

                        {!isRecording && !isAnalyzing ? (
                            <>
                                {/* Live Transcript */}
                                {currentEntry && (
                                    <HolographicPanel glowColor="cyan" withScanlines={false} className="min-h-[150px]">
                                        <div className="p-4">
                                            <HolographicText 
                                                className="text-sm font-mono leading-relaxed whitespace-pre-wrap" 
                                                glowColor="cyan"
                                            >
                                                {liveTranslatedText || 'Start speaking...'}
                                            </HolographicText>
                                        </div>
                                    </HolographicPanel>
                                )}

                                {/* Record Button */}
                                <NeonButton
                                    onClick={handleStartRecording}
                                    fullWidth
                                    size="large"
                                    color="purple"
                                >
                                    <Mic size={18} />
                                    START VOICE JOURNAL
                                </NeonButton>

                                <p className="text-center text-xs text-gray-500">
                                    🎙️ Speak your thoughts and feelings. AI will listen and provide insights.
                                </p>
                            </>
                        ) : isRecording ? (
                            <>
                                {/* Recording Display */}
                                <HolographicPanel glowColor="red" withScanlines={false} className="min-h-[200px]">
                                    <div className="p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                                            <HolographicText className="text-sm font-bold" glowColor="red">
                                                RECORDING...
                                            </HolographicText>
                                        </div>
                                        <HolographicText 
                                            className="text-sm font-mono leading-relaxed whitespace-pre-wrap" 
                                            glowColor="cyan"
                                        >
                                            {liveTranslatedText || 'Listening...'}
                                        </HolographicText>
                                    </div>
                                </HolographicPanel>

                                {/* Stop Button */}
                                <NeonButton
                                    onClick={handleStopRecording}
                                    fullWidth
                                    size="large"
                                    color="red"
                                >
                                    <Target size={18} />
                                    FINISH & ANALYZE
                                </NeonButton>
                            </>
                        ) : (
                            <div className="flex items-center justify-center gap-3 p-8">
                                <Loader size={24} className="animate-spin text-purple-400" />
                                <HolographicText className="text-sm" glowColor="purple">
                                    Analyzing your journal entry...
                                </HolographicText>
                            </div>
                        )}
                    </div>
                </HolographicPanel>

                {/* Selected Entry Analysis */}
                {selectedEntry?.analysis && (
                    <HolographicPanel glowColor={getMoodColor(selectedEntry.analysis.mood)} withScanlines>
                        <div className="p-6 space-y-4">
                            <HolographicText className="text-sm font-bold tracking-wide flex items-center gap-2">
                                <Sparkles size={16} />
                                AI ANALYSIS
                            </HolographicText>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs opacity-70">
                                        <Heart size={14} />
                                        MOOD
                                    </div>
                                    <p className="text-lg font-bold capitalize">{selectedEntry.analysis.mood}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs opacity-70">
                                        <Calendar size={14} />
                                        DATE
                                    </div>
                                    <p className="text-sm">{new Date(selectedEntry.date).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs opacity-70">
                                    <TrendingUp size={14} />
                                    THEMES
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedEntry.analysis.themes.map((theme, i) => (
                                        <span key={i} className="px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-xs">
                                            {theme}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs opacity-70">
                                    <Brain size={14} />
                                    INSIGHTS
                                </div>
                                <p className="text-sm leading-relaxed text-gray-300">
                                    {selectedEntry.analysis.insights}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs opacity-70">
                                    <Target size={14} />
                                    SUGGESTIONS
                                </div>
                                <ul className="space-y-1">
                                    {selectedEntry.analysis.suggestions.map((suggestion, i) => (
                                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                            <span className="text-purple-400 mt-1">•</span>
                                            <span>{suggestion}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </HolographicPanel>
                )}

                {/* Past Entries */}
                {entries.length > 0 && !isRecording && (
                    <HolographicPanel glowColor="cyan" withGrid>
                        <div className="p-6 space-y-4">
                            <HolographicText className="text-sm font-bold tracking-wide">
                                PAST ENTRIES ({entries.length})
                            </HolographicText>
                            
                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                {entries.map(entry => (
                                    <button
                                        key={entry.id}
                                        onClick={() => setSelectedEntry(entry)}
                                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                                            selectedEntry?.id === entry.id
                                                ? 'bg-cyan-500/20 border-cyan-400'
                                                : 'bg-black/20 border-gray-700 hover:border-cyan-600'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-gray-400">
                                                {new Date(entry.date).toLocaleDateString()}
                                            </span>
                                            {entry.analysis && (
                                                <span className={`text-xs px-2 py-0.5 rounded-full bg-${getMoodColor(entry.analysis.mood)}-500/20 border border-${getMoodColor(entry.analysis.mood)}-400/30 capitalize`}>
                                                    {entry.analysis.mood}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-300 line-clamp-2">
                                            {entry.transcript}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </HolographicPanel>
                )}
            </div>
        </div>
    );
};

export default VoiceJournal;
