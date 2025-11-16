import React from 'react';
import { Volume2, VolumeX, MessageSquare, BrainCircuit, Lightbulb, User } from 'lucide-react';
import type { Message } from '@/src/lib/types';

const MessageActionsToolbar: React.FC<{
    message: Message;
    isPlaying: boolean;
    playTTS: (audio: string, id: number) => void;
    handleAction: (action: 'summarize' | 'explain' | 'eli5' | 'teach-back', text: string) => void;
}> = ({ message, isPlaying, playTTS, handleAction }) => {
    if ((!message.text || (message.text.match(/\n/g) || []).length < 2 && message.text.length < 150) && !message.ttsAudio) {
        return null;
    }

    return (
        <div className="mt-3 flex items-center gap-2 border-t border-cyan-500/10 pt-2 flex-wrap">
            <button
                onClick={() => playTTS(message.ttsAudio!, message.id)}
                disabled={!message.ttsAudio}
                title={isPlaying ? "Stop" : "Read aloud"}
                className="flex items-center gap-1.5 px-2 py-1 bg-black/30 rounded-md text-xs text-gray-300 hover:bg-cyan-900/50 disabled:opacity-50 transition-colors"
            >
                {isPlaying ? <VolumeX size={14} className="text-cyan-400" /> : <Volume2 size={14} />}
                Listen
            </button>
            <button
                onClick={() => handleAction('summarize', message.text!)}
                title="Summarize this message"
                className="flex items-center gap-1.5 px-2 py-1 bg-black/30 rounded-md text-xs text-gray-300 hover:bg-cyan-900/50 transition-colors"
            >
                <MessageSquare size={14} /> Summarize
            </button>
            <button
                onClick={() => handleAction('explain', message.text!)}
                title="Explain this differently"
                className="flex items-center gap-1.5 px-2 py-1 bg-black/30 rounded-md text-xs text-gray-300 hover:bg-cyan-900/50 transition-colors"
            >
                <BrainCircuit size={14} /> Explain Differently
            </button>
             <button
                onClick={() => handleAction('eli5', message.text!)}
                title="Explain Like I'm 5"
                className="flex items-center gap-1.5 px-2 py-1 bg-black/30 rounded-md text-xs text-gray-300 hover:bg-cyan-900/50 transition-colors"
            >
                <Lightbulb size={14} /> ELI5
            </button>
            <button
                onClick={() => handleAction('teach-back', message.text!)}
                title="Explain this back to the AI to test your understanding"
                className="flex items-center gap-1.5 px-2 py-1 bg-black/30 rounded-md text-xs text-gray-300 hover:bg-cyan-900/50 transition-colors"
            >
                <User size={14} /> Teach Back
            </button>
        </div>
    );
};

export default MessageActionsToolbar;