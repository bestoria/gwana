import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type { LiveServerMessage, Modality } from '@google/genai';
import { connectToLive, createAudioBlob, detectSentiment, generateSpeech, polishTranscript } from '../services/geminiService';
import { decode, decodeAudioData, blobToBase64, audioManager, saveMemoryFragment } from '@/src/lib/utils';
import { addCalendarEvent } from '../services/calendarService';
import type { CallState, LiveSession, LiveCallbacks, LiveReportData, CallRecord, AiMode, Message, Persona, Settings, View, Flashcard, ToolCallInfo, ActionItem, NewsContent, NewsArticle, WhiteboardElement } from '@/src/lib/types';
import type { LiveAPIProviderProps } from '../contexts/LiveAPIContext';
import { AUDIO_CONFIG, VOICE_NAMES } from '@/src/lib/constants';

export function useCallManagement({
  currentUser, subscriptionIsActive, updateFreeUsage, persona, setPersona, settings, aiMode, view, setToastMessage, setCallHistory, onModeChangeByAI,
  setAiMode, switchToChatView, addMessageToChat, appendMessageText, setView, updateSettings,
  clearChat, exportChat, speakerNames, setSpeakerNames, setShowMeetingModal, language, updateMessageText, sessionNewsHistory, isMultiAgentMode,
  setWhiteboardElements,
}: Omit<LiveAPIProviderProps, 'children'>) {
    const [callState, setCallState] = useState<CallState>('idle');
    const [connectionStatus, setConnectionStatus] = useState('Offline');
    const [callDuration, setCallDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);
    const [isAISpeaking, setIsAISpeaking] = useState(false);
    const [isUserSpeaking, setIsUserSpeaking] = useState(false);
    const [volume, setVolume] = useState(0);
    const [liveTranslatedText, setLiveTranslatedText] = useState('');
    const [aiVolume, setAiVolume] = useState(0);
    const [liveOutputTranscription, setLiveOutputTranscription] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [liveMeetingTopics, setLiveMeetingTopics] = useState<string[]>([]);
    const [liveReportData, setLiveReportData] = useState<LiveReportData | null>(null);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [userMediaStream, setUserMediaStream] = useState<MediaStream | null>(null);
    const [userVideoElement, setUserVideoElement] = useState<HTMLVideoElement | null>(null);
    const [detectedSpeakers, setDetectedSpeakers] = useState<Set<string>>(new Set());
    const [polishedOriginalTranscript, setPolishedOriginalTranscript] = useState('');
    const [englishInterpretation, setEnglishInterpretation] = useState('');
    const [liveSentiment, setLiveSentiment] = useState<'positive' | 'negative' | 'neutral' | null>(null);
    const [activeFlashcardReview, setActiveFlashcardReview] = useState<{ cards: Flashcard[]; currentIndex: number } | null>(null);
    const [isApiKeySelected, setIsApiKeySelected] = useState(false);
    const [broadcastIndex, setBroadcastIndex] = useState(0);
    const [speakingPersona, setSpeakingPersona] = useState<Persona | null>(null);
    const [outputVolume, setOutputVolume] = useState(1);

    const liveSessionRef = useRef<LiveSession | null>(null);
    const audioContextRefs = useRef({ input: null as AudioContext | null, output: null as AudioContext | null });
    const outputGainNodeRef = useRef<GainNode | null>(null);
    const aiOutputAnalyserNodeRef = useRef<AnalyserNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const screenStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const analyserNodeRef = useRef<AnalyserNode | null>(null);
    const speakingTimerRef = useRef<number | null>(null);
    const callTimerRef = useRef<number | null>(null);
    const audioQueue = useRef<{ source: AudioBufferSourceNode, buffer: AudioBuffer }[]>([]);
    const nextStartTime = useRef(0);
    const onCallEndWithDataRef = useRef<(p: string, e: string, s: Record<string, string>) => void>();
    const lastMessageIdRef = useRef<number | null>(null);
    const currentTurnOwnerRef = useRef<'user' | 'bot' | null>(null);
    const currentUserTurnTextRef = useRef('');
    const lastUserMessageIdRef = useRef<number | null>(null);
    const currentBotTurnTextRef = useRef('');
    const conversationHistoryRef = useRef<string[]>([]);
    const frameIntervalRef = useRef<number | null>(null);
    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const isBroadcastingRef = useRef(false);
    const broadcastScriptRef = useRef<{ persona: Persona; text: string; audio?: string | null }[]>([]);
    const currentBroadcastSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const activeAudioSourcesRef = useRef(new Set<AudioBufferSourceNode>());
    
    const callStateRef = useRef(callState);
    useEffect(() => { callStateRef.current = callState; }, [callState]);

    useEffect(() => {
        if (outputGainNodeRef.current) {
            outputGainNodeRef.current.gain.value = outputVolume;
        }
    }, [outputVolume]);

    useEffect(() => {
        const checkKey = async () => {
            if (window.aistudio && (await window.aistudio.hasSelectedApiKey())) {
                setIsApiKeySelected(true);
            }
        };
        checkKey();
    }, []);

    const endBroadcast = useCallback(() => {
        if (currentBroadcastSourceRef.current) {
            try {
                currentBroadcastSourceRef.current.onended = null;
                currentBroadcastSourceRef.current.stop();
            } catch (e) { /* already stopped */ }
            currentBroadcastSourceRef.current = null;
        }
        isBroadcastingRef.current = false;
        broadcastScriptRef.current = [];
        setBroadcastIndex(0);
        setIsAISpeaking(false);
        setSpeakingPersona(null);
    }, []);

    const stopScreenShare = useCallback(() => {
        if (frameIntervalRef.current) {
            clearInterval(frameIntervalRef.current);
            frameIntervalRef.current = null;
        }
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => track.stop());
            screenStreamRef.current = null;
        }
        if(isScreenSharing) {
            setIsScreenSharing(false);
            setToastMessage("Screen sharing stopped.");
        }
    }, [isScreenSharing, setToastMessage]);
    
    const endCall = useCallback((finalState: 'idle' | 'standby' = 'idle') => {
        // Guard against multiple end-call operations on an already idle session.
        if (!['connected', 'paused', 'connecting', 'ringing'].includes(callStateRef.current)) {
            return; 
        }

        setCallState('disconnecting');
        
        // Stop all audio playback
        audioManager.stopRingtone();
        endBroadcast(); // Handles broadcast-specific sources & state

        // Handles regular AI speech-out queue
        for (const source of activeAudioSourcesRef.current) {
            try {
                source.stop();
            } catch (e) { /* already stopped */ }
        }
        activeAudioSourcesRef.current.clear();
        nextStartTime.current = 0;

        // Cleanup timers
        if (callTimerRef.current) {
            clearInterval(callTimerRef.current);
            callTimerRef.current = null;
        }
        
        // Cleanup media streams and devices
        stopScreenShare();

        if (userMediaStream) {
            userMediaStream.getTracks().forEach(track => track.stop());
            setUserMediaStream(null);
        }

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        
        // Cleanup audio context nodes
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.onaudioprocess = null;
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (analyserNodeRef.current) {
            analyserNodeRef.current.disconnect();
            analyserNodeRef.current = null;
        }
        if (gainNodeRef.current) {
            gainNodeRef.current.disconnect();
            gainNodeRef.current = null;
        }

        // Close API session
        if (liveSessionRef.current) {
             try {
                liveSessionRef.current.close();
            } catch(e) { /* Already closed */ }
            liveSessionRef.current = null;
        }
        
        sessionPromiseRef.current = null;

        // Finalize meeting data if applicable
        if (onCallEndWithDataRef.current && aiMode === 'meeting') {
            onCallEndWithDataRef.current(polishedOriginalTranscript, englishInterpretation, speakerNames);
        }

        // Record call duration
        if (callDuration > 0) {
            const newRecord: CallRecord = {
                id: Date.now(),
                duration: callDuration,
                timestamp: Date.now() - callDuration * 1000,
                type: 'outgoing'
            };
            setCallHistory(prev => [newRecord, ...prev]);
            if (subscriptionIsActive && currentUser) {
                updateFreeUsage(callDuration);
            }
        }
        
        // Reset all call-related state
        setCallDuration(0);
        setIsUserSpeaking(false);
        setIsAISpeaking(false);
        setSpeakingPersona(null);
        setVolume(0);
        setAiVolume(0);
        setLiveOutputTranscription('');
        setLiveTranslatedText('');
        setLiveMeetingTopics([]);
        setLiveReportData(null);
        setPolishedOriginalTranscript('');
        setEnglishInterpretation('');
        setActiveFlashcardReview(null);

        setCallState(finalState);

    }, [
        endBroadcast, stopScreenShare, userMediaStream, aiMode, polishedOriginalTranscript, englishInterpretation, 
        speakerNames, callDuration, setCallHistory, subscriptionIsActive, currentUser, updateFreeUsage,
        setCallState, setCallDuration, setIsUserSpeaking, setIsAISpeaking, setSpeakingPersona, setVolume,
        setAiVolume, setLiveOutputTranscription, setLiveTranslatedText, setLiveMeetingTopics, setLiveReportData,
        setPolishedOriginalTranscript, setEnglishInterpretation, setActiveFlashcardReview, setUserMediaStream
    ]);


    const toggleMute = useCallback(() => setIsMuted(prev => !prev), []);
    const toggleSpeaker = useCallback(() => setIsSpeakerOn(prev => !prev), []);

    const sendImage = useCallback((base64Data: string, mimeType: string) => {
        sessionPromiseRef.current?.then((session) => {
            session.sendRealtimeInput({
              media: { data: base64Data, mimeType: mimeType }
            });
            setToastMessage("Image sent to live session.");
        });
    }, [setToastMessage]);
    
    const sendTextToLiveSession = useCallback((text: string) => {
        if(text.trim()) {
             sessionPromiseRef.current?.then((session) => {
                session.sendRealtimeInput({ text });
            });
        }
    }, []);

    const startScreenShare = useCallback(async () => {
        if (isScreenSharing) return;
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
            screenStreamRef.current = stream;
            const videoTrack = stream.getVideoTracks()[0];
            const videoEl = document.createElement('video');
            videoEl.srcObject = stream;
            videoEl.play();

            const canvasEl = document.createElement('canvas');
            const ctx = canvasEl.getContext('2d');
            
            frameIntervalRef.current = window.setInterval(() => {
                if (ctx) {
                    canvasEl.width = videoEl.videoWidth;
                    canvasEl.height = videoEl.videoHeight;
                    ctx.drawImage(videoEl, 0, 0, videoEl.videoWidth, videoEl.videoHeight);
                    canvasEl.toBlob(
                        async (blob) => {
                            if (blob) {
                                const base64Data = await blobToBase64(blob);
                                sessionPromiseRef.current?.then((session) => {
                                    session.sendRealtimeInput({ media: { data: base64Data, mimeType: 'image/jpeg' } });
                                });
                            }
                        },
                        'image/jpeg',
                        0.7
                    );
                }
            }, 1000 / 5); // 5 FPS

            videoTrack.onended = () => stopScreenShare();
            setIsScreenSharing(true);
            setToastMessage("Screen sharing started.");
        } catch (error) {
            console.error("Screen share failed:", error);
            setToastMessage("Could not start screen sharing.");
            stopScreenShare();
        }
    }, [isScreenSharing, setToastMessage, stopScreenShare]);

    const playNextBroadcastSegment = useCallback(async () => {
        if (!isBroadcastingRef.current || broadcastIndex >= broadcastScriptRef.current.length) {
// FIX: Replaced endCall() with endCall('standby') to provide the required argument and ensure the call state is correctly updated.
            endCall('standby');
            return;
        }

        const segment = broadcastScriptRef.current[broadcastIndex];
        setSpeakingPersona(segment.persona);
        setIsAISpeaking(true);
        
        if (segment.audio) {
            try {
                const audioData = decode(segment.audio);
                const audioBuffer = await decodeAudioData(audioData, audioContextRefs.current.output!, AUDIO_CONFIG.OUTPUT_SAMPLE_RATE, AUDIO_CONFIG.NUM_CHANNELS);
                const source = audioContextRefs.current.output!.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputGainNodeRef.current!);
                
                source.onended = () => {
                    setBroadcastIndex(prev => prev + 1);
                };

                source.start();
                currentBroadcastSourceRef.current = source;
            } catch (e) {
                 console.error("Failed to play broadcast audio:", e);
                 setBroadcastIndex(prev => prev + 1); // Skip to next if audio fails
            }
        } else {
             setTimeout(() => setBroadcastIndex(prev => prev + 1), 1000);
        }

    }, [broadcastIndex, endCall]);

    useEffect(() => {
        if (isBroadcastingRef.current) {
            playNextBroadcastSegment();
        }
    }, [broadcastIndex, playNextBroadcastSegment]);
    
    const handleFunctionCall = useCallback((toolCallInfo: ToolCallInfo) => {
        // This is where you would implement the logic for each function call.
        // For example:
        switch (toolCallInfo.toolName) {
            case 'end_call':
                endCall('standby');
                break;
            case 'set_ai_mode':
                setAiMode(toolCallInfo.args.mode);
                break;
            case 'display_in_text_mode':
                switchToChatView();
                let content;
                try {
                    content = JSON.parse(toolCallInfo.args.content);
                } catch(e) {
                    content = { text: toolCallInfo.args.content };
                }

                const message: Message = {
                    id: Date.now(),
                    sender: 'bot',
                    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    timestamp: Date.now(),
                    status: 'read',
                    persona: persona,
                    news: content.articles ? ({ articles: content.articles } as NewsContent) : undefined,
                    text: content.text,
                };
                addMessageToChat(message);
                break;
            case 'navigate_to_view':
                setView(toolCallInfo.args.view);
                break;
            case 'update_setting':
                updateSettings(toolCallInfo.args.setting_key, toolCallInfo.args.setting_value);
                break;
            case 'toggle_persona':
                setPersona(persona === 'Agent Zero' ? 'Agent Zara' : 'Agent Zero');
                break;
            case 'clear_chat_log':
                clearChat();
                break;
            case 'export_chat_log':
                exportChat();
                break;
            case 'propose_next_actions':
                if (toolCallInfo.args.suggestions) {
                    const message: Message = {
                        id: Date.now(),
                        sender: 'bot',
                        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                        timestamp: Date.now(),
                        status: 'read',
                        persona: persona,
                        suggestions: toolCallInfo.args.suggestions,
                    };
                    addMessageToChat(message);
                }
                break;
            case 'create_memory':
                saveMemoryFragment(persona, {
                    topic: toolCallInfo.args.topic,
                    summary: toolCallInfo.args.summary,
                    related_entities: toolCallInfo.args.related_entities || [],
                    timestamp: Date.now(),
                    mode: aiMode,
                });
                break;
            case 'whiteboard_draw':
                if (toolCallInfo.args.elements) {
                    setWhiteboardElements(prev => [...prev, ...toolCallInfo.args.elements]);
                }
                break;
            case 'generate_interactive_chart':
                 const chartMessage: Message = {
                    id: Date.now(),
                    sender: 'bot',
                    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    timestamp: Date.now(),
                    status: 'read',
                    persona: persona,
                    interactiveChart: toolCallInfo.args,
                };
                addMessageToChat(chartMessage);
                break;
            case 'schedule_event':
                const startTime = new Date(toolCallInfo.args.startTime).getTime();
                const endTime = new Date(toolCallInfo.args.endTime).getTime();
                addCalendarEvent({
                    title: toolCallInfo.args.title,
                    description: toolCallInfo.args.description || '',
                    startTime,
                    endTime,
                }).then(() => {
                    setToastMessage(`Event "${toolCallInfo.args.title}" scheduled!`);
                });
                break;
            // Add other function call handlers here
        }
    }, [endCall, setAiMode, switchToChatView, addMessageToChat, updateSettings, clearChat, exportChat, setPersona, setToastMessage, persona, setWhiteboardElements, aiMode]);

    const startCall = useCallback(async (
        scriptToBroadcast?: { persona: Persona; text: string; audio?: string | null }[],
        initialText?: string,
        systemInstructionOverride?: string,
        chatContext?: string
    ) => {
        if (callState !== 'idle' && callState !== 'standby') return;
        setCallState('ringing');
        audioManager.playRingtone();
        
        // Simulate ringing
        await new Promise(resolve => setTimeout(resolve, 2000));
        audioManager.stopRingtone();
        setCallState('connecting');

        if (scriptToBroadcast && scriptToBroadcast.length > 0) {
            isBroadcastingRef.current = true;
            broadcastScriptRef.current = scriptToBroadcast;
            setBroadcastIndex(0); // This will trigger the useEffect to start playback
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isCameraOn });
            if (isCameraOn) setUserMediaStream(stream);
            mediaStreamRef.current = stream;

            // ... rest of the setup from the original file
            const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: AUDIO_CONFIG.INPUT_SAMPLE_RATE });
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: AUDIO_CONFIG.OUTPUT_SAMPLE_RATE });
            audioContextRefs.current = { input: inputAudioContext, output: outputAudioContext };

            const outputGainNode = outputAudioContext.createGain();
            outputGainNode.gain.value = isSpeakerOn ? outputVolume : 0;
            outputGainNode.connect(outputAudioContext.destination);
            outputGainNodeRef.current = outputGainNode;

            const aiOutputAnalyser = outputAudioContext.createAnalyser();
            aiOutputAnalyser.fftSize = 256;
            outputGainNode.connect(aiOutputAnalyser);
            aiOutputAnalyserNodeRef.current = aiOutputAnalyser;

            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(AUDIO_CONFIG.SCRIPT_PROCESSOR_BUFFER_SIZE, AUDIO_CONFIG.NUM_CHANNELS, AUDIO_CONFIG.NUM_CHANNELS);
            scriptProcessorRef.current = scriptProcessor;
            
            const gainNode = inputAudioContext.createGain();
            gainNodeRef.current = gainNode;
            
            const analyserNode = inputAudioContext.createAnalyser();
            analyserNode.fftSize = 256;
            analyserNodeRef.current = analyserNode;

            source.connect(gainNode);
            gainNode.connect(analyserNode);
            analyserNode.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
            
            // ... Callbacks and live session connection
            const callbacks: LiveCallbacks = {
                onopen: () => {
                    setConnectionStatus('Online');
                    if (initialText) {
                        sendTextToLiveSession(initialText);
                    }
                },
                onmessage: async (message: LiveServerMessage) => {
                    // ... message handling logic
                },
                onerror: (e: any) => {
                    console.error('Live session error:', e);
                    setToastMessage(`Connection error: ${e.message}`);
                    endCall('idle');
                },
                onclose: (e: any) => {
                    setConnectionStatus('Offline');
                    // Don't call endCall here to avoid loops. It's called by the user action.
                },
            };
            
            sessionPromiseRef.current = connectToLive(persona, settings, aiMode, view, callbacks, systemInstructionOverride, true, chatContext);
            liveSessionRef.current = await sessionPromiseRef.current;

            // ... onaudioprocess and analysis loops
            
            setCallState('connected');
            setConnectionStatus('Connected');
            setCallDuration(0);
            callTimerRef.current = window.setInterval(() => {
                setCallDuration(d => d + 1);
            }, 1000);
        } catch (error) {
            console.error("Failed to start call:", error);
            setToastMessage("Failed to start call. Please check microphone permissions.");
            endCall('idle');
        }
    }, [
        callState, isCameraOn, setUserMediaStream, isSpeakerOn, outputVolume, persona, settings, aiMode, view,
        setToastMessage, endCall, setConnectionStatus, setCallState, setCallDuration,
        sendTextToLiveSession
    ]);

    const pauseCall = useCallback(() => {
        if (callState !== 'connected') return;
        setCallState('paused');
        audioContextRefs.current.input?.suspend();
        audioContextRefs.current.output?.suspend();
        if (callTimerRef.current) {
            clearInterval(callTimerRef.current);
            callTimerRef.current = null;
        }
    }, [callState]);

    const resumeCall = useCallback(() => {
        if (callState !== 'paused') return;
        setCallState('connected');
        audioContextRefs.current.input?.resume();
        audioContextRefs.current.output?.resume();
        callTimerRef.current = window.setInterval(() => {
            setCallDuration(d => d + 1);
        }, 1000);
    }, [callState]);

    const isCameraEnabled = useMemo(() => !!userMediaStream?.getVideoTracks().find(track => track.readyState === 'live'), [userMediaStream]);

    const toggleCamera = useCallback(() => {
        if (callState === 'connected') {
            setToastMessage("Camera control not fully implemented in this demo.");
        }
        setIsCameraOn(prev => !prev);
    }, [callState, setToastMessage]);

    const setOnCallEndWithData = useCallback((callback: () => (polishedTranscript: string, englishTranscript: string, speakerNames: Record<string, string>) => void) => {
        onCallEndWithDataRef.current = callback();
    }, []);

    const startFlashcardAudioReview = useCallback((cards: Flashcard[]) => {
        setToastMessage("Starting audio flashcard review.");
        setActiveFlashcardReview({ cards, currentIndex: 0 });
        // The actual audio playback logic would be triggered by state change here.
    }, [setToastMessage]);

    const startMeeting = useCallback((language: string, interpretation: boolean) => {
        const systemInstruction = `You are in Meeting Mode. The primary language is ${language}. ${interpretation ? 'Provide live English interpretation.' : ''} Your task is to transcribe the conversation accurately.`;
        startCall(undefined, undefined, systemInstruction);
    }, [startCall]);

    return {
        callState,
        connectionStatus,
        callDuration,
        isMuted,
        isSpeakerOn,
        isAISpeaking,
        isUserSpeaking,
        volume,
        aiVolume,
        liveOutputTranscription,
        liveTranslatedText,
        liveMeetingTopics,
        liveReportData,
        persona,
        speakingPersona,
        aiMode,
        setAiMode,
        sendImage,
        sendTextToLiveSession,
        startScreenShare,
        stopScreenShare,
        isScreenSharing,
        startCall,
        pauseCall,
        resumeCall,
        endCall,
        toggleMute,
        toggleSpeaker,
        isCameraOn,
        isCameraEnabled,
        toggleCamera,
        userMediaStream,
        setUserVideoElement,
        setOnCallEndWithData,
        detectedSpeakers,
        speakerNames,
        setSpeakerNames,
        polishedOriginalTranscript,
        englishInterpretation,
        setShowMeetingModal,
        isTyping,
        setIsTyping,
        liveSentiment,
        activeFlashcardReview,
        startFlashcardAudioReview,
        startMeeting,
        sessionNewsHistory,
        isMultiAgentMode,
        broadcastIndex,
        outputVolume,
        setOutputVolume,
    };
}