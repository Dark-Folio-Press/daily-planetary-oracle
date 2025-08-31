import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StarryNightToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleDelay: number;
}

export function StarryNightToggle({ isDarkMode, onToggle }: StarryNightToggleProps) {
  const [stars, setStars] = useState<Star[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  // Generate random stars
  useEffect(() => {
    const generateStars = () => {
      const starCount = 20;
      const newStars: Star[] = [];
      
      for (let i = 0; i < starCount; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 200, // Spread across toggle area
          y: Math.random() * 40,  // Height of toggle
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.8 + 0.2,
          twinkleDelay: Math.random() * 3,
        });
      }
      
      setStars(newStars);
    };

    generateStars();
  }, []);

  return (
    <div className="relative">
      {/* Animated Stars Background */}
      <AnimatePresence>
        {isDarkMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 pointer-events-none overflow-hidden rounded-full"
            style={{ width: '200px', height: '40px' }}
          >
            {stars.map((star) => (
              <motion.div
                key={star.id}
                className="absolute bg-white rounded-full"
                style={{
                  left: `${star.x}px`,
                  top: `${star.y}px`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                }}
                animate={{
                  opacity: [star.opacity, star.opacity * 0.3, star.opacity],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2 + star.twinkleDelay,
                  repeat: Infinity,
                  delay: star.twinkleDelay,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Container */}
      <motion.div
        className={`relative w-20 h-10 rounded-full cursor-pointer transition-all duration-500 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 shadow-lg shadow-purple-500/25' 
            : 'bg-gradient-to-r from-blue-200 via-cyan-100 to-yellow-100 shadow-lg shadow-blue-200/50'
        }`}
        onClick={onToggle}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Sliding Circle */}
        <motion.div
          className={`absolute top-1 w-8 h-8 rounded-full shadow-lg flex items-center justify-center ${
            isDarkMode 
              ? 'bg-gradient-to-br from-slate-700 to-slate-900 text-yellow-300' 
              : 'bg-gradient-to-br from-yellow-300 to-orange-400 text-orange-600'
          }`}
          animate={{
            x: isDarkMode ? 44 : 4,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        >
          {/* Icon with rotation animation */}
          <motion.div
            animate={{ rotate: isDarkMode ? 360 : 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            {isDarkMode ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </motion.div>
        </motion.div>

        {/* Floating Particles Effect */}
        <AnimatePresence>
          {isHovered && isDarkMode && (
            <>
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute bg-yellow-300 rounded-full"
                  style={{
                    width: '3px',
                    height: '3px',
                    left: `${20 + i * 10}px`,
                    top: '50%',
                  }}
                  initial={{ opacity: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    y: [-20, -40, -60],
                    x: [0, Math.random() * 20 - 10],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 2,
                    delay: i * 0.2,
                    repeat: Infinity,
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Sun Rays Effect */}
        <AnimatePresence>
          {isHovered && !isDarkMode && (
            <>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute bg-yellow-400"
                  style={{
                    width: '2px',
                    height: '8px',
                    left: '18px',
                    top: '16px',
                    transformOrigin: '1px 20px',
                    transform: `rotate(${i * 45}deg)`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </motion.div>

    </div>
  );
}