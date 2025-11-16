import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, ChevronsDown } from 'lucide-react';
import type { Message, AiMode, View } from '../lib/types';
import { AI_MODES } from '../lib/constants';

interface DesktopAssistantProps {
    messages: Message[];
    onSendMessage: (text: string) => void;
    isMinimized: boolean;
    setIsMinimized: (isMinimized: boolean) => void;
    setView: (view: View) => void;
    setAiMode: (mode: AiMode) => void;
}

const DesktopAssistant: React.FC<DesktopAssistantProps> = ({ messages, onSendMessage, isMinimized, setIsMinimized, setView, setAiMode }) => {
    const [inputText, setInputText] = useState('');
    const chatLogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatLogRef.current) {
            chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputText.trim()) {
            onSendMessage(inputText.trim());
            setInputText('');
        }
    };
    
    const MessageContent: React.FC<{ message: Message }> = ({ message }) => {
        const text = message.text || '';
        const actionRegex = /\[ACTION:SWITCH_MODE:(\w+)\]/;
        
        // This regex will split the text but keep the delimiters
        const parts = text.split(/(\[ACTION:SWITCH_MODE:\w+\])/g);

        const handleActionClick = (mode: AiMode) => {
            const validMode = AI_MODES.find(m => m.mode === mode);
            if (validMode) {
                setAiMode(mode);
                setView('chat');
                setIsMinimized(true); // Minimize assistant after switching
            }
        };

        return (
            <div>
                {parts.map((part, index) => {
                    const match = part.match(actionRegex);
                    if (match) {
                        const mode = match[1] as AiMode;
                        const modeInfo = AI_MODES.find(m => m.mode === mode);
                        return (
                            <button
                                key={index}
                                onClick={() => handleActionClick(mode)}
                                className="w-full my-2 px-3 py-2 text-sm bg-cyan-900/50 border border-cyan-700 rounded-md hover:bg-cyan-800 text-cyan-300 transition-colors text-left"
                            >
                                Switch to {modeInfo?.name || mode} Mode
                            </button>
                        );
                    }
                    return <span key={index}>{part}</span>;
                })}
            </div>
        );
    };

    if (isMinimized) {
        return (
            <button 
                onClick={() => setIsMinimized(false)}
                className="fixed bottom-[60px] right-4 w-16 h-16 bg-cyan-600/80 hover:bg-cyan-500 backdrop-blur-md border-2 border-cyan-400 rounded-full z-40 flex items-center justify-center text-white shadow-lg animate-pulse-glow"
                title="Open System Assistant"
            >
                <Bot size={32} />
            </button>
        );
    }

    return (
        <div className="desktop-assistant-panel">
            <header className="assistant-header">
                <div className="flex items-center gap-2">
                    <Bot size={20} className="text-cyan-400" />
                    <h2 className="font-bold text-cyan-300">System Assistant</h2>
                </div>
                <button onClick={() => setIsMinimized(true)} className="text-gray-400 hover:text-white transition-colors">
                    <ChevronsDown size={20} />
                </button>
            </header>

            <div ref={chatLogRef} className="assistant-chat-log">
                {messages.map((msg, index) => (
                    <div key={index} className={`assistant-message ${msg.sender === 'user' ? 'user' : 'bot'}`}>
                         <MessageContent message={msg} />
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="assistant-input-area">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask how to use the app..."
                    className="flex-grow bg-black/50 border border-gray-600 rounded-md px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <button type="submit" className="p-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors">
                    <Send size={16} />
                </button>
            </form>
        </div>
    );
};

export default DesktopAssistant;
