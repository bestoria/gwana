import { GoogleGenAI, Modality, Blob as GenAI_Blob, GenerateContentResponse, LiveServerMessage, FunctionDeclaration, Type } from "@google/genai";
import type { Settings, Message, AiMode, NewsContent, NewsArticle, JobContent, PracticeSession, StudyGuide, View, Personality, FontSize, Theme, AiSuggestion, MemoryFragment, ToolCallInfo, UserEmotion, ProactiveSuggestion, WhiteboardElement, ProactiveAction, MeetingReportContent, LiveCallbacks, ResearchDossierContent, InteractiveChartContent, ItineraryContent, FlashcardContent, SWOTContent, QuizContent, LearningPathContent, Persona, CalendarEvent, ProactiveCalendarSuggestionContent, RecipeContent, BudgetPlannerContent, PersonProfileContent, PlaceProfileContent, DebateContent, LiveSession } from '@/src/lib/types';
import { encode, getRelevantMemoryFragments, saveMemoryFragment } from '@/src/lib/utils';
import { AI_MODES, AI_MODE_GREETINGS, VOICE_NAMES } from '@/src/lib/constants';

const OFFLINE_RESPONSE_TEXT = "AI features are disabled. An API key is required to use this feature.";

let ai: GoogleGenAI;

// Check localStorage first, then environment variable
const getApiKey = () => {
  const storedKey = localStorage.getItem('gemini_api_key');
  if (storedKey) return storedKey;
  return process.env.API_KEY;
};

const apiKey = getApiKey();
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
} else {
  console.warn("API_KEY not set. AI features will be disabled.");
}

export interface GeminiServiceResponse {
    text: string | null;
    image: { data: string; mimeType: string; } | null;
    news: NewsContent | null;
    job?: JobContent;
    practice?: PracticeSession;
    studyGuide?: StudyGuide;
    suggestions?: AiSuggestion[];
    toolCallInfo?: ToolCallInfo;
    proactiveSuggestion?: ProactiveSuggestion;
    proactiveAction?: ProactiveAction;
    drawCommands?: WhiteboardElement[];
    meetingReport?: MeetingReportContent;
    researchDossier?: ResearchDossierContent;
    interactiveChart?: InteractiveChartContent;
    itinerary?: ItineraryContent;
    flashcards?: FlashcardContent;
    swot?: SWOTContent;
    quiz?: QuizContent;
    debate?: DebateContent;
    learningPath?: LearningPathContent;
    groundingSources?: { title: string; uri: string }[];
    recipe?: RecipeContent;
    budget?: BudgetPlannerContent;
    personProfile?: PersonProfileContent;
    placeProfile?: PlaceProfileContent;
}


const endCallFunctionDeclaration: FunctionDeclaration = {
  name: 'end_call',
  description: 'Ends the current voice call session. Use this only after the user has confirmed they want to end the call and you have said your verbal goodbye.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
    required: [],
  },
};

const setAiModeFunctionDeclaration: FunctionDeclaration = {
  name: 'set_ai_mode',
  description: 'Switches the AI\'s operational mode to specialize in a specific task area. Use this when the user explicitly asks to change modes, or their request strongly implies a different mode is needed (e.g., "help me study," "let\'s practice," "find me a job").',
  parameters: {
    type: Type.OBJECT,
    properties: {
      mode: {
        type: Type.STRING,
        description: 'The target mode to switch to.',
        enum: AI_MODES.map(m => m.mode),
      },
    },
    required: ['mode'],
  },
};

const generateImageFunctionDeclaration: FunctionDeclaration = {
  name: 'generate_image',
  description: 'Generates an image based on a user-provided descriptive prompt. Use this tool when the user explicitly asks to create, draw, generate, or imagine a picture, illustration, or visual of something.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      prompt: {
        type: Type.STRING,
        description: 'A detailed, descriptive prompt for the image to be generated. This should capture all the user\'s requirements for the visual.',
      },
    },
    required: ['prompt'],
  },
};

const generateStoryImageFunctionDeclaration: FunctionDeclaration = {
  name: 'generate_story_image',
  description: 'Generates an illustration for the story segment that was just written. Use this function after every story part to create a visual.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      prompt: {
        type: Type.STRING,
        description: 'A concise, descriptive prompt for the image to be generated, summarizing the scene.',
      },
    },
    required: ['prompt'],
  },
};

