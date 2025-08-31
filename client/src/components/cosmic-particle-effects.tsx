import { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  velocity: { x: number; y: number };
  life: number;
  maxLife: number;
  type: 'sparkle' | 'star' | 'dot' | 'ring';
}

interface CosmicParticleEffectsProps {
  children: React.ReactNode;
}

export function CosmicParticleEffects({ children }: CosmicParticleEffectsProps) {
  const particlesRef = useRef<Particle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  const createParticle = useCallback((x: number, y: number): Particle => {
    const colors = [
      '#a855f7', // purple-500
      '#ec4899', // pink-500  
      '#06b6d4', // cyan-500
      '#8b5cf6', // violet-500
      '#f59e0b', // amber-500
    ];

    const types: Particle['type'][] = ['sparkle', 'star', 'dot', 'ring'];
    
    return {
      id: `particle-${Date.now()}-${Math.random()}`,
      x,
      y,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      velocity: {
        x: (Math.random() - 0.5) * 6,
        y: (Math.random() - 0.5) * 6 - 2, // Slight upward bias
      },
      life: 0,
      maxLife: 60 + Math.random() * 40, // 1-1.6 seconds at 60fps
      type: types[Math.floor(Math.random() * types.length)],
    };
  }, []);

  const updateParticles = useCallback(() => {
    particlesRef.current = particlesRef.current
      .map(particle => ({
        ...particle,
        x: particle.x + particle.velocity.x,
        y: particle.y + particle.velocity.y,
        velocity: {
          x: particle.velocity.x * 0.98, // Friction
          y: particle.velocity.y * 0.98 + 0.1, // Gravity
        },
        life: particle.life + 1,
      }))
      .filter(particle => particle.life < particle.maxLife);

    if (particlesRef.current.length > 0) {
      animationFrameRef.current = requestAnimationFrame(updateParticles);
    }
  }, []);

  const handleClick = useCallback((event: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Create burst of particles
    const particleCount = 8 + Math.random() * 8; // 8-16 particles
    for (let i = 0; i < particleCount; i++) {
      const particle = createParticle(
        x + (Math.random() - 0.5) * 20, // Small spread
        y + (Math.random() - 0.5) * 20
      );
      particlesRef.current.push(particle);
    }

    // Start animation loop if not already running
    if (!animationFrameRef.current) {
      updateParticles();
    }
  }, [createParticle, updateParticles]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const renderParticle = (particle: Particle) => {
    const opacity = 1 - (particle.life / particle.maxLife);
    const scale = 1 - (particle.life / particle.maxLife) * 0.5;

    const baseProps = {
      key: particle.id,
      style: {
        position: 'absolute' as const,
        left: particle.x,
        top: particle.y,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        pointerEvents: 'none' as const,
      },
    };

    switch (particle.type) {
      case 'sparkle':
        return (
          <motion.div
            {...baseProps}
            className="w-2 h-2"
          >
            <div 
              className="w-full h-full rotate-45"
              style={{ 
                background: `linear-gradient(45deg, ${particle.color}, transparent, ${particle.color})`,
              }}
            />
            <div 
              className="absolute inset-0 w-full h-full -rotate-45"
              style={{ 
                background: `linear-gradient(45deg, ${particle.color}, transparent, ${particle.color})`,
              }}
            />
          </motion.div>
        );

      case 'star':
        return (
          <motion.div
            {...baseProps}
            style={{
              ...baseProps.style,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
            }}
          />
        );

      case 'ring':
        return (
          <motion.div
            {...baseProps}
            style={{
              ...baseProps.style,
              width: particle.size,
              height: particle.size,
              border: `2px solid ${particle.color}`,
              borderRadius: '50%',
            }}
          />
        );

      case 'dot':
      default:
        return (
          <motion.div
            {...baseProps}
            style={{
              ...baseProps.style,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              borderRadius: '50%',
              boxShadow: `0 0 ${particle.size}px ${particle.color}40`,
            }}
          />
        );
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full"
      onClick={handleClick}
    >
      {children}
      
      {/* Particle container */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <AnimatePresence>
          {particlesRef.current.map(renderParticle)}
        </AnimatePresence>
      </div>
    </div>
  );
}