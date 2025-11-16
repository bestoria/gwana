import React from 'react';
import { Play, Pause, Loader, Volume2, VolumeX, StopCircle } from 'lucide-react';
import { Persona } from '@/src/lib/types';
import { useLiveAPIContext } from '../contexts/LiveAPIContext';

interface LiveRadioPlayerProps {
    headlines: { persona: Persona; text: string; audio?: string | null }[];
    onPlaybackControl: (action: 'play-pause-resume' | 'stop', options?: { location: string; category: string }) => void;
    isGeneratingRadio: boolean;
    currentIndex: number;
    location: string;
    setLocation: (location: string) => void;
    category: string;
    setCategory: (category: string) => void;
}

const LiveRadioPlayer: React.FC<LiveRadioPlayerProps> = ({
    headlines,
    onPlaybackControl,
    isGeneratingRadio,
    currentIndex,
    location,
    setLocation,
    category,
    setCategory,
}) => {
    const { callState, outputVolume, setOutputVolume } = useLiveAPIContext();
    const [isMuted, setIsMuted] = React.useState(false);
    const volumeBeforeMute = React.useRef(outputVolume);
    
    const isPlaying = callState === 'connected';
    const isPaused = callState === 'paused';
    const canStop = isPlaying || isPaused;
    const isPlaybackActive = isPlaying || isPaused;

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setOutputVolume(newVolume);
        if (newVolume > 0 && isMuted) {
            setIsMuted(false);
        }
    };

    const toggleMute = () => {
        if (isMuted) {
            setOutputVolume(volumeBeforeMute.current);
            setIsMuted(false);
        } else {
            volumeBeforeMute.current = outputVolume;
            setOutputVolume(0);
            setIsMuted(true);
        }
    };


    const currentSegment = headlines[currentIndex];
    
    let teleprompterText: string;
    if (isGeneratingRadio) {
        teleprompterText = "GENERATING BRIEFING...";
    } else if (callState === 'paused') {
        teleprompterText = "|| PAUSED";
    } else if (isPlaying && currentSegment) {
        teleprompterText = currentSegment.text;
    } else if (headlines.length > 0) {
        teleprompterText = "DAILY BRIEFING READY";
    } else {
        teleprompterText = "PRESS PLAY FOR DAILY BRIEFING OR REQUEST A TOPIC BELOW";
    }


    return (
        <div className="broadcast-console-container">
            <div className={`broadcast-console ${isPlaying ? 'playing' : ''}`}>
                <div className="relative">
                    <div className="on-air-light"></div>
                    <h2 className="text-center text-sm text-gray-400 font-bold tracking-widest">WEBZERO NEWS NETWORK</h2>
                </div>
                
                <div className="console-display">
                    {currentSegment && isPlaying && (
                        <div className={`text-xs font-bold text-center mb-1 ${currentSegment.persona === 'Agent Zero' ? 'text-cyan-400' : 'text-fuchsia-400'}`}>
                            NOW: {currentSegment.persona.toUpperCase()}
                        </div>
                    )}
                    <div className="frequency-display">
                        <span key={currentIndex} className="teleprompter-text">
                            {teleprompterText}
                        </span>
                    </div>
                    <div className="vu-meters">
                        <div className="vu-meter">
                            <div className="vu-meter-bar"></div>
                        </div>
                         <div className="vu-meter">
                            <div className="vu-meter-bar" style={{animationDelay: '-0.15s'}}></div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex gap-4 px-2">
                        <div className="flex-1">
                            <label htmlFor="news-location" className="block text-xs text-gray-400 mb-1">LOCATION</label>
                            <select
                                id="news-location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                disabled={isPlaybackActive || isGeneratingRadio}
                                className="w-full bg-black/50 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
                            >
                                <option>Nigeria</option>
                                <option>Africa</option>
                                <option>United States</option>
                                <option>United Kingdom</option>
                                <option>International</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label htmlFor="news-category" className="block text-xs text-gray-400 mb-1">CATEGORY</label>
                            <select
                                id="news-category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                disabled={isPlaybackActive || isGeneratingRadio}
                                className="w-full bg-black/50 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
                            >
                                <option>General</option>
                                <option>Politics</option>
                                <option>Business</option>
                                <option>Technology</option>
                                <option>Entertainment</option>
                                <option>Sports</option>
                            </select>
                        </div>
                    </div>
                    <div className="w-full bg-gray-900/50 h-1.5 rounded-full">
                        <div 
                            className="bg-cyan-400 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${headlines.length > 0 ? ((currentIndex + 1) / headlines.length) * 100 : 0}%`}}
                        />
                    </div>
                    <div className="console-controls">
                        <button onClick={toggleMute} className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 text-white hover:bg-white/20 transition-all shadow-md" title={isMuted ? "Unmute" : "Mute"}>
                             {isMuted || outputVolume === 0 ? <VolumeX size={22} /> : <Volume2 size={22} />}
                        </button>
                        <button
                            onClick={() => onPlaybackControl('play-pause-resume', { location, category })}
                            disabled={isGeneratingRadio}
                            className={`play-pause-btn ${isPlaying ? 'playing' : ''}`}
                            aria-label={isPlaying ? 'Pause Briefing' : 'Play Briefing'}
                        >
                            {isGeneratingRadio ? <Loader size={32} className="animate-spin text-cyan-300" /> : (isPlaying ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" className="ml-1" />)}
                        </button>
                        <button
                            onClick={() => onPlaybackControl('stop')}
                            disabled={!canStop}
                            className={`w-12 h-12 rounded-full flex items-center justify-center bg-red-600/50 text-white hover:bg-red-600 transition-all shadow-md ${!canStop && 'opacity-0 pointer-events-none'}`}
                            title="Stop Briefing"
                        >
                            <StopCircle size={24} />
                        </button>
                    </div>
                     <div className="flex items-center gap-2 px-2">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={outputVolume}
                            onChange={handleVolumeChange}
                            disabled={isMuted}
                            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveRadioPlayer;
