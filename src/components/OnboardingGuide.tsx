import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X } from 'lucide-react';

interface OnboardingGuideProps {
  isDesktop: boolean;
  messagesLength: number;
  currentAiMode: string;
  onComplete: () => void;
}

interface HighlightStyle {
  top?: number;
  left?: number;
  width?: number;
  height?: number;
  borderRadius?: string;
}

const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ isDesktop, messagesLength, currentAiMode, onComplete }) => {
  const [step, setStep] = useState(0);
  const [highlightStyle, setHighlightStyle] = useState<HighlightStyle>({});
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({ opacity: 0 });

  const steps = useMemo(() => [
    {
      targetId: 'onboarding-input-container',
      text: "Welcome to Kwararru! Let's walk through a few key features. To start, try asking me anything in the input field below.",
    },
    {
      targetId: isDesktop ? 'onboarding-sidebar-news-button' : 'onboarding-fab-mode-button',
      text: "Great! I can also specialize. Use the mode selector to switch my focus. Let's try the 'Newsroom' mode to get the latest updates on any topic.",
    },
    {
      targetId: 'onboarding-call-button-container',
      text: "Perfect. When you want to talk instead of type, just hit this button to start a live voice session with me.",
    },
    {
      targetId: '', // No target for the final step
      text: "You're all set! Explore the modes, chat with me, or start a call anytime. Enjoy the new interface.",
    }
  ], [isDesktop]);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(s => s + 1);
    } else {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Allow fade-out animation
    }
  };
  
  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(onComplete, 500);
  };

  useEffect(() => {
    if (step >= steps.length) return;
    const { targetId } = steps[step];
    if (!targetId) {
      setHighlightStyle({});
      return;
    }

    const updatePosition = () => {
      const element = document.getElementById(targetId);
      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightStyle({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          borderRadius: getComputedStyle(element).borderRadius || '8px',
        });
      }
    };
    
    const interval = setInterval(() => {
      const element = document.getElementById(targetId);
      if (element) {
        updatePosition();
        clearInterval(interval);
      }
    }, 100);

    window.addEventListener('resize', updatePosition);
    return () => {
        window.removeEventListener('resize', updatePosition);
        clearInterval(interval);
    };

  }, [step, steps]);

  useEffect(() => {
    if (step >= steps.length || !isVisible || !tooltipRef.current) return;
    const tooltipElement = tooltipRef.current;
    
    const calculatePosition = () => {
        if (!tooltipElement) return;
        const tooltipRect = tooltipElement.getBoundingClientRect();
        const { innerWidth, innerHeight } = window;
        const margin = 20;

        if (highlightStyle.top !== undefined && (highlightStyle.width ?? 0) > 0) {
            let finalTop: number;
            const spaceBelow = innerHeight - (highlightStyle.top + highlightStyle.height! + margin);
            if (spaceBelow > tooltipRect.height || highlightStyle.top < tooltipRect.height) {
                finalTop = highlightStyle.top + highlightStyle.height! + margin;
            } else {
                finalTop = highlightStyle.top - tooltipRect.height - margin;
            }
            let finalLeft = highlightStyle.left!;
            if (finalLeft + tooltipRect.width > innerWidth - margin) {
                finalLeft = innerWidth - tooltipRect.width - margin;
            }
            setTooltipStyle({ top: `${Math.max(margin, finalTop)}px`, left: `${Math.max(margin, finalLeft)}px`, opacity: 1 });
        } else {
            setTooltipStyle({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 1 });
        }
    };
    
    calculatePosition();
    window.addEventListener('resize', calculatePosition);
    return () => window.removeEventListener('resize', calculatePosition);

  }, [highlightStyle, step, steps, isVisible]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-[1000] transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div 
        className="fixed inset-0 bg-black/70"
        style={{
          clipPath: (highlightStyle.top !== undefined && (highlightStyle.width ?? 0) > 0)
            ? `path('M0,0 H${window.innerWidth} V${window.innerHeight} H0 Z M${highlightStyle.left!},${highlightStyle.top!} h${highlightStyle.width!} v${highlightStyle.height!} h-${highlightStyle.width!} Z')`
            : 'none',
          transition: 'clip-path 0.4s ease-in-out'
        }}
      />
      
      {(highlightStyle.top !== undefined && (highlightStyle.width ?? 0) > 0) && (
        <div 
          className="fixed transition-all duration-500 ease-in-out pointer-events-none"
          style={{ 
            top: highlightStyle.top - 10,
            left: highlightStyle.left - 10,
            width: highlightStyle.width! + 20,
            height: highlightStyle.height! + 20,
            borderRadius: highlightStyle.borderRadius,
            boxShadow: '0 0 0 3px var(--accent-cyan), 0 0 20px 5px var(--accent-cyan), inset 0 0 15px rgba(0,255,255,0.3)',
          }}
        />
      )}

      <div 
        ref={tooltipRef}
        className="fixed max-w-sm w-full bg-black/80 backdrop-blur-md border border-cyan-500 rounded-lg p-4 font-mono text-white shadow-2xl"
        style={{...tooltipStyle, transition: 'opacity 0.3s ease-in-out, top 0.4s ease-in-out, left 0.4s ease-in-out'}}
      >
        <p className="text-sm leading-relaxed">{steps[step].text}</p>
        <div className="flex justify-end mt-4">
          <button
            onClick={handleNext}
            className="px-4 py-1.5 bg-cyan-600 text-white text-xs font-semibold rounded-md hover:bg-cyan-700 transition-colors"
          >
            {step === steps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>

      <button onClick={handleSkip} className="fixed top-5 right-5 flex items-center gap-2 px-3 py-1.5 bg-gray-800/80 border border-gray-600 rounded-full text-gray-300 text-sm hover:bg-gray-700 transition-colors">
        <X size={16} /> Skip Tutorial
      </button>
    </div>
  );
};

export default OnboardingGuide;