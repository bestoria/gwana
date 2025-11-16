import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { Message, Settings, AiMode, AiSuggestion, JobListing, SWOTContent, FlashcardContent, Flashcard, Persona, SearchFilterType } from '@/src/lib/types';
import { formatTime, groupMessagesByDate, formatText, linkifyText, audioManager, throttle } from '@/src/lib/utils';
import { X, Star, Copy, Check, CheckCheck, Pause, Play, CornerUpLeft, Trash2, Compass, Image as ImageIcon, BrainCircuit, Volume2, VolumeX, MessageSquare, Share2, CornerUpRight, BookOpen, Lightbulb, User } from 'lucide-react';
import { AI_MODES, AI_MODE_GREETINGS } from '@/src/lib/constants';
import GeneratedImage from './GeneratedImage';
import CodeBlock from './CodeBlock';
import FileDisplay from './FileDisplay';
import NewsDisplay from './NewsDisplay';
import JobListingDisplay from './JobListingDisplay';
import PracticeDisplay from './PracticeDisplay';
import StudyGuideDisplay from './StudyGuideDisplay';
import VideoDisplay from './VideoDisplay';
import MeetingReportDisplay from './MeetingReportDisplay';
import { useLiveAPIContext } from '@/src/contexts/LiveAPIContext';
import LiveMeetingReport from './LiveMeetingReport';
import SummaryDisplay from './SummaryDisplay';
import SynergyAnalysisDisplay from './SynergyAnalysisDisplay';
import ResearchDossierDisplay from './ResearchDossierDisplay';
import InteractiveChartDisplay from './InteractiveChartDisplay';
import ItineraryDisplay from './ItineraryDisplay';
import FlashcardDisplay from './FlashcardDisplay';
import SWOTDisplay from './SWOTDisplay';
import QuizDisplay from './QuizDisplay';
import LearningPathDisplay from './LearningPathDisplay';
import RecipeDisplay from './RecipeDisplay';
import BudgetPlannerDisplay from './BudgetPlannerDisplay';
import GroundingSourcesDisplay from './GroundingSourcesDisplay';
import WebSearchIndicator from './WebSearchIndicator';
import PersonProfileDisplay from './PersonProfileDisplay';
import PlaceProfileDisplay from './PlaceProfileDisplay';
import AnimatedAiMessage from './chat/AnimatedAiMessage';
import ToolUseIndicator from './chat/ToolUseIndicator';
import ThinkingIndicator from './chat/ThinkingIndicator';
import SuggestionChips from './chat/SuggestionChips';
import MessageActionsToolbar from './chat/MessageActionsToolbar';
import AgentPresence from './AgentPresence';
import ChatInput from './chat/ChatInput';

// --- PROPS INTERFACE ---
interface ChatUIProps extends React.ComponentProps<typeof ChatInput> {
    isDesktop: boolean;
    messages: Message[];
    settings: Settings;
    isTyping: boolean;
    searchQuery: string;
    searchFilter: SearchFilterType;
    deleteMessage: (id: number) => void;
    starMessage: (id: number) => void;
    addReaction: (id: number, emoji: string) => void;
    copyMessage: (text: string) => void;
    playAudioMessage: (audioData: string, messageId: number) => void;
    isPlayingAudio: number | null;
    playTTSMessage: (audioData: string, messageId: number) => void;
    playingTTSMessageId: number | null;
    setToastMessage: (msg: string) => void;
    handleSuggestionClick: (prompt: string) => void;
    handleShareMessage: (message: Message) => void;
    handleJumpToMessageContext: (mode: AiMode) => void;
    handleMessageAction: (action: 'summarize' | 'explain' | 'eli5' | 'teach-back', text: string) => void;
    handleAnalyzeSynergy: (listing: JobListing) => void;
    handleStartInterview: (listing: JobListing) => void;
    handleDraftCoverLetter: (listing: JobListing) => void;
    handleUpdateFlashcardSRS: (deckId: string, updatedCards: Flashcard[]) => void;
    startAudioReview: (cards: Flashcard[]) => void;
    handleSetPersona: (persona: Persona) => void;
    setReplyingTo: (msg: Message | null) => void;
    textInputRef: React.RefObject<HTMLInputElement>;
    setAiMode: (mode: AiMode) => void;
    persona: Persona;
    aiMode: AiMode;
    resumeContent: { name: string; content: string } | null;
}

