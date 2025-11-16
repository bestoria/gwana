import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { DebateContent, Persona } from '@/src/lib/types';
import { generateSpeech } from '../services/geminiService';
import { audioManager } from '@/src/lib/utils';
import { VOICE_NAMES } from '@/src/lib/constants';
import { X, Volume2, VolumeX, Send, ChevronRight, Loader, Scale } from 'lucide-react';
import { useLiveAPIContext } from '../contexts/LiveAPIContext';

interface DebateStageUIProps {
  debate: DebateContent | null;
  onStartDebate: (topic: string) => void;
  onDebateComplete: () => void;
  isDesktop: boolean;
}

const DebateStageUI: React.FC<DebateStageUIProps> = ({ debate, onStartDebate, onDebateComplete, isDesktop }) => {
    const { callState, speakingPersona } = useLiveAPIContext();
    const [topic, setTopic] = useState('');
    
    const [currentRoundIndex, setCurrentRoundIndex] = useState(-1);
    const [playbackState, setPlaybackState] = useState<'idle' | 'playing' | 'finished'>('idle');
    const [roundsWithAudio, setRoundsWithAudio] = useState<any[]>([]);

    const transcriptRef = useRef<HTMLDivElement>(null);
    const prevCallStateRef = useRef(callState);

    useEffect(() => {
        const wasActive = ['connected', 'paused'].includes(prevCallStateRef.current);
        const isNowInactive = ['idle', 'standby', 'disconnecting'].includes(callState);

        if (wasActive && isNowInactive) {
            onDebateComplete();
        }
        prevCallStateRef.current = callState;
    }, [callState, onDebateComplete]);

    // Pre-generate audio when debate content is available
    useEffect(() => {
        if (!debate) {
            setRoundsWithAudio([]);
            setCurrentRoundIndex(-1);
            setPlaybackState('idle');
            return;
        };
        
        setPlaybackState('playing'); // Show loading state
        const generateAllAudio = async () => {
            const roundsWithAudioData = await Promise.all(
                debate.rounds.map(async (round) => {
                    const voice = round.speaker === 'Agent Zara' ? VOICE_NAMES.AGENT_ZARA_DEFAULT : VOICE_NAMES.AGENT_ZERO_DEFAULT;
                    const audio = await generateSpeech(round.argument, voice as string);
                    return { ...round, audio };
                })
            );
            setRoundsWithAudio(roundsWithAudioData);
            setCurrentRoundIndex(0); // Start the debate
        };
        
        generateAllAudio();

    }, [debate]);

    // Playback effect
    useEffect(() => {
        if (currentRoundIndex < 0 || !roundsWithAudio[currentRoundIndex] || playbackState === 'finished') return;

        const playCurrentRound = async () => {
            const currentRound = roundsWithAudio[currentRoundIndex];
            setPlaybackState('playing');

            if (currentRound.audio) {
                await audioManager.playTTS(currentRound.audio);
            }
            
            setPlaybackState('idle');
        };

        playCurrentRound();
    }, [currentRoundIndex, roundsWithAudio]);

    // Scroll transcript
    useEffect(() => {
        if (transcriptRef.current) {
            transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
        }
    }, [currentRoundIndex]);

    const handleNext = () => {
        if (playbackState === 'playing' || !debate) return;
        if (currentRoundIndex < debate.rounds.length - 1) {
            setCurrentRoundIndex(prev => prev + 1);
        } else {
            setPlaybackState('finished');
        }
    };

    const handleStartDebate = () => {
        if (topic.trim()) onStartDebate(topic.trim());
    };

    if (!debate) {
        return (
             <div className="quiz-console-container">
                <div className="quiz-console" style={{ justifyContent: 'space-between', padding: '1.5rem' }}>
                    <div className="flex-grow flex items-center justify-center">
                        <div className="text-center text-gray-400 animate-fade-in">
                            <Scale size={48} className="mx-auto mb-4 text-fuchsia-400" />
                            <p className="mt-2 text-lg">Enter a resolution to begin the debate.</p>
                        </div>
                    </div>
                    <div className="flex-shrink-0 mt-4">
                         <div className="w-full max-w-lg mx-auto flex items-center gap-2">
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleStartDebate()}
                                placeholder="e.g., Resolved: Social media does more harm than good."
                                className="w-full bg-black/50 border border-[var(--border-color)] rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400"
                            />
                            <button
                                onClick={handleStartDebate}
                                disabled={!topic.trim()}
                                className="w-14 h-14 flex-shrink-0 bg-cyan-600 text-white font-semibold rounded-full hover:bg-cyan-700 transition-colors disabled:bg-gray-600 flex items-center justify-center"
                            >
                               <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="quiz-show-container">
            <div className="quiz-console" style={{maxWidth: '800px'}}>
                 <div className="text-center mb-2">
                    <p className="text-sm text-gray-400">RESOLUTION</p>
                    <h2 className="text-lg font-bold text-cyan-300">{debate.topic}</h2>
                </div>
                <div ref={transcriptRef} className="flex-grow overflow-y-auto p-4 bg-black/40 rounded-md border border-gray-700 space-y-4 font-mono text-sm">
                    {roundsWithAudio.slice(0, currentRoundIndex + 1).map((round, index) => (
                        <div key={index} className="animate-fade-in">
                            <p className={`font-bold ${round.speaker === 'Agent Zero' ? 'text-cyan-400' : 'text-fuchsia-400'}`}>{round.speaker} ({round.type})</p>
                            <p className="text-gray-200 whitespace-pre-wrap">{round.argument}</p>
                        </div>
                    ))}
                    {currentRoundIndex < 0 && <div className="flex items-center gap-2 text-gray-500 italic"><Loader size={16} className="animate-spin" /> Generating arguments...</div>}
                </div>

                <div className="mt-4 flex justify-end">
                    {playbackState === 'finished' ? (
                        <button onClick={onDebateComplete} className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-md">End Debate</button>
                    ) : (
                        <button onClick={handleNext} disabled={playbackState === 'playing' || currentRoundIndex < 0} className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-md flex items-center gap-2 disabled:bg-gray-600">
                            {playbackState === 'playing' ? 'Speaking...' : 'Next Argument'} <ChevronRight size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DebateStageUI;