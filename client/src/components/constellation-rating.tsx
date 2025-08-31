import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface ConstellationRatingProps {
  value?: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ConstellationRating({ 
  value = 0, 
  onChange, 
  readonly = false, 
  size = 'md',
  className = '' 
}: ConstellationRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const constellationPatterns = [
    // 1 star - single bright star
    [[{ x: 0.5, y: 0.5, size: 1.2 }]],
    // 2 stars - binary system
    [[{ x: 0.3, y: 0.5, size: 1 }, { x: 0.7, y: 0.5, size: 1 }]],
    // 3 stars - triangle constellation
    [[{ x: 0.5, y: 0.2, size: 1 }, { x: 0.2, y: 0.8, size: 1 }, { x: 0.8, y: 0.8, size: 1 }]],
    // 4 stars - diamond pattern
    [[{ x: 0.5, y: 0.1, size: 1 }, { x: 0.1, y: 0.5, size: 1 }, { x: 0.9, y: 0.5, size: 1 }, { x: 0.5, y: 0.9, size: 1 }]],
    // 5 stars - pentagram
    [[
      { x: 0.5, y: 0.05, size: 1.1 }, 
      { x: 0.2, y: 0.35, size: 1 }, 
      { x: 0.8, y: 0.35, size: 1 }, 
      { x: 0.3, y: 0.85, size: 1 }, 
      { x: 0.7, y: 0.85, size: 1 }
    ]]
  ];

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleHover = (rating: number) => {
    if (!readonly) {
      setHoverRating(rating);
    }
  };

  const handleLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const currentRating = hoverRating || value;

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((rating) => {
        const isActive = rating <= currentRating;
        const constellation = constellationPatterns[rating - 1][0];
        
        return (
          <motion.div
            key={rating}
            className={`relative ${sizeClasses[size]} ${!readonly ? 'cursor-pointer' : ''}`}
            onClick={() => handleClick(rating)}
            onMouseEnter={() => handleHover(rating)}
            onMouseLeave={handleLeave}
            whileHover={!readonly ? { scale: 1.1 } : {}}
            whileTap={!readonly ? { scale: 0.95 } : {}}
          >
            {/* Constellation background */}
            <div className="absolute inset-0">
              <svg 
                viewBox="0 0 1 1" 
                className="w-full h-full"
              >
                {/* Connection lines between stars */}
                {constellation.length > 1 && constellation.map((star, i) => (
                  constellation.slice(i + 1).map((nextStar, j) => (
                    <motion.line
                      key={`line-${i}-${j}`}
                      x1={star.x}
                      y1={star.y}
                      x2={nextStar.x}
                      y2={nextStar.y}
                      stroke={isActive ? '#a855f7' : '#6b7280'}
                      strokeWidth="0.02"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ 
                        pathLength: isActive ? 1 : 0, 
                        opacity: isActive ? 0.6 : 0 
                      }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    />
                  ))
                )).flat()}
                
                {/* Stars */}
                {constellation.map((star, i) => (
                  <motion.circle
                    key={`star-${i}`}
                    cx={star.x}
                    cy={star.y}
                    r={star.size * 0.08}
                    fill={isActive ? '#a855f7' : '#6b7280'}
                    initial={{ scale: 0 }}
                    animate={{ 
                      scale: isActive ? 1 : 0.7,
                      opacity: isActive ? 1 : 0.5
                    }}
                    transition={{ 
                      duration: 0.3, 
                      delay: i * 0.1,
                      type: "spring",
                      stiffness: 200
                    }}
                  />
                ))}
              </svg>
            </div>

            {/* Glow effect for active constellations */}
            {isActive && (
              <motion.div
                className="absolute inset-0 bg-purple-500/20 rounded-full blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
            
            {/* Sparkle effect on hover */}
            {hoverRating === rating && !readonly && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {Array.from({ length: 3 }).map((_, i) => (
                  <motion.div
                    key={`sparkle-${i}`}
                    className="absolute w-1 h-1 bg-purple-300 rounded-full"
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${20 + Math.random() * 60}%`,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1,
                      delay: i * 0.2,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        );
      })}
      
      {/* Rating text */}
      {currentRating > 0 && (
        <motion.span 
          className="text-xs text-purple-300 ml-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {['Distant', 'Flickering', 'Bright', 'Brilliant', 'Cosmic'][currentRating - 1]}
        </motion.span>
      )}
    </div>
  );
}