import React, { createContext, useContext, ReactNode } from 'react';
import type { Settings, CallRecord, AiMode, Message, View, CallState, LiveReportData, Flashcard, Persona, UserProfile, NewsArticle, WhiteboardElement } from '@/src/lib/types';
import { useCallManagement } from '../hooks/useCallManagement';

interface LiveAPIContextState {
    callState: CallState;
    connectionStatus: string;
    callDuration: number;
    isMuted: boolean;
    isSpeakerOn: boolean;
    isAISpeaking: boolean;
    isUserSpeaking: boolean;
    volume: number;
    aiVolume: number;
    liveOutputTranscription: string;
    liveTranslatedText: string;
    liveMeetingTopics: string[];
    liveReportData: LiveReportData | null;
    persona: Persona;
    speakingPersona: Persona | null;
    aiMode: AiMode;
    setAiMode: (mode: AiMode) => void;
    sendImage: (base64Data: string, mimeType: string) => void;
    sendTextToLiveSession: (text: string) => void;
    startScreenShare: () => void;
    stopScreenShare: () => void;
    isScreenSharing: boolean;
    startCall: (scriptToBroadcast?: { persona: Persona; text: string; audio?: string | null }[], initialText?: string, systemInstructionOverride?: string, chatContext?: string) => void;
    pauseCall: () => void;
    resumeCall: () => void;
    endCall: (finalState?: 'idle' | 'standby') => void;
    toggleMute: () => void;
    toggleSpeaker: () => void;
    // New additions for video call
    isCameraOn: boolean;
    isCameraEnabled: boolean;
    toggleCamera: () => void;
    userMediaStream: MediaStream | null;
    setUserVideoElement: (element: HTMLVideoElement | null) => void;
    setOnCallEndWithData: (callback: () => (polishedTranscript: string, englishTranscript: string, speakerNames: Record<string, string>) => void) => void;
    // New for speaker naming
    detectedSpeakers: Set<string>;
    speakerNames: Record<string, string>;
    setSpeakerNames: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    // New for Global Meeting Mode
    polishedOriginalTranscript: string;
    englishInterpretation: string;
    setShowMeetingModal: (show: boolean) => void;
    isTyping: boolean;
    setIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
    liveSentiment: 'positive' | 'negative' | 'neutral' | null;
    // New for audio flashcard review
    activeFlashcardReview: { cards: Flashcard[]; currentIndex: number } | null;
    startFlashcardAudioReview: (cards: Flashcard[]) => void;
    startMeeting: (language: string, interpretation: boolean) => void;
    sessionNewsHistory: NewsArticle[];
    isMultiAgentMode: boolean;
    broadcastIndex: number;
    outputVolume: number;
    setOutputVolume: (volume: number) => void;
}

const LiveAPIContext = createContext<LiveAPIContextState | undefined>(undefined);

export const useLiveAPIContext = () => {
    const context = useContext(LiveAPIContext);
    if (!context) {
        throw new Error('useLiveAPIContext must be used within a LiveAPIProvider');
    }
    return context;
};

export interface LiveAPIProviderProps {
    children: ReactNode;
    currentUser: UserProfile | null;
    subscriptionIsActive: boolean;
    updateFreeUsage: (seconds: number) => void;
    persona: Persona;
    setPersona: (persona: Persona) => void;
    settings: Settings;
    aiMode: AiMode;
    view: View;
    setToastMessage: (message: string) => void;
    setCallHistory: React.Dispatch<React.SetStateAction<CallRecord[]>>;
    onModeChangeByAI: (mode: AiMode) => void;
    setAiMode: (mode: AiMode) => void;
    switchToChatView: () => void;
    addMessageToChat: (message: Message) => void;
    appendMessageText: (id: number, textChunk: string) => void;
    updateMessageText: (id: number, newText: string) => void;
    setView: (view: View) => void;
    updateSettings: (key: keyof Settings, value: any) => void;
    clearChat: () => void;
    exportChat: () => void;
    speakerNames: Record<string, string>;
    setSpeakerNames: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    setShowMeetingModal: (show: boolean) => void;
    language: string;
    sessionNewsHistory: NewsArticle[];
    isMultiAgentMode: boolean;
    setWhiteboardElements: React.Dispatch<React.SetStateAction<WhiteboardElement[]>>;
}

export const LiveAPIProvider: React.FC<LiveAPIProviderProps> = (props) => {
    const callManagement = useCallManagement(props);

    return (
        <LiveAPIContext.Provider value={callManagement}>
            {props.children}
        </LiveAPIContext.Provider>
    );
};
