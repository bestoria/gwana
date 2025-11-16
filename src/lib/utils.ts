import type { Persona, MemoryFragment, AiMode, UserMood } from './types';

// Time and Date formatting
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
};

export const groupMessagesByDate = <T extends { timestamp: number }>(messages: T[]) => {
  const groups: { [key: string]: T[] } = {};
  messages.forEach(msg => {
    const date = formatDate(msg.timestamp);
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
  });
  return groups;
};

// Format text with markdown support
export const formatText = (text: string): string => {
    const lines = text.split('\n');
    let html = '';
    let listType: 'ul' | 'ol' | null = null;

    const inlineFormat = (line: string) => {
        return line
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-black/50 text-fuchsia-300 px-1 rounded-sm font-mono">$1</code>');
    };

    const closeList = () => {
        if (listType) {
            html += `</${listType}>`;
            listType = null;
        }
    };

    lines.forEach(line => {
        const ulMatch = line.match(/^(\s*)[-*]\s+(.*)/);
        if (ulMatch) {
            if (listType !== 'ul') {
                closeList();
                html += '<ul class="list-disc list-inside pl-4 space-y-1">';
                listType = 'ul';
            }
            html += `<li>${inlineFormat(ulMatch[2])}</li>`;
            return;
        }

        const olMatch = line.match(/^(\s*)\d+\.\s+(.*)/);
        if (olMatch) {
            if (listType !== 'ol') {
                closeList();
                html += '<ol class="list-decimal list-inside pl-4 space-y-1">';
                listType = 'ol';
            }
            html += `<li>${inlineFormat(olMatch[2])}</li>`;
            return;
        }

        closeList(); // End of list

        if (line.trim() === '') {
            html += '<div class="h-4"></div>'; // Represents a paragraph break
        } else {
            html += `<p>${inlineFormat(line)}</p>`;
        }
    });

    closeList(); // Close any remaining list
    return html;
};


// Detect and linkify URLs
export const linkifyText = (text: string): string => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">$1</a>');
};

// --- AUDIO MANAGER ---
type SoundType = 'click' | 'send' | 'type' | 'swoosh' | 'typing-ai' | 'confirm';

class AudioManager {
    private audioCtx: AudioContext | null = null;
    private isInitialized = false;
    private ambientNode: OscillatorNode | null = null;
    private masterGain: GainNode | null = null;
    private ringtoneInterval: number | null = null;
    private ringCount = 0;
    private ttsAudioContext: AudioContext | null = null;
    private ttsGainNode: GainNode | null = null;
    private currentTTSSource: AudioBufferSourceNode | null = null;

    init() {
        if (this.isInitialized || typeof window === 'undefined') return;
        try {
            this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.audioCtx.createGain();
            this.masterGain.gain.value = 0.3; // Lower master volume
            this.masterGain.connect(this.audioCtx.destination);
            
            this.ttsAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            this.ttsGainNode = this.ttsAudioContext.createGain();
            this.ttsGainNode.gain.value = 0.8; // TTS can be a bit louder
            this.ttsGainNode.connect(this.ttsAudioContext.destination);

            this.isInitialized = true;
        } catch (e) {
            console.error("Web Audio API is not supported in this browser", e);
        }
    }

    playSound(type: SoundType) {
        if (!this.audioCtx || !this.masterGain) return;
        const now = this.audioCtx.currentTime;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain);

        switch(type) {
            case 'click':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(880, now);
                gain.gain.setValueAtTime(0.5, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            case 'send':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, now);
                gain.gain.setValueAtTime(0.4, now);
                osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.2);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;
            case 'type':
                osc.type = 'square';
                osc.frequency.setValueAtTime(1200, now);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
                break;
            case 'typing-ai':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(1500, now);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
                osc.start(now);
                osc.stop(now + 0.03);
                break;
            case 'swoosh':
                osc.disconnect(); // Disconnect the unused oscillator
                const noise = this.audioCtx.createBufferSource();
                const buffer = this.audioCtx.createBuffer(1, this.audioCtx.sampleRate * 0.2, this.audioCtx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < data.length; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                noise.buffer = buffer;

                const bandpass = this.audioCtx.createBiquadFilter();
                bandpass.type = 'bandpass';
                bandpass.frequency.setValueAtTime(1500, now);
                bandpass.Q.setValueAtTime(1, now);
                bandpass.frequency.exponentialRampToValueAtTime(100, now + 0.2);

                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
                
                noise.connect(bandpass);
                bandpass.connect(gain);
                noise.start(now);
                noise.stop(now + 0.2);
                break;
            case 'confirm':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(659.25, now);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);

                const osc2 = this.audioCtx.createOscillator();
                const gain2 = this.audioCtx.createGain();
                osc2.connect(gain2);
                gain2.connect(this.masterGain);
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(880, now + 0.1);
                gain2.gain.setValueAtTime(0.3, now + 0.1);
                gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
                osc2.start(now + 0.1);
                osc2.stop(now + 0.25);
                break;
        }
    }
    
    playRingtone() {
        if (!this.audioCtx || !this.masterGain || this.ringtoneInterval) return;

        const playDualTone = (freq1: number, freq2: number, duration: number) => {
            if (!this.audioCtx || !this.masterGain) return;
            const now = this.audioCtx.currentTime;
            
            const osc1 = this.audioCtx.createOscillator();
            const osc2 = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc1.type = 'sine';
            osc1.frequency.value = freq1;
            osc2.type = 'sine';
            osc2.frequency.value = freq2;

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.15, now + 0.01);
            gain.gain.setValueAtTime(0.15, now + duration - 0.01);
            gain.gain.linearRampToValueAtTime(0, now + duration);

            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(this.masterGain);

            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + duration);
            osc2.stop(now + duration);
        };
        
        this.ringCount = 0;
        const maxRings = 2;
        
        const ringPattern = () => {
            if (this.ringCount < maxRings) {
                playDualTone(440, 480, 1.5); // 1.5 second ring
                this.ringCount++;
            } else {
                this.stopRingtone();
            }
        };

        ringPattern();
        this.ringtoneInterval = window.setInterval(ringPattern, 3500); // 1.5s ring + 2s silence
    }

    stopRingtone() {
        if (this.ringtoneInterval) {
            clearInterval(this.ringtoneInterval);
            this.ringtoneInterval = null;
            this.ringCount = 0;
        }
    }
    
    async playTTS(base64: string): Promise<void> {
        if (!this.ttsAudioContext || !this.ttsGainNode) return;
        if (this.ttsAudioContext.state === 'suspended') {
            await this.ttsAudioContext.resume();
        }

        this.stopTTS();

        try {
            const audioData = decode(base64);
            const audioBuffer = await decodeAudioData(audioData, this.ttsAudioContext, 24000, 1);
            
            const source = this.ttsAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.ttsGainNode);
            source.start(0);

            this.currentTTSSource = source;
            
            return new Promise((resolve) => {
                source.onended = () => {
                    if (this.currentTTSSource === source) {
                        this.currentTTSSource = null;
                    }
                    resolve();
                };
            });
        } catch (e) {
            console.error("Failed to play TTS audio:", e);
        }
    }

    stopTTS() {
        if (this.currentTTSSource) {
            try {
                this.currentTTSSource.stop();
            } catch (e) { /* already stopped */ }
            this.currentTTSSource = null;
        }
    }

    startAmbience() {
        if (!this.audioCtx || this.ambientNode || !this.masterGain) return;
        this.ambientNode = this.audioCtx.createOscillator();
        const ambientGain = this.audioCtx.createGain();
        this.ambientNode.type = 'sine';
        this.ambientNode.frequency.value = 40; // low hum
        ambientGain.gain.value = 0.05; // very quiet
        this.ambientNode.connect(ambientGain);
        ambientGain.connect(this.masterGain);
        this.ambientNode.start();
    }
}
export const audioManager = new AudioManager();

// --- THROTTLE UTILITY ---
export const throttle = (func: (...args: any[]) => void, delay: number) => {
    let inProgress = false;
    return (...args: any[]) => {
        if (inProgress) return;
        inProgress = true;
        func(...args);
        setTimeout(() => {
            inProgress = false;
        }, delay);
    };
};

// --- DYNAMIC TONE ADAPTATION ---

const moodKeywords: Record<UserMood, string[]> = {
    formal: ['regarding', 'professional', 'request', 'assistance', 'sincerely', 'formal', 'utilize'],
    casual: ['hey', 'lol', 'btw', 'gonna', 'wanna', 'cool', 'awesome', 'sup', 'yo'],
    urgent: ['asap', 'urgent', 'now', 'immediately', 'critical', 'need', 'help'],
    creative: ['imagine', 'what if', 'brainstorm', 'idea', 'create', 'design', 'envision'],
    inquisitive: ['why', 'how', 'what', 'explain', 'tell me', 'curious', 'understand'],
    frustrated: ["doesn't work", "it's not working", 'broken', 'error', 'can\'t', 'frustrating', 'issue', 'problem'],
};

