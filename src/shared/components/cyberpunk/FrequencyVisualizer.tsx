import React, { useEffect, useRef } from 'react';

interface FrequencyVisualizerProps {
  isActive?: boolean;
  color?: 'cyan' | 'magenta' | 'green' | 'amber';
  height?: number;
  className?: string;
}

const FrequencyVisualizer: React.FC<FrequencyVisualizerProps> = ({
  isActive = false,
  color = 'cyan',
  height = 60,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = height;

    const colorMap = {
      cyan: '#00ffff',
      magenta: '#ff00ff',
      green: '#00ff00',
      amber: '#ffc800'
    };

    const selectedColor = colorMap[color];
    const bars = 32;
    const barWidth = canvas.width / bars;
    let frequencies: number[] = Array(bars).fill(0);

    let animationId: number;

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < bars; i++) {
        const targetHeight = isActive 
          ? Math.random() * canvas.height * 0.8 + canvas.height * 0.2
          : Math.random() * canvas.height * 0.1;
        
        frequencies[i] += (targetHeight - frequencies[i]) * 0.3;

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - frequencies[i]);
        gradient.addColorStop(0, selectedColor + '80');
        gradient.addColorStop(1, selectedColor);

        ctx.fillStyle = gradient;
        ctx.fillRect(
          i * barWidth + 1,
          canvas.height - frequencies[i],
          barWidth - 2,
          frequencies[i]
        );

        // Glow effect
        ctx.shadowColor = selectedColor;
        ctx.shadowBlur = isActive ? 15 : 5;
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isActive, color, height]);

  return (
    <canvas 
      ref={canvasRef} 
      className={`w-full ${className}`}
      style={{ height: `${height}px` }}
    />
  );
};

export default FrequencyVisualizer;
