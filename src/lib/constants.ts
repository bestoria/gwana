// FIX: Import React to resolve the 'Cannot find namespace React' error when using React.ElementType.
import React from 'react';
import type { AiMode, EmojiCategory, Message, Settings, WorkflowActionType } from './types';
import { Globe, BookOpen, Newspaper, HelpCircle, Languages, Scale } from 'lucide-react';

export const EMOJI_CATEGORIES: EmojiCategory = {
    'Smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳'],
    'Gestures': ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪'],
    'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💕', '💞', '💓', '💗', '💖', '💘', '💝'],
    'Symbols': ['✨', '⭐', '🌟', '💫', '🔥', '💯', '✅', '❌', '⚡', '💥', '💢', '💦', '💨', '🎉', '🎊', '🎈', '🎁', '🏆'],
    'Objects': ['📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '📷', '📹', '🎥', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️']
} as const;

export const AI_MODE_GREETINGS: Record<AiMode, string> = {
    default: "Standard mode engaged. I can answer questions, generate text, create stories, generate images and videos, visualize ideas, and assist with a wide range of tasks. How can I help you?",
    study: "Welcome to the Classroom. I'm ready for our one-on-one session. What topic would you like to cover today? You can type a subject or upload a document to get started.",
    news: "Welcome to the Newsroom. To get started, please provide a topic and an optional location. I will then search the web to generate a polished report on the top 10 headlines.",
    quiz: "Quiz mode activated. I can test your knowledge on any subject. What topic would you like to be quizzed on?",
    debate: "Welcome to the Debate Stage. Enter a resolution or topic, and I will moderate a structured debate between Agent Zero and Agent Zara.",
    translator: "Translator mode activated. I can translate text between languages. What would you like to translate?",
};

export const DEFAULT_SETTINGS: Settings = {
    voiceName: 'Algieba',
    personality: 'casual',
    responseLength: 'balanced',
    fontSize: 'medium',
    notifications: true,
    theme: 'dark',
    linkPreview: true,
    markdownSupport: true,
    predictiveText: true,
    meetingReportTemplate: `# {{title}}\n\n## Summary\n{{summary}}\n\n## Action Items\n{{actionItems}}\n\n## Key Decisions\n{{keyDecisions}}`,
} as const;

export const AI_MODES: ReadonlyArray<{ name: string; mode: AiMode; icon: string; iconComponent: React.ElementType }> = [
    { name: 'General', mode: 'default', icon: '🌐', iconComponent: Globe },
    { name: 'Study', mode: 'study', icon: '🎓', iconComponent: BookOpen },
    { name: 'News', mode: 'news', icon: '📰', iconComponent: Newspaper },
    { name: 'Quiz', mode: 'quiz', icon: '❓', iconComponent: HelpCircle },
    { name: 'Debate', mode: 'debate', icon: '⚖️', iconComponent: Scale },
    { name: 'Translator', mode: 'translator', icon: '↔️', iconComponent: Languages },
] as const;

// Voice names for different personas
// FIX: Corrected persona voice name constants to match 'Persona' type ('Agent Zero', 'Agent Zara').
export const VOICE_NAMES = {
  AGENT_ZERO_DEFAULT: 'Algieba',
  AGENT_ZARA_DEFAULT: 'Zephyr',
  AVAILABLE: ['Zephyr', 'Puck', 'Charon', 'Kore', 'Algieba'] as const
} as const;

// Audio configuration constants
export const AUDIO_CONFIG = {
  INPUT_SAMPLE_RATE: 16000,
  OUTPUT_SAMPLE_RATE: 24000,
  SCRIPT_PROCESSOR_BUFFER_SIZE: 4096,
  NUM_CHANNELS: 1,
  SPEAKING_THRESHOLD: 0.03,
  SPEAKING_TIMEOUT_MS: 1500,
  MASTER_GAIN: 0.3,
} as const;

// UI configuration constants
export const UI_CONFIG = {
  DESKTOP_BREAKPOINT: 1024,
  TOAST_DURATION_MS: 3000,
  ANIMATION_DURATION_MS: 500,
} as const;

// NEW: For Workflow Automation Engine
export const WORKFLOW_ACTIONS: Record<WorkflowActionType, {
    label: string;
    description: string;
    params: Record<string, { type: 'string' | 'number' | 'select', label: string, required: boolean, options?: readonly string[], placeholder?: string }>;
    output: { type: 'string' | 'audio' | 'none', description: string, feedsInto?: string[] };
}> = {
    get_news: {
        label: 'Get News',
        description: 'Fetches top news stories on a specific topic using the web search tool.',
        params: {
            topic: { type: 'string', label: 'Topic', required: true, placeholder: 'e.g., AI advancements' },
        },
        output: { type: 'string', description: 'A formatted string of news article titles and summaries.', feedsInto: ['text'] }
    },
    summarize_text: {
        label: 'Summarize Text',
        description: 'Summarizes a given block of text to a specified length.',
        params: {
            text: { type: 'string', label: 'Text to Summarize', required: true, placeholder: 'Enter text or use output from previous step' },
            maxLengthWords: { type: 'number', label: 'Max Length (words)', required: false, placeholder: 'e.g., 100' }
        },
        output: { type: 'string', description: 'The summarized text.', feedsInto: ['text', 'title', 'description'] }
    },
    generate_audio: {
        label: 'Generate Audio (TTS)',
        description: 'Converts a block of text into spoken audio.',
        params: {
            text: { type: 'string', label: 'Text to Speak', required: true, placeholder: 'Enter text or use output from previous step' },
            voiceName: { type: 'select', label: 'Voice', required: false, options: VOICE_NAMES.AVAILABLE }
        },
        output: { type: 'audio', description: 'The generated audio data (base64).', feedsInto: [] }
    },
    add_to_calendar: {
        label: 'Add to Calendar',
        description: 'Schedules a new event on your in-app calendar.',
        params: {
            title: { type: 'string', label: 'Event Title', required: true, placeholder: 'e.g., Daily Briefing' },
            description: { type: 'string', label: 'Description', required: false, placeholder: 'Use output from a summary step...' },
            durationMinutes: { type: 'number', label: 'Duration (minutes)', required: true, placeholder: 'e.g., 15' }
        },
        output: { type: 'none', description: 'No output, adds event to calendar.' }
    }
};

export const SUPPORTED_LANGUAGES: ReadonlyArray<{ code: string; name: string }> = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ha', name: 'Hausa' },
    { code: 'yo', name: 'Yoruba' },
    { code: 'ig', name: 'Igbo' },
    { code: 'sw', name: 'Swahili' },
] as const;