const displayInTextModeFunctionDeclaration: FunctionDeclaration = {
  name: 'display_in_text_mode',
  description: 'Switches the user interface to text chat view and displays the provided content. Use this for complex information like code, lists, or detailed explanations that are best viewed as text.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      content: {
        type: Type.STRING,
        description: 'The full, formatted text content to be displayed in the chat.',
      },
    },
    required: ['content'],
  },
};

const navigateToViewFunctionDeclaration: FunctionDeclaration = {
  name: 'navigate_to_view',
  description: 'Navigates the user to a different primary view within the application, such as the text chat or the main agent screen.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      view: {
        type: Type.STRING,
        description: "The destination view. Use 'chat' for text mode, 'emojiChat' for the voice agent screen, and 'settings' for the settings panel.",
        enum: ['chat', 'emojiChat', 'settings'],
      },
    },
    required: ['view'],
  },
};

const updateSettingFunctionDeclaration: FunctionDeclaration = {
  name: 'update_setting',
  description: 'Modifies a specific application setting based on user request.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      setting_key: {
        type: Type.STRING,
        description: 'The key of the setting to update.',
        enum: ['voiceName', 'personality', 'responseLength', 'fontSize', 'theme'],
      },
      setting_value: {
        type: Type.STRING,
        description: 'The new value for the setting. Must be a valid option for the given key.',
      },
    },
    required: ['setting_key', 'setting_value'],
  },
};

const togglePersonaFunctionDeclaration: FunctionDeclaration = {
  name: 'toggle_persona',
  description: 'Switches the active AI persona between Agent Zero and Agent Zara.',
  parameters: { type: Type.OBJECT, properties: {} },
};

const clearChatLogFunctionDeclaration: FunctionDeclaration = {
  name: 'clear_chat_log',
  description: 'Deletes all messages in the current chat mode session.',
  parameters: { type: Type.OBJECT, properties: {} },
};

const exportChatLogFunctionDeclaration: FunctionDeclaration = {
  name: 'export_chat_log',
  description: 'Exports the current chat mode session log as a file.',
  parameters: { type: Type.OBJECT, properties: {} },
};

const proposeNextActionsFunctionDeclaration: FunctionDeclaration = {
  name: 'propose_next_actions',
  description: 'Provides a list of relevant, high-value next actions the user might want to take based on the current context and the AI\'s last response.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      suggestions: {
        type: Type.ARRAY,
        description: 'An array of 1 to 3 suggested next actions.',
        items: {
          type: Type.OBJECT,
          properties: {
            label: {
              type: Type.STRING,
              description: 'The short, user-facing text for the suggestion button (e.g., "Explain this concept").',
            },
            prompt: {
              type: Type.STRING,
              description: 'The detailed prompt to be sent back to the AI if the user clicks this suggestion.',
            },
          },
          required: ['label', 'prompt'],
        },
      },
    },
    required: ['suggestions'],
  },
};

const createMemoryFunctionDeclaration: FunctionDeclaration = {
  name: 'create_memory',
  description: 'Creates a memory fragment when the user reveals a key interest, goal, or piece of personal information that should be remembered for future conversations to provide better context and personalization. Use this when a topic has been explored in some depth.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      topic: { type: Type.STRING, description: 'A concise, one or two-word topic for the memory (e.g., "Quantum Computing", "Paris Travel Plans").' },
      summary: { type: Type.STRING, description: 'A single sentence summarizing the key takeaway or user interest.' },
      related_entities: {
        type: Type.ARRAY,
        description: 'A list of specific names, companies, or concepts related to the topic.',
        items: { type: Type.STRING }
      }
    },
    required: ['topic', 'summary'],
  },
};

const proactiveSuggestionFunctionDeclaration: FunctionDeclaration = {
  name: 'proactive_suggestion',
  description: 'When you identify a high-value, non-obvious connection between the user\'s current query and long-term memories from a *different* operational mode, use this tool to propose switching modes to explore that connection. This is for generating emergent insights, not for standard next actions.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      targetMode: {
        type: Type.STRING,
        description: 'The AI mode to switch to.',
        enum: AI_MODES.map(m => m.mode),
      },
      suggestionText: {
        type: Type.STRING,
        description: 'A concise, user-facing sentence explaining the connection you found. E.g., "I noticed your interest in quantum physics. Shall we explore this in Study Mode?"',
      },
      initialPrompt: {
        type: Type.STRING,
        description: 'The initial prompt to send in the new mode to kickstart the exploration. E.g., "Explain the basics of quantum entanglement for a beginner."',
      },
    },
    required: ['targetMode', 'suggestionText', 'initialPrompt'],
  },
};

