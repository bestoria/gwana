import { LiveServerMessage } from "@google/genai";

// FIX: Defined the AIStudio interface to resolve a global type conflict. The compiler expects window.aistudio to be of type 'AIStudio', so this definition satisfies that requirement.
// Inlined the interface to prevent type name collision from multiple global declarations.
declare global {
  // FIX: Defined the AIStudio interface and used it for window.aistudio to resolve the subsequent property declaration error.
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

export interface SubscriptionState {
  isActive: boolean;
  expiresAt: number | null;
  plan: 'free' | 'monthly' | 'quarterly' | 'annually' | null;
  freeMinutesUsedToday?: number; // in seconds
  lastUsedDate?: string; // 'YYYY-MM-DD'
}

export interface UserProfile {
  id: string; // Supabase auth user id
  phone: string;
  name: string;
  gender: 'male' | 'female' | null;
  subscription: SubscriptionState;
}


export interface Country {
  name: string;
  flag: string;
  code: string;
  dial_code: string;
  pattern: string;
}

export type AiMode = string;

export type EmojiCategory = {
  [key: string]: string[];
};

export type UserMood = 'formal' | 'casual' | 'urgent' | 'creative' | 'inquisitive' | 'frustrated';
export type UserEmotion = 'neutral' | 'happy' | 'sad' | 'angry' | 'frustrated' | 'tired' | 'excited';

export type MessageStatus = 'sent' | 'delivered' | 'read';
export type MessageSender = 'user' | 'bot' | 'system';

// FIX: Changed Persona type to be consistent across the app.
export type Persona = 'Agent Zero' | 'Agent Zara';

export interface MessageReaction {
  emoji: string;
  count: number;
}

export interface MessageImage {
  data: string;
  mimeType: string;
  preview?: string;
}

export interface CodeBlockContent {
  language: string;
  code: string;
}

export interface FileContent {
  fileName: string;
  fileSize: string;
  fileType: string;
}

// NEW: For CSV data uploads
export interface DataFileContent {
  name: string;
  content: string; // raw CSV string content
}

export interface NewsArticle {
  title: string;
  uri: string;
  source: string;
  summary?: string;
}

export interface NewsContent {
  articles: NewsArticle[];
}

// FIX: Added missing NewsBriefingContent interface to resolve import error in NewsBriefingDisplay.tsx
export interface NewsBriefingContent {
  topStory: string;
  developingAngles: string[];
  marketImpact: string;
  sources: { title: string; uri: string }[];
}


// NEW: For Job Search feature (remains unchanged)
export interface JobListing {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  isRemote?: boolean;
}

export interface JobContent {
  listings: JobListing[];
}

// NEW: For Resume Synergy Analysis
export interface SynergyAnalysisContent {
  synergyScore: number;
  strengths: string[];
  opportunities: string[];
  jobTitle: string;
  company: string;
}

// FIX: Added missing type definitions for ResearchDossierContent and SWOTContent.
// NEW: For Research Dossiers
export interface ResearchDossierContent {
  summary: string;
  keyFindings: string[];
  counterArguments: string[];
  sources: { title: string; uri: string }[];
  furtherReading: string[];
}

// NEW: For SWOT Analysis
export interface SWOTContent {
  topic: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

// --- STUDY HUB & CLASSROOM TYPES ---

export interface PracticeDrill {
  question: string;
  answer: string;
}

export interface PracticeSession {
  id: string;
  type: 'practice';
  topic: string;
  drills: PracticeDrill[];
}

export interface KeyConcept {
  term: string;
  definition: string;
}

export interface StudyGuide {
  id: string;
  type: 'guide';
  topic: string;
  summary: string;
  keyConcepts: KeyConcept[];
  reviewQuestions: string[];
}

export interface ItineraryActivity {
  time: string;
  description: string;
  type: 'dining' | 'activity' | 'lodging' | 'travel';
}
export interface ItineraryDay {
  day: number;
  date: string;
  activities: ItineraryActivity[];
}
export interface ItineraryContent {
  id: string;
  type: 'itinerary';
  title: string;
  days: ItineraryDay[];
}

export interface Flashcard {
  term: string;
  definition: string;
  pronunciation?: string;
  srsData?: {
    repetition: number;
    easeFactor: number;
    interval: number; // in days
    dueDate: number; // timestamp
  };
}

export interface FlashcardContent {
  id: string;
  type: 'cards';
  topic: string;
  flashcards: Flashcard[];
}

export interface QuizQuestion {
  questionText: string;
  questionType: 'multiple-choice' | 'true-false';
  options: string[];
  correctAnswer: string; // The exact text of the correct option
  explanation: string; // Brief explanation of why the correct answer is correct.
  commentary: string; // Fun fact or encouragement from Agent Zara.
}

export interface QuizContent {
  id: string;
  type: 'quiz';
  topic: string;
  questions: QuizQuestion[];
}

// NEW: For Debate Mode
export interface DebateRound {
  type: 'Opening Statement' | 'Rebuttal' | 'Closing Statement';
  speaker: Persona;
  argument: string;
}

export interface DebateContent {
  id: string;
  type: 'debate';
  topic: string;
  stances: {
    agent_zero: 'For' | 'Against';
    agent_zara: 'For' | 'Against';
  };
  rounds: DebateRound[];
}


// NEW: For Goal-Oriented Learning Paths
export interface LearningPathModule {
  week: number;
  title: string;
  topics: string[];
}
export interface LearningPathContent {
  id: string;
  type: 'learningPath';
  goal: string;
  durationWeeks: number;
  modules: LearningPathModule[];
}

export type StudyHubItem = StudyGuide | FlashcardContent | PracticeSession | QuizContent | LearningPathContent;

// NEW: For tracking study progress
export interface StudyProgress {
  studyDays: string[]; // Array of 'YYYY-MM-DD' date strings
  totalItems: number;
}

// --- END STUDY HUB ---

// --- NEW: General Mode Structured Content ---
export interface RecipeContent {
  title: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: string;
  ingredients: string[];
  instructions: string[];
}

export interface BudgetPlannerContent {
  title: string;
  incomeSources: { source: string; amount: number }[];
  expenseCategories: { category: string; allocated: number; items: string[] }[];
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
  };
}
// --- END General Mode ---

// --- NEW: People & Places Mode ---
export interface PersonProfileContent {
  name: string;
  summary: string;
  image_prompt: string; // A prompt for DALL-E to generate a portrait
  timeline_events: {
    year: string;
    event: string;
  }[];
}

export interface PlaceProfileContent {
  name: string;
  summary: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  key_facts: {
    label: string;
    value: string;
  }[];
}
// --- END People & Places Mode ---


export interface AiSuggestion {
  label: string;
  prompt: string;
}

export interface MemoryFragment {
  topic: string;
  summary: string;
  timestamp: number;
  related_entities: string[];
  mode: AiMode;
}

// NEW: For tool use grounding
export interface ToolCallInfo {
  toolName: string;
  args?: any;
}

// NEW: For video generation
export interface VideoContent {
  status: 'generating' | 'complete' | 'error';
  prompt: string;
  downloadUrl?: string;
  errorMessage?: string;
}

export interface ProactiveSuggestion {
  targetMode: AiMode;
  suggestionText: string;
  initialPrompt: string;
}

export interface VoiceCallSuggestion {
    reason: string;
}

// NEW: For proactive actions
export interface ProactiveAction {
  targetMode: AiMode;
  actionDescription: string;
  generatedContent: Message;
}

// NEW: For meeting reports
export interface ActionItem {
  assignee: string;
  task: string;
}

export interface MeetingReportContent {
  title: string;
  summary: string;
  actionItems: ActionItem[];
  keyDecisions: string[];
  rawTranscript: string;
}

// For Interactive Charts (NEW)
export interface InteractiveChartContent {
  chartType: 'line' | 'bar';
  data: any[];
  xAxisKey: string;
  yAxisKeys: { key: string; color: string }[];
  title: string;
}

// For Custom Modes
export interface CustomAiMode {
    id: string;
    name: string;
    icon: string;
    instructions: string;
}

// For calendar integration
export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startTime: number;
  endTime: number;
}

