import React from 'react';
import { AI_MODES } from '@/src/lib/constants';
import type { AiMode, CallState } from '@/src/lib/types';

interface GlobalModeSelectorProps {
    aiMode: AiMode;
    setAiMode: (mode: AiMode) => void;
    callState: CallState;
}

const GlobalModeSelector: React.FC<GlobalModeSelectorProps> = ({ aiMode, setAiMode, callState }) => {
    const isCallActive = callState !== 'idle' && callState !== 'standby';

    return (
        <div className="relative z-20 flex justify-center py-2 flex-shrink-0 bg-black/10">
            <div className="flex items-center gap-1 bg-black/30 border border-cyan-500/20 p-1 rounded-xl backdrop-blur-sm shadow-lg">
                {AI_MODES.map(mode => {
                    const Icon = mode.iconComponent;
                    const isActive = aiMode === mode.mode;
                    return (
                        <button
                            key={mode.mode}
                            onClick={() => setAiMode(mode.mode)}
                            disabled={isCallActive}
                            title={mode.name}
                            className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg transition-all duration-200 relative group min-w-[60px] h-12 sm:px-3 sm:min-w-[70px] sm:h-14 ${isActive ? 'bg-cyan-900/50' : 'hover:bg-gray-800'} ${isCallActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className={`text-[9px] sm:text-[10px] font-mono font-bold uppercase transition-colors ${isActive ? 'text-cyan-300' : 'text-gray-400 group-hover:text-gray-200'}`}>{mode.name}</span>
                            <Icon className={`h-4 w-4 sm:h-5 sm:w-5 mt-1 transition-colors ${isActive ? 'text-cyan-300' : 'text-gray-400 group-hover:text-white'}`} />
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default GlobalModeSelector;