const proactiveActionFunctionDeclaration: FunctionDeclaration = {
  name: 'proactive_action',
  description: 'When you identify a high-value, non-obvious connection between the user\'s current query and long-term memories from a *different* operational mode that can be fulfilled by generating content, use this tool to proactively perform an action in another mode and present the result. This is for generating emergent insights, not for standard next actions.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      targetMode: {
        type: Type.STRING,
        description: 'The AI mode to perform the action in.',
        enum: AI_MODES.map(m => m.mode),
      },
      actionDescription: {
        type: Type.STRING,
        description: 'A concise, user-facing sentence explaining the action you took. E.g., "I noticed your interest in quantum physics, so I prepared a brief study guide for you in Classroom mode."',
      },
      initialPrompt: {
        type: Type.STRING,
        description: 'The prompt used to generate the proactive content. E.g., "Generate a beginner\'s study guide on quantum entanglement."',
      },
    },
    required: ['targetMode', 'actionDescription', 'initialPrompt'],
  },
};

const whiteboardDrawFunctionDeclaration: FunctionDeclaration = {
    name: 'whiteboard_draw',
    description: 'Draws one or more elements on the shared whiteboard canvas. Use this to visualize concepts, create diagrams, or sketch ideas based on the user\'s description. You can draw paths, circles, rectangles, and text.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            elements: {
                type: Type.ARRAY,
                description: "An array of drawing commands to execute.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING, enum: ['path', 'circle', 'rect', 'text'] },
                        // Path properties
                        d: { type: Type.STRING, description: 'For path: SVG path data string (e.g., "M 10 10 L 90 90").' },
                        // Circle properties
                        cx: { type: Type.NUMBER, description: 'For circle: x-coordinate of the center.' },
                        cy: { type: Type.NUMBER, description: 'For circle: y-coordinate of the center.' },
                        r: { type: Type.NUMBER, description: 'For circle: radius of the circle.' },
                        // Rect properties
                        x: { type: Type.NUMBER, description: 'For rect/text: x-coordinate of the top-left corner.' },
                        y: { type: Type.NUMBER, description: 'For rect/text: y-coordinate of the top-left corner.' },
                        width: { type: Type.NUMBER, description: 'For rect: width of the rectangle.' },
                        height: { type: Type.NUMBER, description: 'For rect: height of the rectangle.' },
                        // Text properties
                        text: { type: Type.STRING, description: 'For text: The text to display.' },
                        fontSize: { type: Type.NUMBER, description: 'For text: The font size.' },
                        // Shared properties
                        stroke: { type: Type.STRING, description: 'Stroke color (e.g., "#FF0000").' },
                        strokeWidth: { type: Type.NUMBER, description: 'Stroke width in pixels.' },
                        fill: { type: Type.STRING, description: 'Fill color (e.g., "rgba(0,0,255,0.5)"). Defaults to "none".' },
                    },
                },
            },
        },
        required: ['elements'],
    },
};

const generateInteractiveChartFunctionDeclaration: FunctionDeclaration = {
    name: 'generate_interactive_chart',
    description: 'Generates and displays an interactive chart (bar or line) to visualize data. Use this when the user asks to compare data, show trends, or visualize a dataset.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'A descriptive title for the chart.' },
            chartType: { type: Type.STRING, enum: ['line', 'bar'], description: 'The type of chart to render.' },
            data: {
                type: Type.ARRAY,
                description: 'An array of data objects to be plotted.',
                items: { type: Type.OBJECT, properties: {} } // Generic objects
            },
            xAxisKey: { type: Type.STRING, description: 'The key from the data objects to use for the X-axis.' },
            yAxisKeys: {
                type: Type.ARRAY,
                description: 'An array of keys from the data objects to plot on the Y-axis, along with their colors.',
                items: {
                    type: Type.OBJECT,
                    properties: {
                        key: { type: Type.STRING },
                        color: { type: Type.STRING, description: 'A hex or CSS color string (e.g., "#8884d8").' }
                    },
                    required: ['key', 'color']
                }
            }
        },
        required: ['title', 'chartType', 'data', 'xAxisKey', 'yAxisKeys'],
    },
};

const scheduleEventFunctionDeclaration: FunctionDeclaration = {
  name: 'schedule_event',
  description: 'Schedules a new event on the user\'s calendar. Use this when the user asks to schedule, book, or create a meeting or event.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'The title of the event.' },
      description: { type: Type.STRING, description: 'A brief description of the event. Optional.' },
      startTime: { type: Type.STRING, description: 'The event start time in ISO 8601 format.' },
      endTime: { type: Type.STRING, description: 'The event end time in ISO 8601 format.' },
    },
    required: ['title', 'startTime', 'endTime'],
  },
};

