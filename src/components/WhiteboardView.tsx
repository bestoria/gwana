import React, { useRef, useEffect, useMemo } from 'react';
import type { Persona, Message, WhiteboardElement } from '@/src/lib/types';
import WhiteboardCanvas from './WhiteboardCanvas';
import { formatTime } from '@/src/lib/utils';

interface WhiteboardViewProps {
    messages: Message[];
    whiteboardElements: WhiteboardElement[];
    onUserDraw: (element: WhiteboardElement) => void;
    onClear: () => void;
    persona: Persona;
}

const WhiteboardView: React.FC<WhiteboardViewProps> = ({ messages, whiteboardElements, onUserDraw, onClear, persona }) => {
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    const visibleMessages = useMemo(() => {
        // Only show messages from the AI or system
        return messages.filter(msg => msg.sender !== 'user');
    }, [messages]);

    return (
        <div className="h-full w-full flex flex-col md:flex-row p-4 gap-4 bg-transparent">
            <div className="flex-1 h-full min-h-[300px] md:min-h-0">
                <WhiteboardCanvas 
                    elements={whiteboardElements}
                    onUserDraw={onUserDraw}
                    onClear={onClear}
                />
            </div>
            <div className="w-full md:w-1/3 max-w-sm h-full flex flex-col bg-black/30 border border-[var(--border-color)] rounded-lg shadow-lg">
                <div className="p-3 border-b border-[var(--border-color)] flex-shrink-0">
                    <h2 className="font-mono text-cyan-300 font-semibold tracking-widest">COMMS LOG</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-4">
                    {visibleMessages.map(msg => (
                        <div key={msg.id} className="flex flex-col animate-fade-in">
                            <div className="flex items-center gap-2">
                                <span className={`font-bold text-sm ${msg.sender === 'user' ? 'text-cyan-400' : 'text-fuchsia-400'}`}>
                                    {msg.sender === 'user' ? 'USER' : persona.toUpperCase().replace(' ', '_')}
                                </span>
                                <span className="text-xs text-gray-500">{msg.time}</span>
                            </div>
                            <div className="text-gray-200 text-sm mt-1 whitespace-pre-wrap break-words">{msg.text}</div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>
            </div>
        </div>
    );
};

export default WhiteboardView;