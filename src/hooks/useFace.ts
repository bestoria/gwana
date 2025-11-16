/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useEffect, useRef, useState } from 'react';
import { useLiveAPIContext } from '../contexts/LiveAPIContext';

export type FaceResults = {
  /** A value that represents how open the eyes are. */
  eyeScale: number;
  /** A value that represents how open the mouth is. */
  mouthScale: number;
};

function easeOutQuint(x: number): number {
  return 1 - Math.pow(1 - x, 5);
}

// Constrain value between lower and upper limits
function clamp(x: number, lowerlimit: number, upperlimit: number) {
  if (x < lowerlimit) x = lowerlimit;
  if (x > upperlimit) x = upperlimit;
  return x;
}

// GLSL smoothstep implementation
function smoothstep(edge0: number, edge1: number, x: number) {
  // Scale, bias, and saturate to range [0,1]
  x = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  // Apply cubic polynomial smoothing
  return x * x * (3 - 2 * x);
}

type BlinkProps = {
  speed: number;
};

export function useBlink({ speed }: BlinkProps) {
  const [eyeScale, setEyeScale] = useState(1);
  const frameId = useRef(-1);
  const frameCounter = useRef(0);

  useEffect(() => {
    function nextFrame() {
      frameId.current = window.requestAnimationFrame(() => {
        frameCounter.current += 1;
        let s = easeOutQuint((Math.sin(frameCounter.current * speed) + 1) * 2);
        s = smoothstep(0.1, 0.25, s);
        s = Math.min(1, s);
        setEyeScale(s);
        nextFrame();
      });
    }

    nextFrame();

    return () => {
      window.cancelAnimationFrame(frameId.current);
    };
  }, [speed]);

  return eyeScale;
}

export default function useFace({ isSpeaking }: { isSpeaking: boolean }) {
  const { aiVolume, isAISpeaking } = useLiveAPIContext();
  const eyeScale = useBlink({ speed: 0.025 });
  
  const [mouthScale, setMouthScale] = useState(0);
  const animationFrameRef = useRef<number>(0);

  // Use refs to hold the latest values from context to avoid stale closures in the animation loop
  const aiVolumeRef = useRef(aiVolume);
  const isAISpeakingRef = useRef(isAISpeaking);
  const isSpeakingPropRef = useRef(isSpeaking);

  useEffect(() => {
    aiVolumeRef.current = aiVolume;
    isAISpeakingRef.current = isAISpeaking;
    isSpeakingPropRef.current = isSpeaking;
  }, [aiVolume, isAISpeaking, isSpeaking]);

  useEffect(() => {
    const animateMouth = () => {
      let targetScale = 0;
      // Only animate if this specific instance is supposed to be speaking
      if (isSpeakingPropRef.current && isAISpeakingRef.current && aiVolumeRef.current > 0.01) {
        const baseOpening = aiVolumeRef.current;
        const elapsed = Date.now() / 1000;
        const oscillation = Math.sin(elapsed * 15) * 0.05;
        targetScale = (baseOpening * 2.5) + oscillation;
      }
      
      // Smoothly interpolate to the target scale to avoid jerky movements
      setMouthScale(currentScale => {
        const diff = targetScale - currentScale;
        const newScale = currentScale + diff * 0.6;
        return Math.max(0, Math.min(1.5, newScale));
      });

      animationFrameRef.current = requestAnimationFrame(animateMouth);
    };

    animationFrameRef.current = requestAnimationFrame(animateMouth);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []); // Run this effect only once on mount

  return { eyeScale, mouthScale };
}
