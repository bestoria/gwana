import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Send, Keyboard, X, Play, Pause, Volume2, VolumeX, Mic, MicOff, Paperclip, Image as ImageIcon, FileText, BrainCircuit, UploadCloud, Users, Compass, Sheet, ScreenShare } from 'lucide-react';
import type { Message, Settings, View, ProactiveSuggestion, AiMode, ProactiveCalendarSuggestionContent, DataFileContent, Persona } from '@/src/lib/types';
import { audioManager, throttle } from '@/src/lib/utils';
import { useLiveAPIContext } from '@/src/contexts/LiveAPIContext';
import ProactiveCalendarSuggestion from '@/src/shared/components/ProactiveCalendarSuggestion';

interface ChatInputProps {
    inputText: string;
    setInputText: (text: string) => void;
    handleSendMessage: (text: string, image: any, document: any, replyingTo: Message | null) => void;
    replyingTo: Message | null;
    setReplyingTo: (msg: Message | null) => void;
    selectedImage: { data: string; mimeType: string; preview: string } | null;
    setSelectedImage: (img: { data: string; mimeType: string; preview: string } | null) => void;
    settings: Settings;
    textInputRef: React.RefObject<HTMLInputElement>;
    view: View;
    persona: Persona;
    selectedDocument: { name: string; content: string; type: string; } | null;
    proactiveSuggestion: ProactiveSuggestion | null;
    onAcceptSuggestion: () => void;
    onDismissSuggestion: () => void;
    proactiveCalendarSuggestion: ProactiveCalendarSuggestionContent | null;
    onAcceptCalendarSuggestion: () => void;
    onDismissCalendarSuggestion: () => void;
    aiMode: AiMode;
    setView: (view: View) => void;
    isDesktop: boolean;
    handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    setSelectedDocument: (doc: { name: string; content: string; type: string; } | null) => void;
    handleDocumentSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isAIGuessing: boolean;
    handleGuessResponse: (isCorrect: boolean) => void;
    cancelPrediction: () => void;
    resumeContent: { name: string; content: string } | null;
    setResumeContent: (resume: { name: string; content: string } | null) => void;
    handleResumeSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    selectedDataFile: DataFileContent | null;
    setSelectedDataFile: (file: DataFileContent | null) => void;
    handleDataFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ChatInput: React.FC<ChatInputProps> = (props) => {
    const { 
        inputText, setInputText, handleSendMessage, replyingTo, setReplyingTo, 
        settings, textInputRef, proactiveSuggestion, onAcceptSuggestion, 
        onDismissSuggestion, isDesktop, aiMode, handleImageSelect, handleDocumentSelect,
        selectedImage, setSelectedImage, selectedDocument, setSelectedDocument,
        resumeContent, setResumeContent, handleResumeSelect,
        proactiveCalendarSuggestion, onAcceptCalendarSuggestion, onDismissCalendarSuggestion,
        selectedDataFile, setSelectedDataFile, handleDataFileSelect
    } = props;
    
    const imageInputRef = useRef<HTMLInputElement>(null);
    const docInputRef = useRef<HTMLInputElement>(null);
    const resumeInputRef = useRef<HTMLInputElement>(null);
    const dataInputRef = useRef<HTMLInputElement>(null);

    const { callState } = useLiveAPIContext();
    const throttledTypeSound = useCallback(throttle(() => audioManager.playSound('type'), 150), []);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);
        throttledTypeSound();
    };

    const handleSendMessageWrapper = (text: string, image: any, doc: any, reply: any) => {
        handleSendMessage(text, image, doc, reply);
        audioManager.playSound('send');
        setInputText('');
        setSelectedImage(null);
        setSelectedDocument(null);
        setSelectedDataFile(null);
        setReplyingTo(null);
    };
    
    const isSessionConnected = useMemo(() => callState === 'connected', [callState]);

    const renderBanners = () => (
        <>
            {proactiveCalendarSuggestion && (
                <ProactiveCalendarSuggestion
                    suggestion={proactiveCalendarSuggestion}
                    onAccept={onAcceptCalendarSuggestion}
                    onDismiss={onDismissCalendarSuggestion}
                />
            )}
            {proactiveSuggestion && (
                 <div className="mb-2 px-3 py-2 bg-purple-900/50 border border-purple-500/50 rounded-lg flex items-center justify-between gap-4 animate-fade-in" role="alert">
                    <div className="flex items-center gap-2">
                        <BrainCircuit size={20} className="text-purple-300"/>
                        <p className="text-sm text-gray-200">{proactiveSuggestion.suggestionText}</p>
                    </div>
                     <div className="flex gap-2">
                        <button onClick={onAcceptSuggestion} className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 rounded-md">Yes</button>
                        <button onClick={onDismissSuggestion} className="p-1 hover:bg-purple-500/20 rounded-full"><X size={16}/></button>
                    </div>
                 </div>
            )}
            {replyingTo && (
                <div className="mb-2 px-3 py-2 bg-cyan-900/30 border border-cyan-500/30 rounded-lg flex items-center justify-between animate-fade-in" aria-label={`Replying to ${replyingTo.sender}`}>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-xs text-cyan-300 font-mono">REPLYING</p>
                        <p className="text-sm text-gray-300 truncate">{replyingTo.text}</p>
                    </div>
                    <button onClick={() => setReplyingTo(null)} className="text-gray-500 hover:text-white" title="Cancel Reply" aria-label="Cancel reply"><X size={18} /></button>
                </div>
            )}
            {selectedImage && (
                <div className="mb-2 px-3 py-2 bg-cyan-900/30 border border-cyan-500/30 rounded-lg flex items-center justify-between animate-fade-in">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <ImageIcon size={18} className="text-cyan-300 flex-shrink-0" />
                        <img src={selectedImage.preview} alt="Selected preview" className="w-8 h-8 rounded object-cover"/>
                        <p className="text-sm text-gray-300 truncate">Image selected</p>
                    </div>
                    <button onClick={() => setSelectedImage(null)} className="text-gray-500 hover:text-white" title="Remove Image"><X size={18} /></button>
                </div>
            )}
            {selectedDocument && (
                <div className="mb-2 px-3 py-2 bg-cyan-900/30 border border-cyan-500/30 rounded-lg flex items-center justify-between animate-fade-in">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <FileText size={18} className="text-cyan-300 flex-shrink-0" />
                        <p className="text-sm text-gray-300 truncate">{selectedDocument.name}</p>
                    </div>
                    <button onClick={() => setSelectedDocument(null)} className="text-gray-500 hover:text-white" title="Remove Document"><X size={18} /></button>
                </div>
            )}
            {selectedDataFile && (
                <div className="mb-2 px-3 py-2 bg-cyan-900/30 border border-cyan-500/30 rounded-lg flex items-center justify-between animate-fade-in">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <Sheet size={18} className="text-cyan-300 flex-shrink-0" />
                        <p className="text-sm text-gray-300 truncate">{selectedDataFile.name}</p>
                    </div>
                    <button onClick={() => setSelectedDataFile(null)} className="text-gray-500 hover:text-white" title="Remove Data File"><X size={18} /></button>
                </div>
            )}
        </>
    );
    
    const showChatInput = aiMode !== 'news' && aiMode !== 'quiz' && aiMode !== 'debate' && aiMode !== 'translator';
    if (!showChatInput) return null;

    return (
        <div className="bg-transparent px-3 py-2 flex-shrink-0 z-10">
            {renderBanners()}
            
            <div id="onboarding-input-container" className="bg-black/50 backdrop-blur-md border border-[var(--border-color)] rounded-lg p-1.5 flex flex-col sm:flex-row items-center gap-2">
                <div className="flex-1 w-full flex items-center gap-2">
                     <input type="file" ref={imageInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
                     <input type="file" ref={docInputRef} onChange={handleDocumentSelect} accept=".pdf,.docx,.txt,.md" className="hidden" />
                     <input type="file" ref={dataInputRef} onChange={handleDataFileSelect} accept=".csv" className="hidden" />
                    
                    <button onClick={() => imageInputRef.current?.click()} className="p-2 text-gray-300 hover:text-white" title="Upload Image"><ImageIcon size={20} /></button>
                    <button onClick={() => docInputRef.current?.click()} className="p-2 text-gray-300 hover:text-white" title="Upload Document"><FileText size={20} /></button>
                    {(aiMode === 'default') && (
                        <button onClick={() => dataInputRef.current?.click()} className="p-2 text-gray-300 hover:text-white" title="Upload Data (CSV)">
                            <Sheet size={20} />
                        </button>
                    )}

                    <input 
                        ref={textInputRef} type="text" value={inputText} onChange={handleInputChange} 
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessageWrapper(inputText, selectedImage, selectedDocument, replyingTo)} 
                        placeholder={isSessionConnected ? "Type a message..." : "Type to start a session..."}
                        className="w-full bg-black/50 border border-[var(--border-color)] rounded-full px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-sm shadow-sm text-gray-200 font-mono"
                    />
                    
                    <button 
                        onClick={() => handleSendMessageWrapper(inputText, selectedImage, selectedDocument, replyingTo)} 
                        disabled={!inputText.trim() && !selectedImage && !selectedDocument && !selectedDataFile}
                        className="w-11 h-11 bg-cyan-600 rounded-full flex-shrink-0 flex items-center justify-center text-white hover:bg-cyan-500 transition-all shadow-lg disabled:bg-gray-600 disabled:opacity-70" 
                        title="Send Message" 
                        aria-label="Send message"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInput;