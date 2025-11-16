import React, { useCallback } from 'react';
import { generateTextAndImageContent, generateVideo, editImage, generateSpeech } from '../services/geminiService';
import { addCalendarEvent } from '../services/calendarService';
import type { Message, Settings, AiMode, ProactiveSuggestion, WhiteboardElement, ProactiveAction, MeetingReportContent, CallState, PracticeSession, StudyGuide, JobContent, JobListing, SynergyAnalysisContent, ItineraryContent, FlashcardContent, StudyHubItem, StudyProgress, LearningPathContent, CalendarEvent, DataFileContent, Workflow, NewsContent, NewsArticle, Persona, QuizContent, DebateContent } from '@/src/lib/types';
import { AI_MODES, VOICE_NAMES } from '@/src/lib/constants';

const formatReport = (report: MeetingReportContent, template: string): string => {
    if (!report) return '';
    
    let formattedText = template;

    const formatList = (items: any[]) => items.map(item => `- ${item}`).join('\n');
    const formatActionItems = (items: { assignee: string, task: string }[]) => 
        items.map(item => `- **${item.assignee}:** ${item.task}`).join('\n');

    formattedText = formattedText.replace(/\{\{title\}\}/g, report.title || '');
    formattedText = formattedText.replace(/\{\{summary\}\}/g, report.summary || '');
    formattedText = formattedText.replace(/\{\{actionItems\}\}/g, formatActionItems(report.actionItems || []));
    formattedText = formattedText.replace(/\{\{keyDecisions\}\}/g, formatList(report.keyDecisions || []));
    
    return formattedText;
};


