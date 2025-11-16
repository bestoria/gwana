import React, { useState } from 'react';
import { useLiveAPIContext } from '../contexts/LiveAPIContext';
import { Mic, Radio, Newspaper, TrendingUp, Globe, Zap, StopCircle } from 'lucide-react';
import HolographicPanel from './cyberpunk/HolographicPanel';
import HolographicText from './cyberpunk/HolographicText';
import NeonButton from './cyberpunk/NeonButton';
import FrequencyVisualizer from './cyberpunk/FrequencyVisualizer';

const NEWS_CATEGORIES = [
    { id: 'tech', name: 'Technology', icon: Zap, color: 'cyan' },
    { id: 'business', name: 'Business', icon: TrendingUp, color: 'green' },
    { id: 'world', name: 'World News', icon: Globe, color: 'blue' },
    { id: 'general', name: 'Top Stories', icon: Newspaper, color: 'purple' }
];

const NewsDesk: React.FC = () => {
    const { 
        callState, 
        startCall, 
        endCall,
        isAISpeaking,
        liveTranslatedText 
    } = useLiveAPIContext();
    
    const [selectedCategory, setSelectedCategory] = useState<string>('tech');
    const [customTopic, setCustomTopic] = useState('');
    const isBroadcasting = callState === 'connected' || callState === 'paused';

    const handleStartBroadcast = () => {
        const topic = customTopic.trim() || selectedCategory;
        const systemInstruction = `You are a professional news anchor delivering a live news broadcast about ${topic}. 
        
Your role:
- Start with a professional greeting: "Good evening, this is [Your Name] bringing you the latest in ${topic}"
- Deliver 3-4 compelling news stories related to ${topic}
- Use a clear, authoritative broadcasting voice
- Include interesting facts and analysis
- Maintain an engaging, professional tone
- Conclude with a sign-off

Keep each story concise (30-45 seconds) and transition smoothly between stories. Sound natural and conversational while maintaining professionalism.`;
        
        startCall(undefined, undefined, systemInstruction);
    };

    return (
        <div className="broadcast-console-container">
            <div className="broadcast-console" style={{ maxWidth: '700px', gap: '1.5rem' }}>
                <HolographicPanel glowColor="cyan" withGrid withScanlines withCorners>
                    <div className="p-6 space-y-4">
                        <HolographicText 
                            className="text-center text-sm font-bold tracking-widest flex items-center justify-center gap-2" 
                            glowColor="cyan" 
                            flickerEffect
                        >
                            <Radio size={20} className="animate-pulse" />
                            AI NEWS BROADCASTING SYSTEM
                            <Mic size={16} className={isBroadcasting ? 'animate-pulse text-red-400' : ''} />
                        </HolographicText>

                        {/* Frequency Visualizer */}
                        <div className="relative overflow-hidden rounded-lg border-2" style={{ borderColor: 'var(--accent-cyan)' }}>
                            <FrequencyVisualizer 
                                isActive={isAISpeaking} 
                                color="cyan" 
                                height={100}
                            />
                        </div>

                        {/* On Air Indicator */}
                        <div className={`news-desk ${isBroadcasting ? 'broadcast-active' : ''}`}>
                            <div className={`news-desk-light ${isBroadcasting ? 'active' : ''}`} />
                            <span className={`news-desk-text ${isBroadcasting ? 'active' : ''}`}>
                                {isBroadcasting ? 'ON AIR' : 'OFF AIR'}
                            </span>
                        </div>

                        {!isBroadcasting ? (
                            <>
                                {/* Category Selection */}
                                <div className="space-y-3">
                                    <HolographicText className="text-xs tracking-wide opacity-70">SELECT NEWS CATEGORY</HolographicText>
                                    <div className="grid grid-cols-2 gap-2">
                                        {NEWS_CATEGORIES.map(category => {
                                            const Icon = category.icon;
                                            return (
                                                <button
                                                    key={category.id}
                                                    onClick={() => {
                                                        setSelectedCategory(category.id);
                                                        setCustomTopic('');
                                                    }}
                                                    className={`p-3 rounded-lg border transition-all flex items-center gap-2 ${
                                                        selectedCategory === category.id
                                                            ? 'bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/20'
                                                            : 'bg-black/20 border-gray-700 hover:border-cyan-600'
                                                    }`}
                                                >
                                                    <Icon size={16} />
                                                    <span className="text-sm">{category.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Custom Topic */}
                                <div className="space-y-2">
                                    <HolographicText className="text-xs tracking-wide opacity-70">OR CUSTOM TOPIC</HolographicText>
                                    <input
                                        type="text"
                                        value={customTopic}
                                        onChange={(e) => setCustomTopic(e.target.value)}
                                        placeholder="Enter any news topic..."
                                        className="w-full bg-black/40 border border-cyan-600/30 rounded-lg p-3 text-sm text-cyan-100 placeholder-cyan-800 focus:outline-none focus:border-cyan-400 transition-colors"
                                        onFocus={() => setSelectedCategory('')}
                                    />
                                </div>

                                {/* Start Button */}
                                <NeonButton
                                    onClick={handleStartBroadcast}
                                    disabled={!selectedCategory && !customTopic.trim()}
                                    fullWidth
                                    size="large"
                                    color="cyan"
                                >
                                    <Radio size={18} />
                                    START BROADCAST
                                </NeonButton>
                            </>
                        ) : (
                            <>
                                {/* Live Transcript */}
                                <HolographicPanel glowColor="purple" withScanlines={false} className="min-h-[200px] max-h-[300px] overflow-y-auto">
                                    <div className="p-4">
                                        <HolographicText 
                                            className="text-sm font-mono leading-relaxed whitespace-pre-wrap" 
                                            glowColor="cyan"
                                        >
                                            {liveTranslatedText || 'Preparing broadcast...'}
                                        </HolographicText>
                                    </div>
                                </HolographicPanel>

                                {/* End Button */}
                                <NeonButton
                                    onClick={endCall}
                                    fullWidth
                                    size="large"
                                    color="red"
                                >
                                    <StopCircle size={18} />
                                    END BROADCAST
                                </NeonButton>
                            </>
                        )}
                    </div>
                </HolographicPanel>

                {/* Instructions */}
                {!isBroadcasting && (
                    <div className="text-center text-xs text-gray-500 space-y-1">
                        <p>🎙️ Professional AI news broadcasting with live voice synthesis</p>
                        <p>Select a category or enter your own topic to begin</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsDesk;