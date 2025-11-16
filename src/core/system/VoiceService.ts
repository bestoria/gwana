// Centralized voice service for speech recognition and synthesis
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceCommand {
  pattern: RegExp;
  action: (matches: RegExpMatchArray) => void;
  description: string;
}

class VoiceServiceClass {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening = false;
  private commands: VoiceCommand[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-NG';
      }
      this.synthesis = window.speechSynthesis;
    }
  }

  isSupported() {
    return this.recognition !== null && this.synthesis !== null;
  }

  registerCommand(command: VoiceCommand) {
    this.commands.push(command);
  }

  startListening(onTranscript: (text: string, isFinal: boolean) => void) {
    if (!this.recognition || this.isListening) return;

    this.recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        onTranscript(finalTranscript, true);
        this.processCommands(finalTranscript);
      } else if (interimTranscript) {
        onTranscript(interimTranscript, false);
      }
    };

    this.recognition.start();
    this.isListening = true;
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  speak(text: string, options?: { rate?: number; pitch?: number; volume?: number }) {
    if (!this.synthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-NG';
    utterance.rate = options?.rate || 1;
    utterance.pitch = options?.pitch || 1;
    utterance.volume = options?.volume || 1;

    this.synthesis.speak(utterance);
  }

  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  private processCommands(text: string) {
    for (const command of this.commands) {
      const matches = text.match(command.pattern);
      if (matches) {
        command.action(matches);
        break;
      }
    }
  }
}

export const VoiceService = new VoiceServiceClass();
