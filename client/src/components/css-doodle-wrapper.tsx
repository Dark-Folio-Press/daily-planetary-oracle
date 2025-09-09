import React, { useEffect, useRef } from 'react';

// Import CSS-Doodle
import 'css-doodle';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'css-doodle': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        seed?: number;
        use?: string;
      };
    }
  }
}

interface CSSdoodleProps {
  pattern: string;
  seed?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function CSSdoodleWrapper({ 
  pattern, 
  seed, 
  className = '', 
  style = {} 
}: CSSdoodleProps) {
  const doodleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (doodleRef.current) {
      // Set the seed for reproducible patterns
      if (seed !== undefined) {
        (doodleRef.current as any).seed = seed;
      }
      
      // Update the pattern
      (doodleRef.current as any).update = () => {
        if (doodleRef.current) {
          (doodleRef.current as any).innerHTML = pattern;
        }
      };
      
      // Trigger initial render
      (doodleRef.current as any).innerHTML = pattern;
    }
  }, [pattern, seed]);

  return (
    <css-doodle 
      ref={doodleRef as any}
      className={className}
      style={style}
      seed={seed}
    >
      {pattern}
    </css-doodle>
  );
}

// Pre-defined doodle patterns for chart themes
export const DoodlePatterns = {
  // Sketchy background texture
  paperTexture: `
    @grid: 25 / 100%;
    background: @p(transparent, rgba(139, 69, 19, 0.02));
    transform: rotate(@r(-3deg, 3deg)) scale(@r(0.8, 1.2));
    border-radius: @r(1px, 4px);
    opacity: @r(0.3, 0.7);
  `,

  // Hand-drawn dots pattern
  sketchyDots: `
    @grid: 15 / 100%;
    background: @pick(transparent, transparent, transparent, #8B4513);
    border-radius: 50%;
    transform: scale(@r(0.5, 1.5)) translate(@r(-2px, 2px), @r(-2px, 2px));
    opacity: 0.15;
    animation: float @r(3s, 8s) infinite ease-in-out @r(0s, 2s);
    
    @keyframes float {
      0%, 100% { transform: translateY(0) scale(@r(0.5, 1.5)); }
      50% { transform: translateY(@r(-3px, 3px)) scale(@r(0.8, 1.2)); }
    }
  `,

  // Decorative doodle border
  decorativeBorder: `
    @grid: 1 / 100%;
    border: 2px dashed #8B4513;
    border-radius: 8px;
    opacity: 0.4;
    transform: rotate(@r(-1deg, 1deg));
    
    background: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 8px,
      rgba(139, 69, 19, 0.05) 8px,
      rgba(139, 69, 19, 0.05) 16px
    );
  `,

  // Scattered stars and doodles
  scatteredDoodles: `
    @grid: 12 / 100%;
    content: @pick('★', '✦', '✧', '◆', '○', '△', '□');
    font-family: 'Reenie Beanie', cursive;
    font-size: @r(12px, 24px);
    color: rgba(139, 69, 19, 0.3);
    transform: rotate(@r(-15deg, 15deg)) scale(@r(0.7, 1.3));
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    animation: twinkle @r(2s, 6s) infinite ease-in-out @r(0s, 3s);
    
    @keyframes twinkle {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.8; }
    }
  `,

  // Organic shapes background
  organicShapes: `
    @grid: 8 / 100%;
    background: rgba(139, 69, 19, 0.02);
    clip-path: @shape(
      points: @r(6, 12);
      r: cos(4t) * 0.3 + 0.7;
      scale: @r(0.3, 0.8);
    );
    transform: rotate(@r(-180deg, 180deg));
    opacity: 0.4;
  `
};