export const generateSpeech = async (text: string, voiceName: string): Promise<string | null> => {
  if (!ai) return null;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error('Error generating speech:', error);
    return null;
  }
};

export const generateTextAndImageContent = async (
    persona: Persona,
    userMessage: Message,
    settings: Settings,
    aiMode: AiMode,
    documentContent?: string,
    usePro?: boolean,
    isFirstMessage?: boolean,
    speakerNames?: Record<string, string>,
    fullMeetingTranscript?: { polished: string; english: string; },
    dataFileContent?: string,
): Promise<GeminiServiceResponse> => {
    if (!ai) {
        return { text: OFFLINE_RESPONSE_TEXT, image: null, news: null };
    }

    try {
        // This is a simplified implementation. A full implementation would have complex
        // logic to build prompts, system instructions, and schemas for each AI mode.
        const model = usePro ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
        let contents: any = userMessage.text || '';
        if (userMessage.image) {
            contents = { parts: [{text: userMessage.text}, {inlineData: {data: userMessage.image.data, mimeType: userMessage.image.mimeType}}]};
        }

        const response = await ai.models.generateContent({
            model: model,
            contents: contents,
            // A real implementation would add system instructions, tools, etc. based on aiMode
        });
        
        // This simplified version only returns text. A full implementation would parse
        // JSON, handle function calls, and populate the full GeminiServiceResponse.
        return { text: response.text, image: null, news: null };
    } catch (error) {
        console.error("Error in generateTextAndImageContent:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return { text: `Sorry, I encountered an error: ${errorMessage}`, image: null, news: null };
    }
};

export const generateCalendarSuggestion = async (event: CalendarEvent): Promise<ProactiveCalendarSuggestionContent> => {
    const defaultSuggestion = {
        suggestionText: `You have an upcoming event: "${event.title}". Would you like me to prepare some talking points?`,
        event,
    };

    if (!ai) return defaultSuggestion;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `An event titled "${event.title}" is starting soon. The description is: "${event.description}". Generate a concise, one-sentence suggestion to help the user prepare for it. Frame it as a question. For example: "Your meeting 'Project Phoenix Sync' is soon. Shall I summarize the last meeting's notes?"`,
        });
        return { suggestionText: response.text.trim(), event };
    } catch (error) {
        console.error("Error generating calendar suggestion:", error);
        return defaultSuggestion;
    }
};

export const generateNewsScript = async (prompt: string): Promise<{ persona: Persona; text: string }[] | null> => {
    if (!ai) return null;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                systemInstruction: `You are a news script writer for a dual-anchor news program featuring 'Agent Zero' (male, analytical) and 'Agent Zara' (female, insightful). Generate a script based on the user's request. You MUST format the output as a valid JSON array of objects, where each object has a "persona" ("Agent Zero" or "Agent Zara") and a "text" (what they say). Alternate between the speakers.`,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            persona: { type: Type.STRING, enum: ['Agent Zero', 'Agent Zara'] },
                            text: { type: Type.STRING },
                        },
                        required: ['persona', 'text'],
                    },
                },
                tools: [{googleSearch: {}}],
            },
        });

        const script = JSON.parse(response.text);
        return script;
    } catch (error) {
        console.error("Error generating news script:", error);
        return null;
    }
};

export const getLatestHeadlines = async (topic: string = 'world news'): Promise<string[] | null> => {
    if (!ai) return null;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `List the top 5 latest headlines for ${topic}. Return only a bulleted list of the headlines.`,
            config: {
                tools: [{googleSearch: {}}],
            },
        });
        return response.text.split('\n').map(line => line.replace(/[-*]\s*/, '').trim()).filter(Boolean);
    } catch (error) {
        console.error("Error getting latest headlines:", error);
        return null;
    }
};

export const generateVideo = async (prompt: string, image?: { data: string, mimeType: string }): Promise<{ downloadUrl: string }> => {
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
        await window.aistudio.openSelectKey();
    }
    const currentAi = new GoogleGenAI({ apiKey: process.env.API_KEY! });


    let operation = await currentAi.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: image ? { imageBytes: image.data, mimeType: image.mimeType } : undefined,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: '16:9'
        }
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await currentAi.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Video generation completed but no download link was found.");
    }
    
    const fullDownloadLink = `${downloadLink}&key=${process.env.API_KEY}`;
    return { downloadUrl: fullDownloadLink };
};

