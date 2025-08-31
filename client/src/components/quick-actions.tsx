import { Calendar, RotateCcw, TrendingUp, Sparkles, Music, Clock, Loader2, Star, Heart, Zap, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

interface QuickActionsProps {
  onAction: (action: string) => void;
  disabled?: boolean;
}

interface GenerationStatus {
  canGenerate: {
    playlist: boolean;
    horoscope: boolean;
    chart: boolean;
    transit: boolean;
  };
  canExport: boolean;
  lastGenerated: {
    playlist: string | null;
    horoscope: string | null;
    chart: string | null;
    transit: string | null;
  };
  lastExported: string | null;
  hasExistingContent: {
    horoscope: boolean;
    chart: boolean;
    playlist: boolean;
    transit: boolean;
  };
}

export default function QuickActions({ onAction, disabled = false }: QuickActionsProps) {
  const { isAuthenticated } = useAuth();
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  const [clickedAction, setClickedAction] = useState<string | null>(null);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number}>>([]);
  
  // Get generation status for authenticated users
  const { data: generationStatus } = useQuery<GenerationStatus>({
    queryKey: ['/api/user/generation-status'],
    enabled: isAuthenticated,
    retry: false,
  });
  const getNextWeekDate = (lastGenerated: string | null) => {
    if (!lastGenerated) return null;
    const lastDate = new Date(lastGenerated);
    const nextWeek = new Date(lastDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    return nextWeek.toLocaleDateString();
  };

  const actions = [
    {
      icon: Music,
      label: "Cosmic Playlist Generator",
      color: "text-pink-500 group-hover:text-pink-600",
      feature: 'playlist' as const,
    },
    {
      icon: Calendar,
      label: "Weekly Horoscope",
      color: "text-purple-500 group-hover:text-purple-600",
      feature: 'horoscope' as const,
    },
    {
      icon: TrendingUp,
      label: "Transit Details",
      color: "text-green-500 group-hover:text-green-600",
      feature: 'transit' as const,
    },
    {
      icon: Sparkles,
      label: "Detailed Birth Chart Reading",
      color: "text-blue-500 group-hover:text-blue-600",
      feature: 'chart' as const,
    },
    {
      icon: Smile,
      label: "Daily Mood Tracker",
      color: "text-indigo-500 group-hover:text-indigo-600",
      feature: 'mood' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
      {actions.map((action) => {
        // Simplify logic: if authenticated, always allow access
        const canGenerate = true;
        
        // Skip generation status checks for mood feature (it's not part of the weekly limits system)
        const hasExisting = action.feature !== 'mood' && isAuthenticated && generationStatus?.hasExistingContent?.[action.feature] === true;
        const canGenerateNew = action.feature === 'mood' || !isAuthenticated || generationStatus?.canGenerate[action.feature] !== false;
        const isOnCooldown = isAuthenticated && action.feature !== 'playlist' && action.feature !== 'mood' && !canGenerateNew && !hasExisting;
        const nextAvailable = action.feature !== 'mood' ? getNextWeekDate(generationStatus?.lastGenerated[action.feature] || null) : null;
        const isActive = activeAction === action.label;

        const cosmicMessages = {
          'Cosmic Playlist Generator': 'Channeling cosmic rhythms...',
          'Weekly Horoscope': 'Reading the stars...',
          'Transit Details': 'Consulting planetary movements...',
          'Detailed Birth Chart Reading': 'Interpreting celestial wisdom...',
          'Daily Mood Tracker': 'Capturing cosmic vibrations...'
        };

        const handleClick = (e: React.MouseEvent) => {
          // Create click particles for playlist button
          if (action.feature === 'playlist') {
            const rect = e.currentTarget.getBoundingClientRect();
            const newParticles = Array.from({ length: 6 }, (_, i) => ({
              id: Date.now() + i,
              x: Math.random() * rect.width,
              y: Math.random() * rect.height
            }));
            setParticles(prev => [...prev, ...newParticles]);
            
            // Clear particles after animation
            setTimeout(() => {
              setParticles(prev => prev.filter(p => !newParticles.includes(p)));
            }, 1000);
          }

          setClickedAction(action.label);
          setTimeout(() => setClickedAction(null), 300);

          if (!isAuthenticated) {
            // Guide guest users to sign in to access features
            window.location.href = '/login';
            return;
          }
          
          if (canGenerate && !disabled) {
            setActiveAction(action.label);
            onAction(action.label);
            // Reset animation after 10 seconds to allow more time for results
            setTimeout(() => setActiveAction(null), 10000);
          }
        };
        
        const isPlaylistButton = action.feature === 'playlist';
        const isHovered = hoveredAction === action.label;
        const isClicked = clickedAction === action.label;

        return (
          <div key={action.label} className="relative">
            <Button
              variant="outline"
              className={`relative overflow-hidden flex items-center justify-center space-x-2 h-12 w-full group transition-all duration-300 ${
                !isAuthenticated 
                  ? 'border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md hover:scale-105 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/10 dark:to-pink-950/10'
                  : isPlaylistButton
                    ? `hover:border-pink-300 dark:hover:border-pink-600 hover:shadow-lg ${isHovered ? 'scale-105 shadow-pink-200/50 dark:shadow-pink-800/20' : ''} ${isClicked ? 'scale-95' : ''}`
                    : 'hover:border-muted-foreground/30 hover:shadow-md hover:scale-105'
              } ${isActive 
                ? isPlaylistButton 
                  ? 'bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30 border-pink-300 dark:border-pink-600 shadow-lg animate-pulse' 
                  : 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-300 dark:border-purple-600 animate-pulse' 
                : ''}`}
              onClick={handleClick}
              onMouseEnter={() => setHoveredAction(action.label)}
              onMouseLeave={() => setHoveredAction(null)}
              disabled={disabled || false}
            >
              {isActive ? (
                <div className="relative">
                  {isPlaylistButton ? (
                    <>
                      <Loader2 className="w-4 h-4 text-pink-500 animate-spin" />
                      <div className="absolute inset-0 w-4 h-4 border border-pink-200 border-t-pink-500 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                      {/* Cosmic elements for playlist generation */}
                      <Star className="absolute -top-2 -right-2 w-2 h-2 text-yellow-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                      <Heart className="absolute -bottom-1 -left-2 w-2 h-2 text-pink-400 animate-pulse" style={{ animationDelay: '1s' }} />
                      <Zap className="absolute top-0 left-4 w-2 h-2 text-blue-400 animate-pulse" style={{ animationDelay: '1.5s' }} />
                    </>
                  ) : (
                    <>
                      <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
                      <div className="absolute inset-0 w-4 h-4 border border-purple-200 border-t-purple-500 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                    </>
                  )}
                </div>
              ) : !isAuthenticated ? (
                <div className="flex items-center space-x-1">
                  <action.icon className={`w-4 h-4 ${action.color} transition-transform group-hover:scale-110 ${isPlaylistButton && isHovered ? 'animate-bounce' : ''}`} />
                  <svg className="w-3 h-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m-7 0a9 9 0 1118 0z" />
                  </svg>
                </div>
              ) : (isOnCooldown && !hasExisting) ? (
                <Clock className="w-4 h-4 text-gray-400" />
              ) : (
                <action.icon className={`w-4 h-4 ${action.color} transition-all duration-300 group-hover:scale-110 ${isPlaylistButton && isHovered ? 'animate-pulse text-pink-600' : ''} ${isClicked ? 'scale-125' : ''}`} />
              )}
              <span className="text-sm font-medium">
                {isActive ? cosmicMessages[action.label as keyof typeof cosmicMessages] : action.label}
              </span>
              {hasExisting && !isActive && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 border border-white dark:border-gray-800 rounded-full"></div>
              )}
              {/* Enhanced background effects */}
              {isActive && (
                <div className={`absolute inset-0 ${isPlaylistButton ? 'bg-gradient-to-r from-pink-100/40 to-purple-100/40 dark:from-pink-800/25 dark:to-purple-800/25' : 'bg-gradient-to-r from-purple-100/30 to-pink-100/30 dark:from-purple-800/20 dark:to-pink-800/20'} rounded-md animate-pulse`}></div>
              )}

              {/* Hover shimmer effect for playlist button */}
              {isPlaylistButton && isHovered && !isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-100/20 to-transparent dark:from-transparent dark:via-pink-800/10 dark:to-transparent animate-pulse rounded-md"></div>
              )}

              {/* Click particles for playlist button */}
              {isPlaylistButton && particles.map(particle => (
                <div
                  key={particle.id}
                  className="absolute w-1 h-1 bg-pink-400 rounded-full animate-ping pointer-events-none"
                  style={{
                    left: particle.x,
                    top: particle.y,
                    animationDuration: '1s',
                    animationDelay: `${Math.random() * 0.5}s`
                  }}
                />
              ))}
            </Button>
            {isOnCooldown && nextAvailable && !hasExisting && (
              <div className="absolute -bottom-6 left-0 right-0 text-xs text-muted-foreground text-center">
                Available {nextAvailable}
              </div>
            )}
            {!isAuthenticated && !isActive && (
              <div className="absolute -bottom-6 left-0 right-0 text-xs text-center">
                <a 
                  href="/login" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 underline cursor-pointer"
                >
                  Sign in to access
                </a>
              </div>
            )}
            {hasExisting && !isActive && (
              <div className="absolute -bottom-6 left-0 right-0 text-xs text-green-600 dark:text-green-400 text-center">
                View saved content
              </div>
            )}
            {isActive && (
              <div className={`absolute -bottom-6 left-0 right-0 text-xs text-center animate-pulse ${isPlaylistButton ? 'text-pink-600 dark:text-pink-400' : 'text-purple-600 dark:text-purple-400'}`}>
                {isPlaylistButton ? '🎵 Curating cosmic melodies...' : '✨ Cosmic energies flowing...'}
              </div>
            )}

            {/* Enhanced hover effects for playlist button */}
            {isPlaylistButton && isHovered && !isActive && (
              <div className="absolute -bottom-6 left-0 right-0 text-xs text-pink-500 dark:text-pink-400 text-center animate-bounce">
                🎶 Ready to harmonize with the cosmos
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
