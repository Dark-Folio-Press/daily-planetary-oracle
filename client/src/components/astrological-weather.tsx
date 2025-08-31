import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, 
  Moon, 
  Star, 
  Zap, 
  Heart, 
  Brain, 
  Shield, 
  Target, 
  Waves,
  Sparkles,
  CloudRain,
  Wind,
  Eye
} from 'lucide-react';

interface CosmicWeatherProps {
  className?: string;
  compact?: boolean;
}

interface WeatherCondition {
  primary: {
    icon: React.ReactNode;
    condition: string;
    intensity: 'gentle' | 'moderate' | 'intense';
    color: string;
    description: string;
  };
  influences: {
    icon: React.ReactNode;
    aspect: string;
    effect: string;
    color: string;
  }[];
}

export function AstrologicalWeather({ className = '', compact = false }: CosmicWeatherProps) {
  const [weather, setWeather] = useState<WeatherCondition | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const calculateCosmicWeather = () => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    const date = now.getDate();

    // Base planetary influences (simplified simulation)
    const sunStrength = hour >= 6 && hour <= 18 ? 0.8 : 0.3;
    const moonStrength = 0.5 + Math.sin((date / 30) * 2 * Math.PI) * 0.4;
    const mercuryStrength = 0.6 + Math.sin((hour / 24) * 4 * Math.PI) * 0.3;
    const venusStrength = 0.5 + Math.sin(((day + 1) / 7) * 2 * Math.PI) * 0.4;
    const marsStrength = 0.4 + Math.sin((date / 31) * 3 * Math.PI) * 0.3;

    // Determine dominant energy
    const energies = [
      { planet: 'Sun', strength: sunStrength, element: 'fire' },
      { planet: 'Moon', strength: moonStrength, element: 'water' },
      { planet: 'Mercury', strength: mercuryStrength, element: 'air' },
      { planet: 'Venus', strength: venusStrength, element: 'earth' },
      { planet: 'Mars', strength: marsStrength, element: 'fire' }
    ];

    const dominant = energies.sort((a, b) => b.strength - a.strength)[0];

    // Generate weather based on dominant energy
    let primary: WeatherCondition['primary'];
    let influences: WeatherCondition['influences'] = [];

    if (dominant.planet === 'Sun') {
      const intensity = sunStrength > 0.7 ? 'intense' : sunStrength > 0.5 ? 'moderate' : 'gentle';
      primary = {
        icon: <Sun className="w-6 h-6" />,
        condition: intensity === 'intense' ? 'Solar Storm' : intensity === 'moderate' ? 'Bright Clarity' : 'Golden Dawn',
        intensity,
        color: 'text-yellow-400',
        description: intensity === 'intense' ? 'Powerful creative energy surging' : 
                    intensity === 'moderate' ? 'Clear vision and confidence' : 'Gentle awakening energy'
      };

      influences.push({
        icon: <Target className="w-4 h-4" />,
        aspect: 'Focus',
        effect: 'Enhanced',
        color: 'text-orange-400'
      });
    } else if (dominant.planet === 'Moon') {
      const intensity = moonStrength > 0.7 ? 'intense' : moonStrength > 0.5 ? 'moderate' : 'gentle';
      primary = {
        icon: <Moon className="w-6 h-6" />,
        condition: intensity === 'intense' ? 'Lunar Tide' : intensity === 'moderate' ? 'Intuitive Flow' : 'Gentle Dreams',
        intensity,
        color: 'text-blue-400',
        description: intensity === 'intense' ? 'Deep emotional currents flowing' : 
                    intensity === 'moderate' ? 'Intuition running high' : 'Peaceful, reflective energy'
      };

      influences.push({
        icon: <Heart className="w-4 h-4" />,
        aspect: 'Emotions',
        effect: 'Heightened',
        color: 'text-purple-400'
      });
    } else if (dominant.planet === 'Mercury') {
      const intensity = mercuryStrength > 0.7 ? 'intense' : mercuryStrength > 0.5 ? 'moderate' : 'gentle';
      primary = {
        icon: <Brain className="w-6 h-6" />,
        condition: intensity === 'intense' ? 'Mental Lightning' : intensity === 'moderate' ? 'Quick Thinking' : 'Clear Thoughts',
        intensity,
        color: 'text-cyan-400',
        description: intensity === 'intense' ? 'Rapid-fire ideas and communication' : 
                    intensity === 'moderate' ? 'Sharp mental agility' : 'Peaceful mental clarity'
      };

      influences.push({
        icon: <Zap className="w-4 h-4" />,
        aspect: 'Communication',
        effect: 'Amplified',
        color: 'text-blue-400'
      });
    } else if (dominant.planet === 'Venus') {
      const intensity = venusStrength > 0.7 ? 'intense' : venusStrength > 0.5 ? 'moderate' : 'gentle';
      primary = {
        icon: <Heart className="w-6 h-6" />,
        condition: intensity === 'intense' ? 'Love Storm' : intensity === 'moderate' ? 'Harmonic Flow' : 'Sweet Breeze',
        intensity,
        color: 'text-pink-400',
        description: intensity === 'intense' ? 'Powerful love and creative energy' : 
                    intensity === 'moderate' ? 'Beautiful harmony and connection' : 'Gentle affection and peace'
      };

      influences.push({
        icon: <Sparkles className="w-4 h-4" />,
        aspect: 'Creativity',
        effect: 'Inspired',
        color: 'text-pink-400'
      });
    } else {
      const intensity = marsStrength > 0.6 ? 'intense' : marsStrength > 0.4 ? 'moderate' : 'gentle';
      primary = {
        icon: <Shield className="w-6 h-6" />,
        condition: intensity === 'intense' ? 'Warrior Energy' : intensity === 'moderate' ? 'Bold Action' : 'Quiet Courage',
        intensity,
        color: 'text-red-400',
        description: intensity === 'intense' ? 'Fierce determination and drive' : 
                    intensity === 'moderate' ? 'Confident action energy' : 'Steady, quiet strength'
      };

      influences.push({
        icon: <Target className="w-4 h-4" />,
        aspect: 'Drive',
        effect: 'Focused',
        color: 'text-red-400'
      });
    }

    // Add secondary influences
    if (moonStrength > 0.6 && dominant.planet !== 'Moon') {
      influences.push({
        icon: <Waves className="w-4 h-4" />,
        aspect: 'Intuition',
        effect: 'Active',
        color: 'text-blue-300'
      });
    }

    if (mercuryStrength > 0.6 && dominant.planet !== 'Mercury') {
      influences.push({
        icon: <Eye className="w-4 h-4" />,
        aspect: 'Perception',
        effect: 'Sharp',
        color: 'text-cyan-300'
      });
    }

    return { primary, influences };
  };

  useEffect(() => {
    setIsLoading(true);
    
    // Simulate loading cosmic data
    setTimeout(() => {
      setWeather(calculateCosmicWeather());
      setIsLoading(false);
    }, 1000);

    // Update every 2 hours
    const interval = setInterval(() => {
      setWeather(calculateCosmicWeather());
    }, 2 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className={`bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-5 h-5 text-purple-400" />
          </motion.div>
          <div>
            <div className="text-sm font-medium text-purple-200">Reading cosmic weather...</div>
            <div className="text-xs text-purple-300/60">Consulting the celestial currents</div>
          </div>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const intensityColors = {
    gentle: 'border-green-500/30 bg-green-900/10',
    moderate: 'border-yellow-500/30 bg-yellow-900/10',
    intense: 'border-red-500/30 bg-red-900/10'
  };

  const intensityGlow = {
    gentle: 'shadow-green-500/20',
    moderate: 'shadow-yellow-500/20',
    intense: 'shadow-red-500/20'
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 bg-gradient-to-r from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-purple-500/30 rounded-full px-3 py-2 ${className}`}>
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: weather.primary.condition.includes('Storm') ? [0, 5, -5, 0] : [0, 360]
          }}
          transition={{ 
            duration: weather.primary.intensity === 'intense' ? 1.5 : 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={weather.primary.color}
        >
          {weather.primary.icon}
        </motion.div>
        <div className="text-xs text-purple-200">
          {weather.primary.condition}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 ${intensityColors[weather.primary.intensity]} ${intensityGlow[weather.primary.intensity]} ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-medium text-purple-200">Cosmic Weather</h3>
        </div>
        <div className={`text-xs px-2 py-1 rounded-full border ${
          weather.primary.intensity === 'intense' ? 'border-red-400/50 text-red-300 bg-red-900/20' :
          weather.primary.intensity === 'moderate' ? 'border-yellow-400/50 text-yellow-300 bg-yellow-900/20' :
          'border-green-400/50 text-green-300 bg-green-900/20'
        }`}>
          {weather.primary.intensity}
        </div>
      </div>

      {/* Primary condition */}
      <div className="flex items-start space-x-3 mb-4">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: weather.primary.condition.includes('Storm') ? [0, 5, -5, 0] : [0, 10, -10, 0]
          }}
          transition={{ 
            duration: weather.primary.intensity === 'intense' ? 1.5 : 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`${weather.primary.color} flex-shrink-0`}
        >
          {weather.primary.icon}
        </motion.div>
        <div>
          <div className="text-sm font-medium text-purple-100">{weather.primary.condition}</div>
          <div className="text-xs text-purple-300 mt-1">{weather.primary.description}</div>
        </div>
      </div>

      {/* Influences */}
      {weather.influences.length > 0 && (
        <div className="border-t border-purple-500/20 pt-3">
          <div className="text-xs text-purple-300 mb-2">Active influences:</div>
          <div className="flex flex-wrap gap-2">
            {weather.influences.map((influence, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-1 bg-purple-900/30 rounded-full px-2 py-1"
              >
                <div className={influence.color}>
                  {influence.icon}
                </div>
                <div className="text-xs text-purple-200">{influence.aspect}</div>
                <div className="text-xs text-purple-300/80">{influence.effect}</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={`weather-particle-${i}`}
            className="absolute w-1 h-1 bg-purple-300/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [0.5, 1.5, 0.5],
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}