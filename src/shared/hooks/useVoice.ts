import { useState, useCallback } from 'react';
import { VoiceService } from '@/src/core/system/VoiceService';

export const useVoice = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const startListening = useCallback(() => {
    VoiceService.startListening((text, isFinal) => {
      setTranscript(text);
      if (isFinal) {
        setIsListening(false);
      }
    });
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    VoiceService.stopListening();
    setIsListening(false);
  }, []);

  const speak = useCallback((text: string, options?: { rate?: number; pitch?: number; volume?: number }) => {
    setIsSpeaking(true);
    VoiceService.speak(text, options);
    setTimeout(() => setIsSpeaking(false), 3000); // Approximate
  }, []);

  const stopSpeaking = useCallback(() => {
    VoiceService.stopSpeaking();
    setIsSpeaking(false);
  }, []);

  return {
    isListening,
    transcript,
    isSpeaking,
    isSupported: VoiceService.isSupported(),
    startListening,
    stopListening,
    speak,
    stopSpeaking
  };
};
