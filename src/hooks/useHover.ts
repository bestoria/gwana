/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Improved with better performance and control
 */
import { useEffect, useRef, useState } from 'react';

interface HoverProps {
  /** Maximum distance in pixels that the element will move up and down from its initial position. */
  amplitude?: number;
  /** Number of complete hover cycles per second. Lower values create slower, gentler movement. */
  frequency?: number;
  /** Whether the hover animation is currently active */
  enabled?: boolean;
}

/**
 * Hook for creating a smooth floating/hovering animation effect
 * Uses sinusoidal motion for natural-looking movement
 */
export default function useHover({
  amplitude = 10,
  frequency = 0.5,
  enabled = true,
}: HoverProps = {}) {
  const [offset, setOffset] = useState(0);
  const startTimeRef = useRef(Date.now());
  const animationFrameRef = useRef<number>(0);
  const isEnabledRef = useRef(enabled);

  // Update enabled ref when prop changes
  useEffect(() => {
    isEnabledRef.current = enabled;
    if (!enabled) {
      setOffset(0); // Reset to neutral position when disabled
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const animate = () => {
      if (!isEnabledRef.current) return;

      // Calculate time elapsed in seconds since the animation started
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      
      // Create smooth sinusoidal motion
      // The formula creates a wave that oscillates between -amplitude and +amplitude
      const newOffset = Math.sin(elapsed * frequency * Math.PI * 2) * amplitude;

      setOffset(newOffset);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start the animation loop
    animationFrameRef.current = requestAnimationFrame(animate);

    // Cleanup: Cancel animation frame when component unmounts or when props change
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = 0;
      }
    };
  }, [amplitude, frequency, enabled]);

  return offset;
}

/**
 * Advanced hover hook with phase control for multiple animated elements
 */
export function useAdvancedHover(options: {
  amplitude?: number;
  frequency?: number;
  phase?: number; // Phase shift in radians (0-2π) for staggered animations
  enabled?: boolean;
} = {}) {
  const {
    amplitude = 10,
    frequency = 0.5,
    phase = 0,
    enabled = true,
  } = options;

  const [offset, setOffset] = useState(0);
  const startTimeRef = useRef(Date.now());
  const animationFrameRef = useRef<number>(0);
  const isEnabledRef = useRef(enabled);

  useEffect(() => {
    isEnabledRef.current = enabled;
    if (!enabled) {
      setOffset(0);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const animate = () => {
      if (!isEnabledRef.current) return;

      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const newOffset = Math.sin(elapsed * frequency * Math.PI * 2 + phase) * amplitude;

      setOffset(newOffset);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = 0;
      }
    };
  }, [amplitude, frequency, phase, enabled]);

  return offset;
}