// For proactive calendar suggestions
export interface ProactiveCalendarSuggestionContent {
  suggestionText: string;
  event: CalendarEvent;
}

// NEW: For Nexus Mode (Session Sharing)
export interface SharedSessionState {
  chatSessions: Record<AiMode, Message[]>;
  whiteboardElements: WhiteboardElement[];
  aiMode: AiMode;
  persona: Persona;
}

// NEW: For Workflow Automation
export type WorkflowActionType = 'get_news' | 'summarize_text' | 'generate_audio' | 'add_to_calendar';

export interface WorkflowStep {
  id: string;
  type: WorkflowActionType;
  params: Record<string, any>;
  inputFromStep?: {
      stepId: string;
      paramToFeed: string;
  };
}

export type WorkflowTriggerType = 'manual' | 'daily' | 'weekly' | 'once';

export interface ManualTrigger {
  type: 'manual';
}

export interface DailyTrigger {
  type: 'daily';
  time: string; // "HH:MM"
}

export interface WeeklyTrigger {
  type: 'weekly';
  time: string; // "HH:MM"
  days: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
}

export interface OnceTrigger {
  type: 'once';
  datetime: number; // timestamp
}

export type WorkflowTrigger = ManualTrigger | DailyTrigger | WeeklyTrigger | OnceTrigger;