export const editImage = async (prompt: string, image: { data: string; mimeType: string }): Promise<GeminiServiceResponse> => {
    if (!ai) return { text: OFFLINE_RESPONSE_TEXT, image: null, news: null };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data: image.data, mimeType: image.mimeType } },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        let newImage: { data: string; mimeType: string; } | null = null;
        let textResponse: string | null = null;

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
                newImage = { data: part.inlineData.data, mimeType: part.inlineData.mimeType };
            } else if (part.text) {
                textResponse = part.text;
            }
        }
        
        if (!newImage) {
            throw new Error("Image editing did not return an image.");
        }

        return { text: textResponse, image: newImage, news: null };
    } catch (error) {
        console.error("Error editing image:", error);
        throw error;
    }
};

export const connectToLive = async (
    persona: Persona,
    settings: Settings,
    aiMode: AiMode,
    view: View,
    callbacks: LiveCallbacks,
    systemInstructionOverride?: string,
    useProactiveTools?: boolean,
    chatContext?: string
): Promise<LiveSession> => {
    if (!ai) throw new Error("AI service not configured.");
    
    const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: settings.voiceName } },
            },
            systemInstruction: systemInstructionOverride || "You are a helpful AI assistant.",
            outputAudioTranscription: {},
            inputAudioTranscription: {},
        },
    });

    return sessionPromise;
};

export const createAudioBlob = (data: Float32Array): GenAI_Blob => {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
};

export const detectSentiment = async (text: string): Promise<'positive' | 'negative' | 'neutral' | null> => {
    if (!ai || !text.trim()) return null;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze the sentiment of the following text and return only one word: 'positive', 'negative', or 'neutral'.\n\nTEXT: "${text}"`,
        });
        const sentiment = response.text.trim().toLowerCase();
        if (sentiment === 'positive' || sentiment === 'negative' || sentiment === 'neutral') {
            return sentiment as 'positive' | 'negative' | 'neutral';
        }
        return null;
    } catch (error) {
        console.error("Error detecting sentiment:", error);
        return null;
    }
};

export const polishTranscript = async (transcript: string, speakerNames: Record<string, string>): Promise<string> => {
    if (!ai || !transcript.trim()) return transcript;
    try {
        let speakerMapping = "The speakers are identified as follows:\n";
        for (const [id, name] of Object.entries(speakerNames)) {
            if (name) {
                speakerMapping += `- ${id}: ${name}\n`;
            }
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Please polish the following raw meeting transcript. Correct any grammatical errors, fix punctuation, and improve readability. Do not change the meaning. If speaker names are provided, replace speaker IDs (e.g., "Speaker 1") with their actual names.\n\n${speakerMapping}\nRAW TRANSCRIPT:\n${transcript}`,
        });
        return response.text;
    } catch (error) {
        console.error("Error polishing transcript:", error);
        return transcript;
    }
};

export const generatePersonImage = async (prompt: string): Promise<{ data: string; mimeType: string } | null> => {
    if (!ai) return null;
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });
        const base64ImageBytes: string | undefined = response.generatedImages?.[0]?.image.imageBytes;
        if (base64ImageBytes) {
            return { data: base64ImageBytes, mimeType: 'image/jpeg' };
        }
        return null;
    } catch (error) {
        console.error("Error generating person image:", error);
        return null;
    }
};

export const getAssistantResponse = async (prompt: string): Promise<string> => {
    if (!ai) {
        return "The AI assistant is currently offline.";
    }

    const modeList = AI_MODES.map(m => `- ${m.name} (${m.mode})`).join('\n');

    const systemInstruction = `You are the Webzero System Assistant. Your goal is to help users understand and navigate the application. You are friendly, concise, and helpful. You are aware of the application's different modes and features.

The available modes are:
${modeList}

When a user asks how to do something, explain the relevant mode and provide a special action command to help them switch. The command format is: [ACTION:SWITCH_MODE:mode_name]

**Example 1:**
User: "How can I get the latest news?"
Your response: "You can use the Newsroom mode for that. I'll search the web for the latest headlines on any topic you provide. [ACTION:SWITCH_MODE:news]"

**Example 2:**
User: "I want to practice for a test."
Your response: "The Study mode is perfect for that! You can upload documents, create study guides, practice drills, and take quizzes. [ACTION:SWITCH_MODE:study]"

Keep your explanations brief and always include the action command when a mode switch is relevant.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error in getAssistantResponse:", error);
        return "I'm sorry, I encountered an error while trying to help.";
    }
};