export function useMessageHandling(
  subscriptionIsActive: boolean,
  persona: Persona,
  settings: Settings,
  aiMode: AiMode,
  setChatSessions: React.Dispatch<React.SetStateAction<Record<AiMode, Message[]>>>,
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>,
  setToastMessage: (message: string) => void,
  playTTSMessage: (audioData: string, messageId: number) => void,
  setProactiveSuggestion: (suggestion: ProactiveSuggestion | null) => void,
  setProactiveAction: (action: ProactiveAction | null) => void,
  setWhiteboardElements: React.Dispatch<React.SetStateAction<WhiteboardElement[]>>,
  callState: CallState,
  startCall: (scriptToBroadcast?: { persona: Persona; text: string }[], initialText?: string, systemInstructionOverride?: string, chatContext?: string) => void,
  messages: Message[],
  resumeContent: { name: string; content: string } | null | undefined,
  setStudyHubItems?: React.Dispatch<React.SetStateAction<StudyHubItem[]>>,
  setStudyProgress?: React.Dispatch<React.SetStateAction<StudyProgress>>,
  setCalendarEvents?: React.Dispatch<React.SetStateAction<CalendarEvent[]>>,
  workflows?: Workflow[],
  handleRunWorkflow?: (workflowId: string) => void,
  setRadioHeadlines?: React.Dispatch<React.SetStateAction<{ text: string; audio: string | null }[]>>,
  setIsRadioPlaying?: React.Dispatch<React.SetStateAction<boolean>>,
  sessionNewsHistory?: NewsArticle[],
  setAiMode?: (mode: AiMode) => void,
  setActiveQuiz?: (quiz: QuizContent | null) => void,
  setActiveDebate?: (debate: DebateContent | null) => void,
) {
  const addMessageToChat = useCallback((message: Message, mode?: AiMode) => {
    setChatSessions(prev => ({
        ...prev,
        [mode || aiMode]: [...(prev[mode || aiMode] || []), message]
    }));
  }, [aiMode, setChatSessions]);

  const sendMessage = useCallback(async (
    text: string, 
    image: { data: string; mimeType: string; preview: string } | null,
    document: { name: string; content: string; type: string; } | null,
    dataFile: DataFileContent | null,
    replyingTo: Message | null,
    isFirstMessage: boolean,
    speakerNames?: Record<string, string>,
    fullMeetingTranscript?: { polished: string; english: string; }
  ) => {
    if (!text.trim() && !image && !document && !fullMeetingTranscript && !dataFile) return;

    if (!subscriptionIsActive) {
        const errorMessage: Message = {
            id: Date.now(),
            text: `Your subscription has expired. Please renew to continue using the AI features.`,
            sender: 'system',
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now(),
            status: 'read',
        };
        addMessageToChat(errorMessage);
        return;
    }

    const userMessage: Message = {
      id: Date.now(),
      text: text,
      sender: 'user',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      status: 'sent',
      image: image ? { data: image.data, mimeType: image.mimeType, preview: image.preview } : undefined,
      file: document ? { fileName: document.name, fileSize: `${(document.content.length / 1024).toFixed(2)} KB`, fileType: document.type } : undefined,
      dataFile: dataFile ? { name: dataFile.name, content: dataFile.content } : undefined,
      replyTo: replyingTo,
    };
    
    const isNewNewsReportRequest = aiMode === 'news' && (!messages.length || messages[messages.length - 1].sender !== 'user');

    if (isNewNewsReportRequest) {
        addMessageToChat(userMessage);
        const historyPrompt = sessionNewsHistory && sessionNewsHistory.length > 0
            ? `Do NOT include any information about the following topics, as they have already been covered: ${sessionNewsHistory.map(a => `"${a.title}"`).join(', ')}.`
            : "";
        
        const newsSystemInstruction = `You are a news producer conducting live research. The user wants a report on '${text}'. 
Your process is as follows:
1. You MUST use the 'googleSearch' tool to find up-to-date information, prioritizing Nigerian and African sources.
2. CRITICAL: You MUST "think out loud" by providing brief, conversational audio updates as you work. This keeps the user engaged during the search. Do not wait until you have all the information. For example, as soon as the session starts, say "Okay, I'm starting my research on '${text}' now...". A few seconds later, you might say "I'm finding several relevant articles, let me analyze them." Continue providing these short verbal updates throughout your process.
3. Once your research is complete, synthesize the findings into a structured JSON object following this schema: { "articles": [{ "title": string, "summary": string, "source": string, "uri": string }] }.
4. Call the 'display_in_text_mode' tool with this JSON object as the 'content' string.
5. After the tool call, verbally inform the user that you've sent the report to their chat (e.g., "I've sent the full report to your screen now.").
6. Finally, say goodbye and use the 'end_call' tool.
${historyPrompt}`;

        startCall(undefined, undefined, newsSystemInstruction, undefined);
        return;
    }

    const summaryTriggers = /summarize|summary|tldr|tl;dr/i;
    const isSummaryRequest = summaryTriggers.test(text.toLowerCase()) && text.length < 50;

    if (isSummaryRequest && !image && !document) {
        addMessageToChat(userMessage);
        setIsTyping(true);

        const messagesToSummarize = messages.filter(m => m.sender === 'user' || (m.sender === 'bot' && m.text && !m.summary));
        if (messagesToSummarize.length < 2) {
            const botMessage: Message = {
                id: Date.now() + 1,
                text: "There isn't enough conversation history to provide a summary yet.",
                sender: 'bot',
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                timestamp: Date.now(),
                status: 'read',
            };
            addMessageToChat(botMessage);
            setIsTyping(false);
            return;
        }

        const transcript = messagesToSummarize.map(m => `${m.sender === 'user' ? 'User' : 'AI'}: ${m.text}`).join('\n\n');
        const summaryPrompt = `Based on the following conversation transcript, please provide a concise summary of the key points. Format it clearly using markdown.\n\nTRANSCRIPT:\n${transcript}`;
        const summaryUserMessageForApi: Message = { ...userMessage, text: summaryPrompt };

        try {
            const response = await generateTextAndImageContent(persona, summaryUserMessageForApi, settings, 'default');
            const botMessage: Message = {
                id: Date.now() + 1,
                text: `Here is a summary of the last ${messagesToSummarize.length} messages:`,
                sender: 'bot',
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                timestamp: Date.now(),
                status: 'read',
                summary: response.text || "Could not generate a summary.",
            };
            addMessageToChat(botMessage);
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : "An unknown error occurred.";
            setToastMessage(`Failed to generate summary: ${errorMsg}`);
        } finally {
            setIsTyping(false);
        }
        return;
    }

    const isTextOnlyMessage = text && !image && !document && !dataFile;
    if ((callState === 'idle' || callState === 'standby') && isTextOnlyMessage && aiMode !== 'meeting' && aiMode !== 'news') {
        addMessageToChat(userMessage);
        const chatContext = messages
            .slice(-3)
            .map(m => `${m.sender === 'user' ? 'User' : 'AI'}: ${m.text}`)
            .join('\n');
        startCall(undefined, text, undefined, chatContext);
        return; // Stop here, the live session will handle the response.
    }
    
    addMessageToChat(userMessage);
    
    const isVideoRequest = (aiMode === 'default') && /generate (a )?video|create (a )?video|make (a )?video/i.test(text);
    const isImageEditRequest = (aiMode === 'default') && image && text.trim();

    if (isVideoRequest || isImageEditRequest) {
        setIsTyping(true);
        if (image) { // Image Editing
            try {
                const response = await editImage(text, image);
                const botMessage: Message = {
                    id: Date.now() + 1,
                    text: response.text || undefined,
                    sender: 'bot',
                    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    timestamp: Date.now(),
                    status: 'read',
                    image: response.image ? { data: response.image.data, mimeType: response.image.mimeType } : undefined,
                };
                addMessageToChat(botMessage);

                if (botMessage.text) {
                    generateSpeech(botMessage.text, settings.voiceName).then(ttsAudioData => {
                        if (ttsAudioData) {
                            setChatSessions(prev => ({
                                ...prev,
                                [aiMode]: prev[aiMode].map(msg => msg.id === botMessage.id ? { ...msg, ttsAudio: ttsAudioData } : msg)
                            }));
                        }
                    });
                }

            } catch (error) {
                const errorMessageText = error instanceof Error ? error.message : "Unknown image editing error.";
                setToastMessage(`Image editing failed: ${errorMessageText}`);
            } finally {
                setIsTyping(false);
            }
        } else { // Video Generation
            const statusMessageId = Date.now() + 1;
            const statusMessage: Message = {
                id: statusMessageId,
                sender: 'bot',
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                timestamp: Date.now(),
                status: 'read',
                video: {
                    status: 'generating',
                    prompt: text,
                },
            };
            addMessageToChat(statusMessage);

            try {
                const result = await generateVideo(text, image || undefined);
                 setChatSessions(prev => ({
                    ...prev,
                    [aiMode]: prev[aiMode].map(msg => msg.id === statusMessageId ? { ...msg, video: { ...(msg.video!), status: 'complete', downloadUrl: result.downloadUrl } } : msg)
                }));
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Unknown video generation error.";
                 setChatSessions(prev => ({
                    ...prev,
                    [aiMode]: prev[aiMode].map(msg => msg.id === statusMessageId ? { ...msg, video: { ...(msg.video!), status: 'error', errorMessage } } : msg)
                }));
                setToastMessage("Video generation failed.");
            } finally {
                setIsTyping(false);
            }
        }
    } else {
      setIsTyping(true);
      try {
        const response = await generateTextAndImageContent(
            persona, userMessage, settings, aiMode, 
            document?.content, false, isFirstMessage, speakerNames, fullMeetingTranscript, dataFile?.content
        );
        
        // Handle dual-agent JSON response for specific modes
        if ((aiMode === 'default' || aiMode === 'study') && response.text) {
            try {
                const arrayRegex = /(\[[\s\S]*\])/;
                const jsonMatch = response.text.match(arrayRegex);
                
                if (!jsonMatch || !jsonMatch[1]) {
                    throw new Error("No valid JSON array found in the multi-agent response.");
                }
                
                const jsonString = jsonMatch[1];
                const parsed = JSON.parse(jsonString);

                if (Array.isArray(parsed)) {
                    for (const [index, turn] of parsed.entries()) {
                        if (turn.persona && turn.text) {
                            const botMessage: Message = {
                                id: Date.now() + index,
                                sender: 'bot',
                                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                                timestamp: Date.now(),
                                status: 'read',
                                text: turn.text,
                                persona: turn.persona,
                            };
                            addMessageToChat(botMessage);

                            generateSpeech(turn.text, turn.persona === 'Agent Zara' ? VOICE_NAMES.AGENT_ZARA_DEFAULT : VOICE_NAMES.AGENT_ZERO_DEFAULT).then(ttsAudioData => {
                                if (ttsAudioData) {
                                    setChatSessions(prev => ({
                                        ...prev,
                                        [aiMode]: prev[aiMode].map(msg => msg.id === botMessage.id ? { ...msg, ttsAudio: ttsAudioData } : msg)
                                    }));
                                }
                            });
                        }
                    }
                    return; // Exit after processing multi-turn response
                }
            } catch (e) {
                // Not a valid multi-agent JSON, so fall through to treat as a single message.
                console.warn("Response was not a multi-agent JSON, treating as single message.", e);
            }
        }
        
        // Fallback for single message or if JSON parsing fails
        const botMessage: Message = {
          id: Date.now() + 1,
          text: response.text || undefined,
          sender: 'bot',
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now(),
          status: 'read',
          persona: persona,
          image: response.image ? { data: response.image.data, mimeType: response.image.mimeType } : undefined,
          news: response.news || undefined,
          job: response.job || undefined,
          practice: response.practice || undefined,
          studyGuide: response.studyGuide || undefined,
          suggestions: response.suggestions || undefined,
          toolCallInfo: response.toolCallInfo || undefined,
          proactiveSuggestion: response.proactiveSuggestion || undefined,
          proactiveAction: response.proactiveAction || undefined,
          drawCommands: response.drawCommands || undefined,
          meetingReport: response.meetingReport ? { ...response.meetingReport, rawTranscript: fullMeetingTranscript?.polished || '' } : undefined,
          researchDossier: response.researchDossier || undefined,
          interactiveChart: response.interactiveChart || undefined,
          itinerary: response.itinerary || undefined,
          flashcards: response.flashcards || undefined,
          swot: response.swot || undefined,
          quiz: response.quiz || undefined,
          debate: response.debate || undefined,
          learningPath: response.learningPath || undefined,
          groundingSources: response.groundingSources || undefined,
          recipe: response.recipe || undefined,
          budget: response.budget || undefined,
          personProfile: response.personProfile || undefined,
          placeProfile: response.placeProfile || undefined,
        };
        
        // Handle specific content types that might need post-processing
        if (botMessage.proactiveSuggestion) {
            setProactiveSuggestion(botMessage.proactiveSuggestion);
            botMessage.proactiveSuggestion = undefined; // Don't show in chat
        }
        if (botMessage.proactiveAction) {
            setProactiveAction(botMessage.proactiveAction);
            botMessage.proactiveAction = undefined; // Don't show in chat
        }
        if (botMessage.drawCommands) {
            setWhiteboardElements(prev => [...prev, ...botMessage.drawCommands!]);
        }
        if (botMessage.meetingReport) {
            botMessage.text = formatReport(botMessage.meetingReport, settings.meetingReportTemplate);
        }
        if (botMessage.quiz && setActiveQuiz) {
            setActiveQuiz(botMessage.quiz);
            const quizStartMessage: Message = {
                id: Date.now() + 2,
                sender: 'system',
                text: `A quiz on "${botMessage.quiz.topic}" has started.`,
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit'}),
                timestamp: Date.now(),
                status: 'read',
            };
            addMessageToChat(quizStartMessage);
            return; // Stop further processing
        }
        if (botMessage.debate && setActiveDebate) {
            setActiveDebate(botMessage.debate);
            const debateStartMessage: Message = {
                id: Date.now() + 2,
                sender: 'system',
                text: `A debate on "${botMessage.debate.topic}" has started.`,
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit'}),
                timestamp: Date.now(),
                status: 'read',
            };
            addMessageToChat(debateStartMessage);
            return; // Stop further processing
        }
        const studyItem = botMessage.studyGuide || botMessage.practice || botMessage.flashcards || botMessage.quiz || botMessage.learningPath;
        if (studyItem && setStudyHubItems && setStudyProgress) {
            setStudyHubItems(prev => [studyItem, ...prev.filter(item => item.id !== studyItem.id)]);
            const today = new Date().toISOString().split('T')[0];
            setStudyProgress(prev => ({
                totalItems: prev.totalItems + 1,
                studyDays: [...new Set([...prev.studyDays, today])]
            }));
        }

        addMessageToChat(botMessage);

        if (botMessage.text) {
          generateSpeech(botMessage.text, settings.voiceName).then(ttsAudioData => {
            if (ttsAudioData) {
              setChatSessions(prev => ({
                ...prev,
                [aiMode]: prev[aiMode].map(msg => msg.id === botMessage.id ? { ...msg, ttsAudio: ttsAudioData } : msg)
              }));
            }
          });
        }
        
      } catch (error) {
        const errorMessageText = error instanceof Error ? error.message : "An unknown error occurred.";
        setToastMessage(`Request failed: ${errorMessageText}`);
      } finally {
        setIsTyping(false);
      }
    }
  }, [
    subscriptionIsActive, aiMode, messages, sessionNewsHistory, startCall, addMessageToChat, 
    setIsTyping, persona, settings, setProactiveSuggestion, setProactiveAction, setWhiteboardElements,
    setActiveQuiz, setActiveDebate, setStudyHubItems, setStudyProgress, setToastMessage, callState,
    setChatSessions
  ]);

  const announceModeChange = useCallback((newMode: AiMode, oldMode: AiMode | null) => {
    const modeName = AI_MODES.find(m => m.mode === newMode)?.name || newMode;
    const text = `Mode changed to ${modeName}.`;
    const systemMessage: Message = {
        id: Date.now(),
        text,
        sender: 'system',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        status: 'read',
    };
    addMessageToChat(systemMessage, newMode);
    
    if (callState === 'connected') {
        generateSpeech(text, settings.voiceName).then(audio => {
            if (audio) playTTSMessage(audio, -1);
        });
    }
  }, [addMessageToChat, callState, settings.voiceName, playTTSMessage]);

  const handleAnalyzeSynergy = useCallback((listing: JobListing) => {
    if (!resumeContent) {
        setToastMessage('Please upload a resume first to analyze synergy.');
        return;
    }
    const prompt = `Please analyze the synergy between my resume and this job listing for "${listing.title}" at "${listing.company}". Provide a synergy score, key strengths, and areas of opportunity.`;
    sendMessage(prompt, null, { name: resumeContent.name, content: `Job Listing:\n${listing.description}\n\nResume:\n${resumeContent.content}`, type: 'text/plain' }, null, null, false);
  }, [resumeContent, sendMessage, setToastMessage]);

  const handleStartInterview = useCallback((listing: JobListing) => {
    const prompt = `Let's simulate an interview for the position of "${listing.title}" at "${listing.company}". Please start by asking me the first question.`;
    sendMessage(prompt, null, null, null, null, false);
  }, [sendMessage]);

  const handleDraftCoverLetter = useCallback((listing: JobListing) => {
    if (!resumeContent) {
        setToastMessage('Please upload a resume first to draft a cover letter.');
        return;
    }
    const prompt = `Based on my attached resume, please draft a compelling cover letter for the position of "${listing.title}" at "${listing.company}". The job description is as follows: ${listing.description}`;
    sendMessage(prompt, null, { name: resumeContent.name, content: resumeContent.content, type: 'text/plain' }, null, null, false);
  }, [resumeContent, sendMessage, setToastMessage]);

  return { sendMessage, announceModeChange, handleAnalyzeSynergy, handleStartInterview, handleDraftCoverLetter };
}