export interface Workflow {
  id: string;
  name: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  isEnabled?: boolean; // To toggle the trigger
}

// NEW: For Newsroom Vetting Workflow
export interface NewsTip {
  id: string;
  text: string;
  submitter: string; // For now, just a placeholder like 'Agent'
  timestamp: number;
  confidenceScore: number;
  status: 'pending' | 'approved' | 'rejected';
  // Fields for when approved
  state?: string;
  region?: string;
  newsType?: string; // Renamed from 'type' to avoid conflicts
}

export interface Message {
  id: number;
  text?: string;
  sender: MessageSender;
  time: string;
  timestamp: number;
  status: MessageStatus;
  image?: MessageImage;
  audio?: string; // For user voice memos (blob URL)
  ttsAudio?: string; // For AI text-to-speech (base64)
  duration?: number;
  replyTo?: Message | null;
  reactions?: MessageReaction[];
  starred?: boolean;
  isError?: boolean;
  codeBlock?: CodeBlockContent;
  file?: FileContent;
  dataFile?: DataFileContent; // NEW: For CSV data
  news?: NewsContent;
  job?: JobContent;
  synergyAnalysis?: SynergyAnalysisContent; // NEW
  // FIX: Added missing optional properties for new structured content types.
  researchDossier?: ResearchDossierContent; // NEW
  swot?: SWOTContent; // NEW
  practice?: PracticeSession;
  studyGuide?: StudyGuide;
  itinerary?: ItineraryContent; // NEW
  flashcards?: FlashcardContent; // NEW
  quiz?: QuizContent; // NEW
  debate?: DebateContent; // NEW
  learningPath?: LearningPathContent; // NEW
  recipe?: RecipeContent; // NEW
  budget?: BudgetPlannerContent; // NEW
  personProfile?: PersonProfileContent; // NEW
  placeProfile?: PlaceProfileContent; // NEW
  suggestions?: AiSuggestion[];
  voiceCallSuggestion?: VoiceCallSuggestion;
  toolCallInfo?: ToolCallInfo;
  video?: VideoContent; // NEW
  // FIX: Add missing properties for proactive suggestions and actions.
  proactiveSuggestion?: ProactiveSuggestion;
  proactiveAction?: ProactiveAction;
  // FIX: Add missing drawCommands property
  drawCommands?: WhiteboardElement[]; // NEW
  groundingSources?: { title: string; uri: string }[];
  meetingReport?: MeetingReportContent; // NEW
  interactiveChart?: InteractiveChartContent; // NEW
  summary?: string; // For on-demand chat summaries
  originalMode?: AiMode; // For cross-mode search results
  persona?: Persona; // For multi-agent mode
  isDeleting?: boolean; // For UI animations
}