export const detectUserMood = (text: string): UserMood | null => {
    if (!text) return null;
    const lowerText = text.toLowerCase();
    const scores: Record<UserMood, number> = {
        formal: 0,
        casual: 0,
        urgent: 0,
        creative: 0,
        inquisitive: 0,
        frustrated: 0,
    };

    let keywordFound = false;
    for (const mood in moodKeywords) {
        for (const keyword of moodKeywords[mood as UserMood]) {
            if (lowerText.includes(keyword)) {
                scores[mood as UserMood]++;
                keywordFound = true;
            }
        }
    }
    
    if (!keywordFound) return null;

    const highestMood = Object.keys(scores).reduce((a, b) => scores[a as UserMood] > scores[b as UserMood] ? a : b) as UserMood;

    if (scores[highestMood] > 0) {
        return highestMood;
    }

    return null;
};

// --- LONG-TERM MEMORY MANAGEMENT ---
const MEMORY_LIMIT = 50;
const getMemoryKey = (persona: Persona) => `webzero_memory_${persona.replace(' ', '_')}`;

// Helper to save all memories at once
export const saveAllMemoryFragments = (persona: Persona, fragments: MemoryFragment[]) => {
    try {
        localStorage.setItem(getMemoryKey(persona), JSON.stringify(fragments.slice(0, MEMORY_LIMIT)));
    } catch (e) {
        console.error("Failed to save all memories:", e);
    }
};

export const getMemoryFragments = (persona: Persona): MemoryFragment[] => {
    try {
        const stored = localStorage.getItem(getMemoryKey(persona));
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error("Failed to retrieve memories:", e);
        return [];
    }
};

export const saveMemoryFragment = (persona: Persona, fragment: MemoryFragment) => {
    try {
        const memories = getMemoryFragments(persona);
        // Avoid saving duplicate summaries
        if (memories.some(m => m.summary === fragment.summary)) return;
        
        const updatedMemories = [fragment, ...memories];
        saveAllMemoryFragments(persona, updatedMemories);
    } catch (e) {
        console.error("Failed to save memory:", e);
    }
};

export const deleteMemoryFragment = (persona: Persona, timestamp: number) => {
    const memories = getMemoryFragments(persona);
    const updatedMemories = memories.filter(mem => mem.timestamp !== timestamp);
    saveAllMemoryFragments(persona, updatedMemories);
};

export const updateMemoryFragment = (persona: Persona, updatedFragment: MemoryFragment) => {
    const memories = getMemoryFragments(persona);
    const updatedMemories = memories.map(mem => 
        mem.timestamp === updatedFragment.timestamp ? updatedFragment : mem
    );
    saveAllMemoryFragments(persona, updatedMemories);
};


export const getRelevantMemoryFragments = (
  persona: Persona, 
  prompt: string, 
  currentMode: AiMode,
  count = 3
): MemoryFragment[] => {
    const memories = getMemoryFragments(persona);
    if (!prompt || memories.length === 0) return [];

    const promptWords = new Set(prompt.toLowerCase().split(/\s+/).filter(w => w.length > 2));
    if (promptWords.size === 0) return [];

    const scoredMemories = memories.map(mem => {
        let score = 0;
        const topicWords = new Set(mem.topic.toLowerCase().split(/\s+/));
        const summaryWords = new Set(mem.summary.toLowerCase().split(/\s+/));
        const entityWords = new Set(mem.related_entities.flatMap(e => e.toLowerCase().split(/\s+/)));

        promptWords.forEach(word => {
            if (topicWords.has(word)) score += 5;
            if (summaryWords.has(word)) score += 1;
            if (entityWords.has(word)) score += 3;
        });

        // Boost score for memories from the same mode
        if (mem.mode === currentMode) score *= 1.2;

        return { ...mem, score };
    });

    return scoredMemories
        .filter(mem => mem.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, count);
};


// Audio processing functions for Gemini Live API

// Encodes raw audio bytes to a base64 string
export function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Decodes a base64 string to raw audio bytes
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Decodes raw PCM audio data into an AudioBuffer for playback
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            // The result includes the mime type header, so we split and take the second part.
            const base64String = result.split(',')[1];
            if (base64String) {
                resolve(base64String);
            } else {
                reject(new Error("Failed to read blob data as base64."));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
    });
};