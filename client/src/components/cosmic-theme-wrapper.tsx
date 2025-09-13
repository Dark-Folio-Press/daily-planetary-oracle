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

  const getThemeElements = () => {
    switch (theme) {
      case 'deep-space':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Twinkling stars */}
            {[...Array(20)].map((_, i) => (
              <div
                key={`star-${i}`}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`
                }}
              />
            ))}
            
            {/* Brighter stars */}
            {[...Array(8)].map((_, i) => (
              <div
                key={`bright-star-${i}`}
                className="absolute w-2 h-2 bg-cyan-300 rounded-full opacity-80"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `twinkle ${3 + Math.random() * 2}s infinite ease-in-out`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
            
            {/* Space dust particles */}
            {[...Array(15)].map((_, i) => (
              <div
                key={`dust-${i}`}
                className="absolute w-px h-px bg-purple-300/40 rounded-full"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `float ${5 + Math.random() * 3}s infinite ease-in-out`,
                  animationDelay: `${Math.random() * 4}s`
                }}
              />
            ))}
            
            {/* Distant galaxies */}
            <div className="absolute top-8 right-12 w-6 h-6 rounded-full bg-gradient-to-r from-purple-400/20 to-cyan-400/20 blur-sm" />
            <div className="absolute bottom-16 left-8 w-4 h-4 rounded-full bg-gradient-to-r from-blue-400/15 to-purple-400/15 blur-sm" />
          </div>
        );

      case 'nebula':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Swirling nebula clouds */}
            <div 
              className="absolute top-4 left-4 w-32 h-32 rounded-full opacity-30 blur-xl"
              style={{
                background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, rgba(147, 51, 234, 0.2) 40%, transparent 70%)',
                animation: 'nebula-swirl 12s infinite ease-in-out'
              }}
            />
            
            <div 
              className="absolute bottom-8 right-8 w-24 h-24 rounded-full opacity-25 blur-lg"
              style={{
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(168, 85, 247, 0.2) 40%, transparent 70%)',
                animation: 'nebula-swirl 15s infinite ease-in-out reverse'
              }}
            />
            
            <div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full opacity-20 blur-2xl"
              style={{
                background: 'radial-gradient(ellipse, rgba(20, 184, 166, 0.2) 0%, rgba(147, 51, 234, 0.15) 50%, transparent 70%)',
                animation: 'nebula-swirl 20s infinite ease-in-out'
              }}
            />
            
            {/* Cosmic gas wisps */}
            <div className="absolute top-12 right-1/4 w-16 h-2 bg-gradient-to-r from-pink-400/20 via-purple-400/30 to-transparent rounded-full blur-sm transform rotate-12" />
            <div className="absolute bottom-20 left-1/4 w-20 h-2 bg-gradient-to-r from-blue-400/25 via-cyan-400/20 to-transparent rounded-full blur-sm transform -rotate-6" />
            
            {/* Stellar formations */}
            {[...Array(12)].map((_, i) => (
              <div
                key={`nebula-star-${i}`}
                className="absolute w-1 h-1 bg-pink-300 rounded-full opacity-60"
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`,
                  animation: `twinkle ${2 + Math.random() * 4}s infinite ease-in-out`,
                  animationDelay: `${Math.random() * 3}s`
                }}
              />
            ))}
          </div>
        );

      case 'galaxy':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Galaxy spiral arms */}
            <div 
              className="absolute top-1/2 left-1/2 w-48 h-48 transform -translate-x-1/2 -translate-y-1/2 opacity-30"
              style={{
                background: `conic-gradient(from 0deg at 50% 50%, 
                  transparent 0deg,
                  rgba(147, 51, 234, 0.2) 60deg,
                  rgba(59, 130, 246, 0.3) 120deg,
                  rgba(20, 184, 166, 0.2) 180deg,
                  rgba(236, 72, 153, 0.2) 240deg,
                  rgba(251, 191, 36, 0.2) 300deg,
                  transparent 360deg
                )`,
                borderRadius: '50%',
                animation: 'galaxy-rotation 25s linear infinite',
                filter: 'blur(2px)'
              }}
            />
            
            {/* Galaxy core */}
            <div 
              className="absolute top-1/2 left-1/2 w-12 h-12 transform -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40"
              style={{
                background: 'radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, rgba(147, 51, 234, 0.3) 50%, transparent 80%)',
                animation: 'pulse-sun 4s infinite ease-in-out'
              }}
            />
            
            {/* Orbital stars */}
            {[...Array(16)].map((_, i) => {
              const angle = (i * 22.5) * (Math.PI / 180);
              const radius = 60 + Math.random() * 40;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              
              return (
                <div
                  key={`galaxy-star-${i}`}
                  className="absolute w-1 h-1 bg-teal-300 rounded-full"
                  style={{
                    top: `calc(50% + ${y}px)`,
                    left: `calc(50% + ${x}px)`,
                    animation: `twinkle ${1.5 + Math.random() * 2}s infinite ease-in-out`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                />
              );
            })}
            
            {/* Stellar clusters */}
            <div className="absolute top-16 left-16 w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-400/20 blur-sm" />
            <div className="absolute bottom-16 right-16 w-6 h-6 rounded-full bg-gradient-to-r from-purple-400/20 to-pink-400/20 blur-sm" />
          </div>
        );

      case 'solar-system':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Central sun */}
            <div 
              className="absolute top-1/2 left-1/2 w-16 h-16 transform -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(251, 191, 36, 0.6) 0%, rgba(249, 115, 22, 0.4) 40%, transparent 70%)',
                animation: 'pulse-sun 3s infinite ease-in-out'
              }}
            />
            
            {/* Planetary orbits */}
            <div className="absolute top-1/2 left-1/2 w-24 h-24 transform -translate-x-1/2 -translate-y-1/2 border border-yellow-500/20 rounded-full" />
            <div className="absolute top-1/2 left-1/2 w-36 h-36 transform -translate-x-1/2 -translate-y-1/2 border border-orange-500/15 rounded-full" />
            <div className="absolute top-1/2 left-1/2 w-48 h-48 transform -translate-x-1/2 -translate-y-1/2 border border-blue-500/10 rounded-full" />
            
            {/* Planets */}
            <div 
              className="absolute top-1/2 left-1/2 w-3 h-3 bg-blue-400/60 rounded-full transform -translate-x-1/2 -translate-y-1/2"
              style={{
                animation: 'orbit-planet 8s linear infinite',
                transformOrigin: '12px 0'
              }}
            />
            
            <div 
              className="absolute top-1/2 left-1/2 w-2 h-2 bg-red-400/60 rounded-full transform -translate-x-1/2 -translate-y-1/2"
              style={{
                animation: 'orbit-planet 12s linear infinite reverse',
                transformOrigin: '18px 0'
              }}
            />
            
            <div 
              className="absolute top-1/2 left-1/2 w-4 h-4 bg-purple-400/50 rounded-full transform -translate-x-1/2 -translate-y-1/2"
              style={{
                animation: 'orbit-planet 16s linear infinite',
                transformOrigin: '24px 0'
              }}
            />
            
            {/* Asteroid belt */}
            {[...Array(8)].map((_, i) => (
              <div
                key={`asteroid-${i}`}
                className="absolute w-px h-px bg-gray-400/40 rounded-full"
                style={{
                  top: `${50 + Math.sin((i * 45) * Math.PI / 180) * 20}%`,
                  left: `${50 + Math.cos((i * 45) * Math.PI / 180) * 20}%`,
                  animation: `float ${6 + Math.random() * 4}s infinite ease-in-out`,
                  animationDelay: `${Math.random() * 3}s`
                }}
              />
            ))}
            
            {/* Cosmic background stars */}
            {[...Array(10)].map((_, i) => (
              <div
                key={`solar-star-${i}`}
                className="absolute w-1 h-1 bg-white/40 rounded-full"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `twinkle ${3 + Math.random() * 2}s infinite ease-in-out`,
                  animationDelay: `${Math.random() * 3}s`
                }}
              />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`absolute inset-0 ${className}`} style={style}>
      {/* Base cosmic background */}
      <div className={`absolute inset-0 ${
        theme === 'deep-space' ? 'bg-gradient-to-br from-purple-900/60 via-blue-900/40 to-black/80' :
        theme === 'nebula' ? 'bg-gradient-to-br from-purple-800/50 via-pink-800/40 to-blue-900/60' :
        theme === 'galaxy' ? 'bg-gradient-to-br from-indigo-900/60 via-purple-800/50 to-cyan-900/40' :
        theme === 'solar-system' ? 'bg-gradient-to-br from-yellow-900/40 via-orange-800/30 to-purple-900/50' :
        ''
      } rounded-lg`} />
      {getThemeElements()}
      
    </div>
  );
}