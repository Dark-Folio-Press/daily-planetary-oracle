import { useEffect, useState } from 'react';

interface CosmicThemeWrapperProps {
  theme: 'deep-space' | 'nebula' | 'galaxy' | 'solar-system';
  className?: string;
  style?: React.CSSProperties;
}

export default function CosmicThemeWrapper({ theme, className = '', style = {} }: CosmicThemeWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getBackgroundElements = () => {
    // Central/large cosmic elements that should be behind the chart
    switch (theme) {
      case 'deep-space':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Distant galaxies - blurred and very low opacity */}
            <div className="absolute top-8 right-12 w-12 h-12 rounded-full bg-gradient-to-r from-purple-400/8 to-cyan-400/6 blur-lg" />
            <div className="absolute bottom-16 left-8 w-8 h-8 rounded-full bg-gradient-to-r from-blue-400/6 to-purple-400/8 blur-lg" />
            <div className="absolute top-20 left-20 w-6 h-6 rounded-full bg-gradient-to-r from-indigo-400/6 to-pink-400/8 blur-md" />
          </div>
        );

      case 'galaxy':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Galaxy spiral arms and core - central, should be behind */}
            <div 
              className="absolute top-1/2 left-1/2 w-48 h-48 transform -translate-x-1/2 -translate-y-1/2 opacity-8"
              style={{
                background: `conic-gradient(from 0deg at 50% 50%, 
                  transparent 0deg,
                  rgba(147, 51, 234, 0.06) 60deg,
                  rgba(59, 130, 246, 0.08) 120deg,
                  rgba(20, 184, 166, 0.06) 180deg,
                  rgba(236, 72, 153, 0.06) 240deg,
                  rgba(251, 191, 36, 0.06) 300deg,
                  transparent 360deg
                )`,
                borderRadius: '50%',
                filter: 'blur(3px)'
              }}
            />
            
            {/* Galaxy core */}
            <div 
              className="absolute top-1/2 left-1/2 w-8 h-8 transform -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10"
              style={{
                background: 'radial-gradient(circle, rgba(251, 191, 36, 0.1) 0%, rgba(147, 51, 234, 0.08) 50%, transparent 80%)'
              }}
            />
          </div>
        );

      case 'solar-system':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Central sun - should be behind chart */}
            <div 
              className="absolute top-1/2 left-1/2 w-12 h-12 transform -translate-x-1/2 -translate-y-1/2 rounded-full opacity-8"
              style={{
                background: 'radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, rgba(249, 115, 22, 0.1) 40%, transparent 70%)'
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const getEdgeElements = () => {
    // Only edge decorations that won't interfere with chart readability
    switch (theme) {
      case 'deep-space':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Small edge stars only */}
            {[...Array(10)].map((_, i) => (
              <div
                key={`edge-star-${i}`}
                className="absolute w-1 h-1 bg-white rounded-full opacity-40"
                style={{
                  top: `${10 + Math.random() * 20}%`,
                  left: `${5 + Math.random() * 15}%`,
                }}
              />
            ))}
            {[...Array(8)].map((_, i) => (
              <div
                key={`edge-star-right-${i}`}
                className="absolute w-1 h-1 bg-cyan-300 rounded-full opacity-30"
                style={{
                  top: `${60 + Math.random() * 30}%`,
                  right: `${5 + Math.random() * 15}%`,
                }}
              />
            ))}
          </div>
        );


      case 'nebula':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Small edge wisps */}
            <div className="absolute top-12 right-1/4 w-8 h-1 bg-gradient-to-r from-pink-400/15 via-purple-400/20 to-transparent rounded-full blur-sm transform rotate-12" />
            <div className="absolute bottom-20 left-1/4 w-10 h-1 bg-gradient-to-r from-blue-400/20 via-cyan-400/15 to-transparent rounded-full blur-sm transform -rotate-6" />
          </div>
        );

      case 'galaxy':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Edge stellar clusters */}
            <div className="absolute top-16 left-16 w-4 h-4 rounded-full bg-gradient-to-r from-cyan-400/15 to-blue-400/15 blur-sm" />
            <div className="absolute bottom-16 right-16 w-3 h-3 rounded-full bg-gradient-to-r from-purple-400/15 to-pink-400/15 blur-sm" />
          </div>
        );

      case 'solar-system':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Edge orbital indicators */}
            <div className="absolute top-1/2 left-8 w-16 h-16 border border-yellow-500/10 rounded-full transform -translate-y-1/2" />
            <div className="absolute top-1/2 right-8 w-12 h-12 border border-orange-500/8 rounded-full transform -translate-y-1/2" />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`absolute inset-0 ${className}`} style={style}>
      {/* Layer 1: Background starfield - behind chart, edge-masked */}
      <div className="absolute inset-0 z-0 theme-overlay-edges">
        <div className={`absolute inset-0 opacity-6 ${
          theme === 'deep-space' ? 'bg-gradient-to-br from-purple-900 via-blue-900 to-black' :
          theme === 'nebula' ? 'bg-gradient-to-br from-purple-800 via-pink-800 to-blue-900' :
          theme === 'galaxy' ? 'bg-gradient-to-br from-indigo-900 via-purple-800 to-cyan-900' :
          theme === 'solar-system' ? 'bg-gradient-to-br from-yellow-900 via-orange-800 to-purple-900' :
          ''
        } rounded-lg`} />
        {getBackgroundElements()}
      </div>
      
      {/* Layer 2: Center scrim underlay - neutralizes background noise under chart */}
      <div className={`absolute inset-0 z-20 ${
        theme === 'deep-space' ? 'theme-underlay-center-dark' :
        theme === 'nebula' ? 'theme-underlay-center-dark' :
        theme === 'galaxy' ? 'theme-underlay-center-dark' :
        theme === 'solar-system' ? 'theme-underlay-center-light' :
        'theme-underlay-center-dark'
      }`} />
      
      {/* Layer 3: Edge accents only - above scrim, below SVG */}
      <div className="absolute inset-0 z-20 theme-overlay-edges">
        {getEdgeElements()}
      </div>
    </div>
  );
}