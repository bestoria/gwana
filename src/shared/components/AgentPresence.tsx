import React from 'react';
import AssistantEmoji from '@/src/shared/components/AssistantEmoji';
import { useLiveAPIContext } from '@/src/contexts/LiveAPIContext';
import type { View, AiMode, CallState, Persona } from '@/src/lib/types';
import { audioManager, formatTime } from '@/src/lib/utils';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { AI_MODES } from '@/src/lib/constants';
import NewsDesk from '@/src/shared/components/NewsDesk';
import PersonaSwitcher from '@/src/shared/components/PersonaSwitcher';

interface AgentPresenceProps {
    view: View;
    isDesktop?: boolean;
    aiMode: AiMode;
    persona: Persona;
    setPersona: (persona: Persona) => void;
    hideControls?: boolean;
}

const AgentPresence: React.FC<AgentPresenceProps> = ({ 
    view, 
    isDesktop, 
    aiMode,
    persona,
    setPersona,
    hideControls
}) => {
    const { 
        callState, callDuration, startCall, endCall, isMuted, toggleMute, isSpeakerOn, toggleSpeaker, speakingPersona, outputVolume, setOutputVolume
    } = useLiveAPIContext();
    
    const getStatusText = () => {
        switch (callState) {
            case 'idle': return 'Ready';
            case 'ringing': return 'Ringing...';
            case 'connecting': return 'Connecting...';
            case 'connected': return formatTime(callDuration);
            case 'disconnecting': return 'Disconnecting...';
            case 'standby': return 'Standby';
            case 'paused': return 'Paused';
            default: return 'Online';
        }
    };

    const isSessionActive = ['ringing', 'connecting', 'connected', 'paused'].includes(callState);

    const handleCallButtonClick = () => {
        if (isSessionActive) {
            endCall('idle');
        } else {
            startCall();
        }
    };

    const isSelectable = ['default', 'study', 'translator'].includes(aiMode);
    
    const handleSelect = (selectedPersona: Persona) => {
        if (isSelectable && !isSessionActive && setPersona) {
            setPersona(selectedPersona);
        }
    };
    
    const isZeroActive = persona === 'Agent Zero';
    const isZaraActive = persona === 'Agent Zara';
    const isZeroSpeaking = speakingPersona === 'Agent Zero';
    const isZaraSpeaking = speakingPersona === 'Agent Zara';
    
    return (
         <div className={`relative z-10 flex flex-col items-center transition-all duration-700 ease-in-out bg-black/10 w-full py-2 justify-center flex-shrink-0`}>
            <div className="flex items-center gap-4 mb-2">
                <PersonaSwitcher currentPersona={persona} onSwitch={setPersona} />
            </div>
            <div className="dual-agent-presence-container pointer-events-auto">
                <div 
                    className={`agent-pod agent-zero-pod ${isSelectable && setPersona ? 'selectable' : ''} ${isZeroActive ? 'active' : ''} ${isZeroSpeaking ? 'speaking' : ''}`}
                    onClick={() => handleSelect('Agent Zero')}
                    title="Select Agent Zero"
                >
                    <AssistantEmoji persona="Agent Zero" size={isDesktop ? 'xl' : 'lg'} isAnimated={isZeroSpeaking} />
                    {!hideControls && <h2 className="agent-zero-name text-sm sm:text-lg">Agent Zero</h2>}
                </div>
                
                {!hideControls && (
                    aiMode === 'news' ? (
                        <NewsDesk />
                    ) : (
                        <div className="dual-agent-center-controls">
                            <p className="mt-1 text-cyan-300 min-h-[20px] text-base">{getStatusText()}</p>
                            <div id="onboarding-call-button-container" className="flex items-center justify-center gap-2 sm:gap-4 pointer-events-auto my-2">
                                <button 
                                    onClick={toggleMute}
                                    disabled={!isSessionActive}
                                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
                                    title={isMuted ? "Unmute" : "Mute"}
                                >
                                    {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                                </button>
                                <button 
                                    onClick={handleCallButtonClick} 
                                    className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
                                    style={{
                                      backgroundColor: isSessionActive ? '#ff0055' : 'var(--accent-green)',
                                      color: 'white',
                                      animation: isSessionActive ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                    title={isSessionActive ? "End Call" : "Start Call"}
                                >
                                    {isSessionActive ? <PhoneOff size={26} /> : <Phone size={26} />}
                                </button>
                                <button 
                                    onClick={toggleSpeaker}
                                    disabled={!isSessionActive}
                                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
                                    title={isSpeakerOn ? "Speaker Off" : "Speaker On"}
                                >
                                    {isSpeakerOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
                                </button>
                            </div>

                            <div className="flex items-center gap-2 px-2 w-full max-w-[200px]">
                                <Volume2 size={20} className="text-gray-400"/>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={outputVolume}
                                    onChange={(e) => setOutputVolume(parseFloat(e.target.value))}
                                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    aria-label="Adjust AI volume"
                                />
                            </div>
                        </div>
                    )
                )}

                
                <div 
                    className={`agent-pod agent-zara-pod ${isSelectable && setPersona ? 'selectable' : ''} ${isZaraActive ? 'active' : ''} ${isZaraSpeaking ? 'speaking' : ''}`}
                    onClick={() => handleSelect('Agent Zara')}
                    title="Select Agent Zara"
                >
                    <AssistantEmoji persona="Agent Zara" size={isDesktop ? 'xl' : 'lg'} isAnimated={isZaraSpeaking} />
                    {!hideControls && <h2 className="agent-zara-name text-sm sm:text-lg">Agent Zara</h2>}
                </div>
            </div>
        </div>
    );
};

export default AgentPresence;