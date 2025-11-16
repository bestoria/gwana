import React, { useEffect, useRef, useState } from 'react';
import { renderBasicFace } from '@/src/lib/basic-face-render';
import useFace from '@/src/hooks/useFace';
import useHover from '@/src/hooks/useHover';
import useTilt from '@/src/hooks/useTilt';
import { useLiveAPIContext } from '@/src/contexts/LiveAPIContext';
import { Persona } from '@/src/lib/types';

interface TalkingEmojiProps {
    size?: number;
    persona: Persona;
    activePersona: Persona | null;
}

export default function TalkingEmoji({ size = 160, persona, activePersona }: TalkingEmojiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isTalking, setIsTalking] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const { volume } = useLiveAPIContext();
  
  const displayPersona = persona;
  
  const agent = {
      bodyColor: displayPersona === 'Agent Zero' ? 'hsl(180, 100%, 50%)' : 'hsl(300, 100%, 50%)',
      name: displayPersona,
  };

  const { mouthScale, eyeScale } = useFace({ isSpeaking: activePersona === persona });
  const hoverPosition = useHover({ amplitude: 5, frequency: 0.4 });
  const tiltAngle = useTilt({
    maxAngle: 4,
    speed: 0.05,
    isActive: isTalking,
  });

  // Use refs to store the latest animation values without re-triggering the effect
  const animationValuesRef = useRef({ mouthScale, eyeScale });
  useEffect(() => {
    animationValuesRef.current.mouthScale = mouthScale;
  }, [mouthScale]);
  useEffect(() => {
    animationValuesRef.current.eyeScale = eyeScale;
  }, [eyeScale]);

  // Detect talking state based on audio volume
  useEffect(() => {
    const AUDIO_OUTPUT_DETECTION_THRESHOLD = 0.05;
    const TALKING_STATE_COOLDOWN_MS = 1500;

    if (volume > AUDIO_OUTPUT_DETECTION_THRESHOLD && activePersona === persona) {
      setIsTalking(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(
        () => setIsTalking(false),
        TALKING_STATE_COOLDOWN_MS
      );
    }
  }, [volume, activePersona, persona]);

  // Render the face on the canvas using a continuous animation loop
  // This effect now runs only when the component mounts or critical props change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrameId: number;

    const renderLoop = () => {
        renderBasicFace({
            ctx,
            mouthScale: animationValuesRef.current.mouthScale,
            eyeScale: animationValuesRef.current.eyeScale,
            color: agent.bodyColor,
            persona: displayPersona,
        });
        animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
        cancelAnimationFrame(animationFrameId);
    };
  }, [agent.bodyColor, size, displayPersona]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`talking-emoji-canvas ${displayPersona === 'Agent Zara' ? 'agent-zara' : ''}`}
      style={{
        transform: `translateY(${hoverPosition}px) rotate(${tiltAngle}deg)`,
      }}
      aria-label={`Animated face of ${agent.name}`}
    />
  );
}
