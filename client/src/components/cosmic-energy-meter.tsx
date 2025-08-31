import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Sun, Moon, Star } from 'lucide-react';

interface CosmicEnergyMeterProps {
  className?: string;
}

interface PlanetaryEnergy {
  name: string;
  energy: number;
  color: string;
  icon: React.ReactNode;
  influence: string;
}

export function CosmicEnergyMeter({ className = '' }: CosmicEnergyMeterProps) {
  const [planetaryEnergies, setPlanetaryEnergies] = useState<PlanetaryEnergy[]>([]);

  // Calculate current planetary energies based on time and date
  useEffect(() => {
    const calculatePlanetaryEnergies = () => {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay();
      const date = now.getDate();
      
      // Simulate planetary influences based on time
      const energies: PlanetaryEnergy[] = [
        {
          name: 'Solar',
          energy: hour >= 6 && hour <= 18 ? 70 + Math.sin((hour - 6) / 12 * Math.PI) * 30 : 20 + Math.random() * 15,
          color: 'from-yellow-400 to-orange-500',
          icon: <Sun className="w-3 h-3" />,
          influence: hour >= 6 && hour <= 18 ? 'Bright creative energy' : 'Quiet reflection time'
        },
        {
          name: 'Lunar',
          energy: 50 + Math.sin((date / 30) * 2 * Math.PI) * 40, // Moon phase simulation
          color: 'from-blue-300 to-purple-400',
          icon: <Moon className="w-3 h-3" />,
          influence: 'Emotional intuition flowing'
        },
        {
          name: 'Mercury',
          energy: 60 + Math.sin((hour / 24) * 4 * Math.PI) * 25, // Communication energy
          color: 'from-cyan-400 to-blue-500',
          icon: <Sparkles className="w-3 h-3" />,
          influence: 'Mental clarity and communication'
        },
        {
          name: 'Venus',
          energy: 55 + Math.sin(((day + 1) / 7) * 2 * Math.PI) * 35, // Love/creativity cycle
          color: 'from-pink-400 to-rose-500',
          icon: <Star className="w-3 h-3" />,
          influence: 'Harmony and artistic inspiration'
        },
      ];
      
      setPlanetaryEnergies(energies);
    };

    calculatePlanetaryEnergies();
    const interval = setInterval(calculatePlanetaryEnergies, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const overallEnergy = planetaryEnergies.length > 0 
    ? planetaryEnergies.reduce((sum, p) => sum + p.energy, 0) / planetaryEnergies.length 
    : 0;

  const getEnergyLevel = (energy: number) => {
    if (energy > 80) return 'Highly Active';
    if (energy > 60) return 'Elevated';
    if (energy > 40) return 'Moderate';
    if (energy > 20) return 'Gentle';
    return 'Quiet';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-5 h-5 text-purple-400" />
          </motion.div>
          <h3 className="text-sm font-medium text-purple-200">Cosmic Energy Field</h3>
        </div>
        <div className="text-xs text-purple-300">
          {getEnergyLevel(overallEnergy)}
        </div>
      </div>

      {/* Overall Energy Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-purple-300">Overall Cosmic Energy</span>
          <span className="text-xs text-purple-200">{Math.round(overallEnergy)}%</span>
        </div>
        <div className="h-2 bg-purple-900/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400"
            initial={{ width: 0 }}
            animate={{ width: `${overallEnergy}%` }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Individual Planetary Energies */}
      <div className="space-y-2">
        {planetaryEnergies.map((planet) => (
          <div key={planet.name} className="group">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center space-x-2">
                <div className="text-purple-300">
                  {planet.icon}
                </div>
                <span className="text-xs text-purple-200">{planet.name}</span>
              </div>
              <span className="text-xs text-purple-300">{Math.round(planet.energy)}%</span>
            </div>
            <div className="h-1.5 bg-purple-900/30 rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${planet.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${planet.energy}%` }}
                transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
              />
            </div>
            {/* Hover tooltip */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-purple-300 mt-1">
              {planet.influence}
            </div>
          </div>
        ))}
      </div>

      {/* Cosmic particles decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-purple-300/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [0.5, 1.5, 0.5],
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