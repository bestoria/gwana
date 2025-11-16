import React, { useEffect, useRef, useMemo } from 'react';
import type { AiMode } from '@/src/lib/types';

interface DeepSpaceBackgroundProps {
  aiMode: AiMode;
}

const DeepSpaceBackground: React.FC<DeepSpaceBackgroundProps> = ({ aiMode }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { clientX, clientY } = e;
      const { offsetWidth, offsetHeight } = document.body;
      const xPos = (clientX / offsetWidth - 0.5);
      const yPos = (clientY / offsetHeight - 0.5);
      
      containerRef.current.style.setProperty('--mouse-x-factor', xPos.toString());
      containerRef.current.style.setProperty('--mouse-y-factor', yPos.toString());
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const theme = useMemo(() => {
    // Apply news theme to all modes for a more dynamic feel, except for study mode
    if (aiMode === 'study') {
      return 'study';
    }
    return 'news';
  }, [aiMode]);

  const backgroundElements = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: `${15 + Math.random() * 15}s`,
      delay: `${Math.random() * 15}s`,
      // Add news-theme specific random values here to prevent recalculation on re-render
      newsWidth: `${20 + Math.random() * 30}%`,
      newsDuration: `${5 + Math.random() * 5}s`,
    }));
  }, []);

  return (
    <div ref={containerRef} className={`deep-space-background mode-${theme}`} aria-hidden="true">
      {/* Theme Wrappers */}
      <div className="theme-wrapper default-theme">
        {/* Animated elements removed to keep the base gradient background */}
      </div>

      <div className="theme-wrapper study-theme">
        <div className="classroom-grid" />
        {backgroundElements.map(el => (
          <div key={el.id} className="study-symbol" style={{ top: el.top, left: el.left, animationDuration: el.duration, animationDelay: el.delay }}>
            {['Σ', 'α', '∫', '∞', 'π'][el.id % 5]}
          </div>
        ))}
      </div>

      <div className="theme-wrapper news-theme">
        <div className="news-globe" />
        {backgroundElements.slice(0, 3).map(el => (
          <div key={el.id} className="data-line" style={{ top: el.top, width: el.newsWidth, animationDuration: el.newsDuration, animationDelay: el.delay }} />
        ))}
      </div>
    </div>
  );
};

export default DeepSpaceBackground;