// --- MAIN CHAT COMPONENT (NOW MESSAGE LIST) ---
export const ChatUI: React.FC<ChatUIProps> = (props) => {
    const { isDesktop, messages, settings, isTyping, searchQuery, searchFilter, setReplyingTo, deleteMessage, starMessage, addReaction, copyMessage, playAudioMessage, isPlayingAudio, playTTSMessage, playingTTSMessageId, setToastMessage, textInputRef, setAiMode, persona, aiMode, handleSuggestionClick, handleShareMessage, handleJumpToMessageContext, handleMessageAction, resumeContent, handleAnalyzeSynergy, handleStartInterview, handleDraftCoverLetter, handleUpdateFlashcardSRS, startAudioReview, handleSetPersona } = props;
    const { liveReportData, callState } = useLiveAPIContext();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messageListRef = useRef<HTMLDivElement>(null);
    const userScrolledUp = useRef(false);
    const [animatedMessageId, setAnimatedMessageId] = useState<number | null>(null);
    const prevMessagesCount = useRef(messages.length);
    const filteredMessages = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const lowerQuery = searchQuery.toLowerCase();
        return messages.filter(m => {
            const textMatch = m.text && m.text.toLowerCase().includes(lowerQuery);
            const summaryMatch = m.summary && m.summary.toLowerCase().includes(lowerQuery);
            const fileNameMatch = m.file && m.file.fileName.toLowerCase().includes(lowerQuery);
            const codeMatch = m.codeBlock && m.codeBlock.code.toLowerCase().includes(lowerQuery);
            const linkMatch = m.text && m.text.includes('http') && m.text.toLowerCase().includes(lowerQuery);
            const imageMatch = m.image && 'image'.includes(lowerQuery);
            
            switch(searchFilter) {
                case 'images': return imageMatch;
                case 'code': return codeMatch;
                case 'files': return fileNameMatch;
                case 'links': return linkMatch;
                default: return textMatch || summaryMatch || fileNameMatch || codeMatch;
            }
        }).map(m => ({ ...m, originalMode: aiMode }));
    }, [messages, searchQuery, searchFilter, aiMode]);

    const onAnimationComplete = useCallback(() => {
        setAnimatedMessageId(null);
    }, []);

    const handleScroll = useCallback(() => {
        const messageList = messageListRef.current;
        if (messageList) {
            const isAtBottom = messageList.scrollHeight - messageList.scrollTop - messageList.clientHeight < 150;
            userScrolledUp.current = !isAtBottom;
        }
    }, []);
    
    useEffect(() => {
        if (searchQuery) return; // Don't auto-scroll during search
    
        const lastMessage = messages[messages.length - 1];
        
        if ((lastMessage?.sender === 'user') || !userScrolledUp.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, searchQuery]);

    useEffect(() => {
        if (searchQuery) return; 
        if (messages.length > prevMessagesCount.current) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage && lastMessage.sender === 'bot' && lastMessage.text && !lastMessage.summary) {
                setAnimatedMessageId(lastMessage.id);
            }
        }
        prevMessagesCount.current = messages.length;
    }, [messages, searchQuery]);
    
    const isSearching = !!searchQuery.trim();
    const messagesToDisplay = isSearching ? filteredMessages : messages;
    const groupedMessages = isSearching ? { 'Search Results': messagesToDisplay } : groupMessagesByDate<Message>(messagesToDisplay);
    const getFontSizeClass = () => ({ 'small': 'text-sm', 'large': 'text-lg', 'medium': 'text-base' }[settings.fontSize] || 'text-base');
    
    const modeDetails = useMemo(() => AI_MODES.find(m => m.mode === aiMode), [aiMode]);
    const lastUserMessage = useMemo(() => [...messages].reverse().find(m => m.sender === 'user' && m.text), [messages]);
    
    if (messages.length === 0 && !isTyping && !isSearching) {
        const greeting = AI_MODE_GREETINGS[aiMode] || AI_MODE_GREETINGS.default;
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="flex-grow flex flex-col items-center justify-center">
                    <div className="text-2xl mb-4">{modeDetails?.icon}</div>
                    <h2 className="text-xl font-bold text-white mb-2">{modeDetails?.name} Mode</h2>
                    <p className="text-sm text-gray-300 max-w-lg animate-fade-in font-sans" style={{ animationDelay: '200ms' }}>
                        {greeting}
                    </p>
                </div>
                 <ChatInput {...props} />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-transparent relative">
            {isDesktop && <AgentPresence 
                view={'chat'}
                isDesktop={isDesktop}
                aiMode={aiMode}
                persona={persona}
                setPersona={handleSetPersona}
            />}
            
            { isSearching && (
                 <div className="absolute top-0 left-0 right-0 z-10 flex flex-col items-center pt-4 pb-4 pointer-events-none bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-primary)] to-transparent">
                    <h2 className="text-2xl font-bold mt-2 text-white" style={{ textShadow: '0 0 10px var(--accent-cyan)' }}>
                        Search Results
                    </h2>
                    <p className="mt-1 text-md text-cyan-300 min-h-[24px]">
                        Found {filteredMessages.length} matching log entries
                    </p>
                </div>
            )}


            {aiMode === 'meeting' && callState === 'connected' && isDesktop && (
                <LiveMeetingReport data={liveReportData} />
            )}

            <div 
                ref={messageListRef}
                onScroll={handleScroll}
                className={`message-list flex-col transition-all duration-300 ${isSearching ? 'pt-[10rem]' : ''}`}
            >
                <div className="mt-auto">
                    {Object.keys(groupedMessages).map(date => (
                        <div key={date}>
                            <div className="flex justify-center my-4">
                                <div className="bg-black/70 backdrop-blur-sm px-3 py-1 rounded-sm border border-gray-700">
                                    <span className="text-xs text-gray-400 font-mono tracking-widest">{date.toUpperCase()}</span>
                                </div>
                            </div>
                            {groupedMessages[date].map((msg) => {
                                const shouldAnimate = msg.id === animatedMessageId;
                                const isShareable = msg.studyGuide || msg.news || msg.job || msg.practice || (msg.meetingReport && msg.text) || msg.codeBlock || msg.image || (msg.video && msg.video.status === 'complete') || msg.itinerary || msg.flashcards || msg.swot;
                                const modeInfo = isSearching ? AI_MODES.find(m => m.mode === msg.originalMode) : null;
                                
                                const senderName = msg.sender === 'user' ? 'USER'
                                    : msg.sender === 'system' ? 'SYSTEM'
                                    : (msg.persona || persona).toUpperCase().replace(' ', '_');
                                
                                const senderClass = msg.sender === 'user' ? 'sender-user'
                                    : msg.sender === 'system' ? 'sender-system'
                                    : msg.persona === 'Agent Zara' ? 'sender-ai'
                                    : 'sender-user'; // Default bot (Agent Zero) to cyan


                                return (
                                <div key={msg.id} className={`message-capsule group animate-fade-in ${msg.isDeleting ? 'animate-fade-out' : ''}`}>
                                    <div className={`capsule-sender ${senderClass}`}>
                                        {senderName}
                                    </div>
                                    
                                    <div className={`capsule-content ${getFontSizeClass()}`}>
                                        {msg.starred && <Star size={12} className="absolute top-1.5 left-1.5 text-yellow-400 fill-yellow-400" />}

                                        {isSearching && modeInfo && (
                                            <button 
                                                onClick={() => handleJumpToMessageContext(msg.originalMode!)}
                                                className="mb-2 text-xs font-mono text-gray-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
                                            >
                                                From {modeInfo.icon} {modeInfo.name} <CornerUpRight size={14} />
                                            </button>
                                        )}

                                        {msg.replyTo && (
                                            <div className="mb-2 p-2 bg-black/30 rounded-sm border-l-2 border-cyan-500">
                                                <p className="text-xs font-semibold text-cyan-300">{msg.replyTo.sender === 'user' ? 'You' : persona}</p>
                                                <p className="text-xs text-gray-400 truncate">{msg.replyTo.text}</p>
                                            </div>
                                        )}

                                        {msg.toolCallInfo && msg.sender === 'bot' && <ToolUseIndicator toolName={msg.toolCallInfo.toolName} />}
                                        
                                        {msg.text && (
                                            shouldAnimate ? (
                                                <AnimatedAiMessage 
                                                    text={msg.text} 
                                                    settings={settings}
                                                    onComplete={onAnimationComplete} 
                                                />
                                            ) : (
                                                <div dangerouslySetInnerHTML={{ __html: settings.linkPreview ? linkifyText(formatText(msg.text)) : formatText(msg.text) }} />
                                            )
                                        )}
                                        
                                        {msg.summary && <SummaryDisplay content={msg.summary} />}

                                        {msg.image && (
                                            msg.sender === 'user'
                                            ? <img src={msg.image.preview || `data:${msg.image.mimeType};base64,${msg.image.data}`} alt="User uploaded content" className="rounded-md my-2 max-w-full max-h-64 border border-cyan-500/30" />
                                            : <GeneratedImage src={`data:${msg.image.mimeType};base64,${msg.image.data}`} />
                                        )}

                                        {msg.codeBlock && <CodeBlock language={msg.codeBlock.language} code={msg.codeBlock.code} />}
                                        {msg.file && <FileDisplay fileName={msg.file.fileName} fileSize={msg.file.fileSize} fileType={msg.file.fileType} />}
                                        {msg.news && <NewsDisplay news={msg.news} />}
                                        {msg.job && <JobListingDisplay job={msg.job} resumeContent={resumeContent} handleAnalyzeSynergy={handleAnalyzeSynergy} handleStartInterview={handleStartInterview} handleDraftCoverLetter={handleDraftCoverLetter} />}
                                        {msg.synergyAnalysis && <SynergyAnalysisDisplay analysis={msg.synergyAnalysis} />}
                                        {msg.practice && <PracticeDisplay practice={msg.practice} />}
                                        {msg.studyGuide && <StudyGuideDisplay studyGuide={msg.studyGuide} />}
                                        {msg.video && <VideoDisplay video={msg.video} />}
                                        {msg.meetingReport && msg.text && <MeetingReportDisplay reportText={msg.text} />}
                                        {msg.researchDossier && <ResearchDossierDisplay dossier={msg.researchDossier} />}
                                        {msg.interactiveChart && <InteractiveChartDisplay chartData={msg.interactiveChart} />}
                                        {msg.itinerary && <ItineraryDisplay itinerary={msg.itinerary} />}
                                        {msg.flashcards && <FlashcardDisplay flashcards={msg.flashcards} onUpdateSRS={handleUpdateFlashcardSRS} startAudioReview={startAudioReview} />}
                                        {msg.swot && <SWOTDisplay swot={msg.swot} />}
                                        {msg.quiz && <QuizDisplay quiz={msg.quiz} />}
                                        {msg.learningPath && <LearningPathDisplay learningPath={msg.learningPath} />}
                                        {msg.recipe && <RecipeDisplay recipe={msg.recipe} />}
                                        {msg.budget && <BudgetPlannerDisplay budget={msg.budget} />}
                                        {msg.personProfile && <PersonProfileDisplay profile={msg.personProfile} />}
                                        {msg.placeProfile && <PlaceProfileDisplay profile={msg.placeProfile} />}
                                        
                                        {msg.meetingReport?.rawTranscript && (
                                            <details className="mt-4">
                                                <summary className="cursor-pointer text-cyan-400 hover:text-cyan-300 font-semibold text-sm flex items-center gap-2">
                                                    <MessageSquare size={16} /> View Full Transcript
                                                </summary>
                                                <pre className="mt-2 text-xs text-gray-400 overflow-auto max-h-48 p-2 bg-black/50 rounded whitespace-pre-wrap">
                                                    {msg.meetingReport.rawTranscript}
                                                </pre>
                                            </details>
                                        )}

                                        {msg.sender === 'bot' && msg.suggestions && msg.suggestions.length > 0 && !isTyping && (
                                            <SuggestionChips suggestions={msg.suggestions} onClick={handleSuggestionClick} />
                                        )}
                                        
                                        {msg.groundingSources && msg.groundingSources.length > 0 && (
                                            <GroundingSourcesDisplay sources={msg.groundingSources} />
                                        )}

                                        {msg.audio && <div className="flex items-center gap-2 cursor-pointer p-1 my-1" onClick={() => playAudioMessage(msg.audio!, msg.id)}><button className="text-cyan-400">{isPlayingAudio === msg.id ? <Pause size={20} /> : <Play size={20} />}</button><div className="text-xs text-gray-400 font-mono">{formatTime(msg.duration || 0)}</div></div>}
                                        
                                        {msg.reactions && msg.reactions.length > 0 && <div className="flex gap-1 mt-1.5">{msg.reactions.map((r, i) => <span key={i} className="bg-black/50 shadow-sm px-2 py-0.5 rounded-full text-xs">{r.emoji} {r.count}</span>)}</div>}
                                        
                                        <div className="flex items-center justify-end gap-2 text-xs text-gray-500 font-mono">
                                            <span>{msg.time}</span>
                                            {msg.sender === 'user' && (<span>{msg.status === 'sent' && <Check size={14}/>}{msg.status === 'delivered' && <CheckCheck size={14}/>}{msg.status === 'read' && <CheckCheck size={14} className="text-cyan-400"/>}</span>)}
                                        </div>

                                        {msg.sender === 'bot' && !isTyping && !shouldAnimate && (
                                           <MessageActionsToolbar 
                                                message={msg}
                                                isPlaying={playingTTSMessageId === msg.id}
                                                playTTS={playTTSMessage}
                                                handleAction={handleMessageAction}
                                           />
                                        )}
                                    </div>
                                    
                                    {msg.sender !== 'system' && (
                                        <div className="capsule-actions">
                                            <button onClick={() => { setReplyingTo(msg); textInputRef.current?.focus(); }} title="Reply" aria-label="Reply to this message"><CornerUpLeft size={16}/></button>
                                            <button onClick={() => starMessage(msg.id)} title="Star" aria-label={msg.starred ? "Unstar this message" : "Star this message"}>
                                                <Star size={16} className={`transition-all duration-300 ${msg.starred ? 'text-yellow-400 fill-yellow-400 scale-110' : 'group-hover:text-yellow-300'}`}/>
                                            </button>
                                            {isShareable && (
                                                <button onClick={() => handleShareMessage(msg)} title="Share" aria-label="Share this message"><Share2 size={16}/></button>
                                            )}
                                            <button onClick={() => copyMessage(msg.text || msg.summary || '')} title="Copy" aria-label="Copy message text"><Copy size={16}/></button>
                                            <button onClick={() => deleteMessage(msg.id)} title="Delete" aria-label="Delete this message" className="hover:text-red-500"><Trash2 size={16}/></button>
                                        </div>
                                    )}
                                </div>
                            )})}
                        </div>
                    ))}
                    {isTyping && !searchQuery && (
                        aiMode === 'default' ? <WebSearchIndicator topic={lastUserMessage?.text || 'your query'} /> :
                        aiMode === 'research' ? <WebSearchIndicator topic={lastUserMessage?.text || 'research topic'} /> :
                        aiMode === 'people_places' ? <WebSearchIndicator topic={lastUserMessage?.text || 'your query'} /> :
                        aiMode !== 'news' && <ThinkingIndicator />
                    )}
                </div>
                <div ref={messagesEndRef} />
            </div>
            <ChatInput {...props} />
        </div>
    );
};