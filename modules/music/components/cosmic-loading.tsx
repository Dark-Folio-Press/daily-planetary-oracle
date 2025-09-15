import { Loader2, Sparkles, Star, Moon, Sun } from "lucide-react";

interface CosmicLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'purple' | 'blue' | 'pink' | 'cosmic';
}

export default function CosmicLoading({ 
  message = "Consulting the stars...", 
  size = 'md',
  variant = 'cosmic' 
}: CosmicLoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const colorClasses = {
    purple: 'text-purple-500',
    blue: 'text-blue-500',
    pink: 'text-pink-500',
    cosmic: 'text-purple-500'
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="relative">
        {/* Main spinner */}
        <Loader2 className={`${sizeClasses[size]} ${colorClasses[variant]} animate-spin`} />
        
        {/* Cosmic decorations */}
        <Sparkles className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'} absolute -top-1 -right-1 text-yellow-400 animate-pulse`} />
        <Star className={`${size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3'} absolute -bottom-1 -left-1 text-blue-300 animate-pulse`} style={{ animationDelay: '0.5s' }} />
        
        {/* Orbital ring */}
        <div 
          className={`absolute inset-0 ${sizeClasses[size]} border border-purple-200 dark:border-purple-700 rounded-full animate-spin`} 
          style={{ animationDuration: '3s', animationDirection: 'reverse' }}
        ></div>
      </div>
      
      {message && (
        <span className={`${textSizeClasses[size]} text-muted-foreground animate-pulse`}>
          {message}
        </span>
      )}
    </div>
  );
}

export function CosmicCardAnimation() {
  return (
    <div className="absolute inset-0 bg-gradient-to-r from-purple-100/20 via-pink-100/20 to-blue-100/20 dark:from-purple-800/10 dark:via-pink-800/10 dark:to-blue-800/10 rounded-md animate-pulse">
      <div className="absolute top-2 right-2">
        <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" />
      </div>
      <div className="absolute bottom-2 left-2">
        <Star className="w-2 h-2 text-blue-300 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
    </div>
  );
}