import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sparkles } from 'lucide-react';

interface MoonPhaseMoodRingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface MoonPhaseData {
  phase: string;
  illumination: number;
  emoji: string;
  color: string;
  glowColor: string;
  mood: string;
  energy: string;
}

export function MoonPhaseMoodRing({ size = 'md', className = '' }: MoonPhaseMoodRingProps) {
  const [moonPhase, setMoonPhase] = useState<MoonPhaseData | null>(null);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  const calculateMoonPhase = () => {
    const now = new Date();
    
    // Known new moon reference (Jan 1, 2000)
    const knownNewMoon = new Date('2000-01-06T18:14:00Z').getTime();
    const lunarCycle = 29.53058868; // days
    
    const daysSinceKnownNewMoon = (now.getTime() - knownNewMoon) / (1000 * 60 * 60 * 24);
    const currentCycle = daysSinceKnownNewMoon % lunarCycle;
    
    // Calculate illumination (0 to 1)
    const illumination = (1 - Math.cos(2 * Math.PI * currentCycle / lunarCycle)) / 2;
    
    // Determine phase and mood
    let phase: string;
    let emoji: string;
    let color: string;
    let glowColor: string;
    let mood: string;
    let energy: string;

    if (currentCycle < 1.84566) {
      phase = 'New Moon';
      emoji = '🌑';
      color = 'from-slate-800 to-slate-900';
      glowColor = 'shadow-slate-500/20';
      mood = 'Introspective';
      energy = 'Quiet renewal';
    } else if (currentCycle < 5.53699) {
      phase = 'Waxing Crescent';
      emoji = '🌒';
      color = 'from-slate-600 to-blue-800';
      glowColor = 'shadow-blue-500/30';
      mood = 'Hopeful';
      energy = 'Building momentum';
    } else if (currentCycle < 9.22831) {
      phase = 'First Quarter';
      emoji = '🌓';
      color = 'from-blue-600 to-purple-600';
      glowColor = 'shadow-purple-500/40';
      mood = 'Determined';
      energy = 'Taking action';
    } else if (currentCycle < 12.91963) {
      phase = 'Waxing Gibbous';
      emoji = '🌔';
      color = 'from-purple-500 to-pink-500';
      glowColor = 'shadow-pink-500/50';
      mood = 'Anticipatory';
      energy = 'Almost there';
    } else if (currentCycle < 16.61096) {
      phase = 'Full Moon';
      emoji = '🌕';
      color = 'from-yellow-400 to-orange-400';
      glowColor = 'shadow-yellow-400/60';
      mood = 'Illuminated';
      energy = 'Peak power';
    } else if (currentCycle < 20.30228) {
      phase = 'Waning Gibbous';
      emoji = '🌖';
      color = 'from-orange-500 to-red-500';
      glowColor = 'shadow-orange-500/50';
      mood = 'Grateful';
      energy = 'Sharing wisdom';
    } else if (currentCycle < 23.99361) {
      phase = 'Last Quarter';
      emoji = '🌗';
      color = 'from-red-600 to-purple-700';
      glowColor = 'shadow-red-500/40';
      mood = 'Reflective';
      energy = 'Letting go';
    } else {
      phase = 'Waning Crescent';
      emoji = '🌘';
      color = 'from-purple-700 to-slate-800';
      glowColor = 'shadow-purple-500/30';
      mood = 'Peaceful';
      energy = 'Rest & release';
    }

    return {
      phase,
      illumination,
      emoji,
      color,
      glowColor,
      mood,
      energy
    };
  };

  useEffect(() => {
    setMoonPhase(calculateMoonPhase());
    
    // Update every hour
    const interval = setInterval(() => {
      setMoonPhase(calculateMoonPhase());
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (!moonPhase) return null;

  const ringScale = 0.8 + (moonPhase.illumination * 0.4); // Scale between 0.8 and 1.2

  return (
    <div className={`relative ${className}`}>
      {/* Main mood ring */}
      <motion.div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${moonPhase.color} ${moonPhase.glowColor} relative overflow-hidden cursor-pointer group`}
        animate={{ 
          scale: [ringScale - 0.05, ringScale + 0.05, ringScale - 0.05],
        }}
        transition={{
          duration: 4 + moonPhase.illumination * 2, // Slower pulse during full moon
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileHover={{ scale: ringScale + 0.1 }}
      >
        {/* Moon phase emoji */}
        <div className="absolute inset-0 flex items-center justify-center text-2xl">
          {moonPhase.emoji}
        </div>
        
        {/* Sparkle overlay during high illumination */}
        {moonPhase.illumination > 0.7 && (
          <motion.div
            className="absolute inset-0"
            animate={{
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.3,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              />
            ))}
          </motion.div>
        )}

        {/* Inner glow ring */}
        <div 
          className="absolute inset-2 rounded-full border border-white/30"
          style={{
            opacity: moonPhase.illumination,
          }}
        />
      </motion.div>

      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-sm text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap pointer-events-none z-10">
        <div className="text-center">
          <div className="font-medium">{moonPhase.phase}</div>
          <div className="text-purple-200">{moonPhase.mood}</div>
          <div className="text-gray-300 text-xs">{moonPhase.energy}</div>
        </div>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80" />
      </div>

      {/* Orbiting particles */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={`orbit-${i}`}
          className="absolute w-1 h-1 bg-white/40 rounded-full"
          style={{
            left: '50%',
            top: '50%',
          }}
          animate={{
            rotate: 360,
            x: [0, Math.cos(i * 120 * Math.PI / 180) * 30],
            y: [0, Math.sin(i * 120 * Math.PI / 180) * 30],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}