export type Personality = 'friendly' | 'professional' | 'casual' | 'enthusiastic';
export type ResponseLength = 'concise' | 'balanced' | 'detailed';
export type FontSize = 'small' | 'medium' | 'large';
export type Theme = 'dark' | 'light' | 'auto';
export type SearchFilterType = 'all' | 'images' | 'code' | 'files' | 'links';

export interface Settings {
  voiceName: string;
  personality: Personality;
  responseLength: ResponseLength;
  fontSize: FontSize;
  notifications: boolean;
  theme: Theme;
  linkPreview: boolean;
  markdownSupport: boolean;
  predictiveText: boolean;
  meetingReportTemplate: string;
}

export interface CallRecord {
  id: number;
  duration: number;
  timestamp: number;
  type: 'outgoing' | 'incoming';
}

export type View = 'dashboard' | 'chat' | 'settings' | 'studyHub' | 'calendar' | 'vettingQueue' | 'appDrawer';

// FIX: Added 'disconnecting' and 'paused' to the CallState type to reflect all possible states.
export type CallState = 'idle' | 'ringing' | 'connecting' | 'connected' | 'disconnecting' | 'confirmingEnd' | 'standby' | 'paused';

export interface LiveSession {
  sendRealtimeInput: (input: { media?: any; text?: string }) => Promise<void> | void;
  sendToolResponse?: (response: any) => Promise<void> | void;
  close: () => void;
}

export interface LiveCallbacks {
  onopen: () => void;
  onmessage: (message: LiveServerMessage) => Promise<void>;
  onerror: (e: ErrorEvent) => void;
  onclose: (e: any) => void;
}

export interface AudioContextRefs {
  inputContext: AudioContext | null;
  outputContext: AudioContext | null;
  gainNode: GainNode | null;
  analyserNode: AnalyserNode | null;
  scriptProcessor: ScriptProcessorNode | null;
}

export interface MediaRefs {
  mediaStream: MediaStream | null;
  mediaRecorder: MediaRecorder | null;
  screenRecorder: MediaRecorder | null;
  screenStream: MediaStream | null;
  currentAudio: HTMLAudioElement | null;
}

export interface StatisticsData {
  totalMessages: number;
  userMessages: number;
  botMessages: number;
  imageMessages: number;
  voiceMessages: number;
  starredMessages: number;
}

// NEW: For whiteboard mode
export interface WhiteboardBaseElement {
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
}

export interface WhiteboardPath extends WhiteboardBaseElement {
  type: 'path';
  d: string;
}

export interface WhiteboardCircle extends WhiteboardBaseElement {
  type: 'circle';
  cx: number;
  cy: number;
  r: number;
}

export interface WhiteboardRect extends WhiteboardBaseElement {
  type: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WhiteboardText extends WhiteboardBaseElement {
  type: 'text';
  x: number;
  y: number;
  text: string;
  fontSize?: number;
  fontFamily?: string;
}

export type WhiteboardElement = WhiteboardPath | WhiteboardCircle | WhiteboardRect | WhiteboardText;

// NEW: For live meeting reports
export interface LiveReportData {
  summaryPoints: string[];
  actionItems: ActionItem[];
  keyDecisions: string[];
}


// Utility type for ensuring exhaustive checks
export type Exhaustive<T> = T extends never ? never : T;

// Helper type for making specific properties optional
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Helper type for making specific properties required
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;