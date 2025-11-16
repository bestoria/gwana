import React, { useState } from 'react';
import { useLiveAPIContext } from '../contexts/LiveAPIContext';
import { SUPPORTED_LANGUAGES } from '@/src/lib/constants';
import { Mic, Volume2, StopCircle, Pause, Play, MicOff, VolumeX, Languages, Radio } from 'lucide-react';
import type { Message } from '@/src/lib/types';
import HolographicPanel from './cyberpunk/HolographicPanel';
import HolographicText from './cyberpunk/HolographicText';
import NeonButton from './cyberpunk/NeonButton';
import FrequencyVisualizer from './cyberpunk/FrequencyVisualizer';

interface TranslatorConsoleProps {
    messages: Message[];
}

const TranslatorConsole: React.FC<TranslatorConsoleProps> = ({ messages }) => {
    const [targetLanguage, setTargetLanguage] = useState('French');
    const { 
        callState, 
        startCall, 
        endCall, 
        pauseCall,
        resumeCall,
        liveTranslatedText,
        isUserSpeaking,
        isAISpeaking,
        isMuted,
        toggleMute,
        isSpeakerOn,
        toggleSpeaker,
        outputVolume,
        setOutputVolume
    } = useLiveAPIContext();

    const isSessionActive = ['connecting', 'connected', 'ringing', 'paused'].includes(callState);

    const handlePrimaryAction = () => {
        if (callState === 'connected') {
            pauseCall();
        } else if (callState === 'paused') {
            resumeCall();
        } else if (callState === 'idle' || callState === 'standby') {
            const chatContext = messages
                .slice(-5)
                .map(m => `${m.sender === 'user' ? 'User' : 'AI'}: ${m.text}`)
                .join('\n');
            const systemInstruction = `You are a real-time, expert translator. Your ONLY task is to listen to the user and translate their speech into ${targetLanguage}. You MUST respond ONLY with the translated audio. Do not add any conversational filler like 'Here is the translation...' or 'Okay, I will translate that for you.' Just provide the direct translation.`;
            startCall(undefined, undefined, systemInstruction, chatContext);
        }
    };

    const getStatusText = () => {
        if (!isSessionActive) return "IDLE";
        if (callState === 'paused') return "PAUSED";
        if (isAISpeaking) return "SPEAKING...";
        if (isUserSpeaking) return "LISTENING...";
        return "CONNECTED";
    };

    return (
        <div className="broadcast-console-container">
            <div className="broadcast-console" style={{ maxWidth: '600px', gap: '1.5rem' }}>
                <HolographicPanel glowColor="magenta" withGrid withScanlines withCorners>
                    <div className="p-6 space-y-4">
                        <HolographicText className="text-center text-sm font-bold tracking-widest flex items-center justify-center gap-2" glowColor="magenta" flickerEffect>
                            <Languages size={20} className="animate-pulse" />
                            UNIVERSAL TRANSLATOR
                            <Radio size={16} className="animate-pulse" />
                        </HolographicText>

                        {/* Frequency Visualizer */}
                        <div className="relative overflow-hidden rounded-lg border-2" style={{ borderColor: 'var(--accent-magenta)' }}>
                            <FrequencyVisualizer 
                                isActive={isAISpeaking || isUserSpeaking} 
                                color="magenta" 
                                height={80}
                            />
                        </div>

                        {/* Translation Display */}
                        <HolographicPanel glowColor="cyan" withScanlines={false} withCorners={false} className="min-h-[120px]">
                            <div className="p-4">
                                <HolographicText 
                                    key={liveTranslatedText.length} 
                                    className="text-lg font-mono text-center block animate-text-decode" 
                                    glowColor="cyan"
                                >
                                    {liveTranslatedText || "AWAITING INPUT..."}
                                </HolographicText>
                            </div>
                        </HolographicPanel>

                        {/* Language Selector */}
                        <div>
                            <label className="text-xs font-mono mb-2 block flex items-center gap-2" style={{ color: 'var(--accent-magenta)' }}>
                                <Languages size={14} />
                                TARGET LANGUAGE
                            </label>
                            <div className="relative">
                                <select
                                    value={targetLanguage}
                                    onChange={(e) => setTargetLanguage(e.target.value)}
                                    disabled={isSessionActive}
                                    className="w-full bg-black/70 border-2 rounded-lg px-4 py-3 text-sm font-mono backdrop-blur-sm
                                             focus:outline-none transition-all disabled:opacity-30"
                                    style={{
                                        borderColor: 'var(--accent-magenta)',
                                        color: 'var(--accent-cyan)',
                                        boxShadow: '0 0 10px rgba(255, 0, 255, 0.3), inset 0 0 10px rgba(255, 0, 255, 0.1)'
                                    }}
                                >
                                    {SUPPORTED_LANGUAGES.map(lang => (
                                        <option key={lang.code} value={lang.name} className="bg-black">{lang.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        {/* Controls */}
                        <div className="flex items-center justify-center gap-4 py-2">
                            <NeonButton 
                                onClick={toggleMute} 
                                disabled={!isSessionActive}
                                variant="primary"
                                size="md"
                                title={isMuted ? "Unmute" : "Mute"}
                            >
                                {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                            </NeonButton>

                            <NeonButton
                                onClick={handlePrimaryAction}
                                variant="secondary"
                                size="lg"
                                glowing={isSessionActive}
                                className="relative"
                            >
                                {callState === 'connected' ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                            </NeonButton>

                            <NeonButton
                                onClick={toggleSpeaker}
                                disabled={!isSessionActive}
                                variant="primary"
                                size="md"
                                title={isSpeakerOn ? "Speaker Off" : "Speaker On"}
                            >
                                {isSpeakerOn ? <Volume2 size={22} /> : <VolumeX size={22} />}
                            </NeonButton>

                            {isSessionActive && (
                                <NeonButton
                                    onClick={() => endCall('standby')}
                                    variant="danger"
                                    size="md"
                                    title="Stop Session"
                                >
                                    <StopCircle size={22} />
                                </NeonButton>
                            )}
                        </div>

                        {/* Volume Control */}
                        <div className="flex items-center gap-3 px-2">
                            <Volume2 size={20} style={{ color: 'var(--accent-cyan)' }} />
                            <div className="flex-1 relative h-2 rounded-full overflow-hidden" 
                                 style={{ 
                                   background: 'rgba(0, 255, 255, 0.1)',
                                   border: '1px solid rgba(0, 255, 255, 0.3)'
                                 }}>
                                <div 
                                    className="absolute inset-y-0 left-0 rounded-full transition-all"
                                    style={{
                                        width: `${outputVolume * 100}%`,
                                        background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-magenta))',
                                        boxShadow: '0 0 10px var(--accent-cyan)'
                                    }}
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={outputVolume}
                                    onChange={(e) => setOutputVolume(parseFloat(e.target.value))}
                                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>
                        
                        {/* Status */}
                        <HolographicText 
                            className="text-center min-h-[20px] text-sm font-bold font-mono tracking-wider" 
                            glowColor="cyan"
                            glitchEffect={isSessionActive}
                        >
                            {getStatusText()}
                        </HolographicText>
                    </div>
                </HolographicPanel>
            </div>
        </div>
    );
};

export default TranslatorConsole;