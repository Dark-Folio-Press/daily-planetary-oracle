import { useEffect, useState } from 'react';

interface VintageThemeWrapperProps {
  theme: 'art-deco' | 'victorian' | 'mid-century' | 'classic';
  className?: string;
  style?: React.CSSProperties;
}

export default function VintageThemeWrapper({ theme, className = '', style = {} }: VintageThemeWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getBackgroundElements = () => {
    // Central decorative elements that should be behind the chart
    switch (theme) {
      case 'art-deco':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Art Deco sunburst effect - central, should be behind chart */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 opacity-30">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-16 h-px bg-yellow-600/20"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
                    transformOrigin: 'center'
                  }}
                />
              ))}
            </div>
          </div>
        );
        
      case 'mid-century':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Central atomic orbital rings */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-teal-400/15 rounded-full">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 border border-slate-500/10 rounded-full">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-teal-500/20 rounded-full" />
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  const getEdgeElements = () => {
    // Only edge/corner decorations that won't interfere with chart readability
    switch (theme) {
      case 'art-deco':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Art Deco geometric patterns */}
            <div className="absolute top-4 left-4 w-16 h-16 border-2 border-yellow-600/30 transform rotate-45" />
            <div className="absolute top-4 right-4 w-12 h-12 border-2 border-yellow-700/20 transform -rotate-45" />
            <div className="absolute bottom-4 left-4 w-20 h-4 bg-gradient-to-r from-yellow-600/20 to-transparent" />
            <div className="absolute bottom-4 right-4 w-16 h-4 bg-gradient-to-l from-yellow-700/20 to-transparent" />
            
            {/* Golden accent lines */}
            <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-yellow-600/30 to-transparent" />
            <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-yellow-700/20 to-transparent" />
            
            {/* Corner ornaments */}
            <div className="absolute top-2 left-2 w-8 h-8 border-l-2 border-t-2 border-yellow-600/40" />
            <div className="absolute top-2 right-2 w-8 h-8 border-r-2 border-t-2 border-yellow-600/40" />
            <div className="absolute bottom-2 left-2 w-8 h-8 border-l-2 border-b-2 border-yellow-600/40" />
            <div className="absolute bottom-2 right-2 w-8 h-8 border-r-2 border-b-2 border-yellow-600/40" />
            
            {/* Art Deco sunburst effect */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 opacity-10">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-16 h-px bg-yellow-600/40"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
                    transformOrigin: 'center'
                  }}
                />
              ))}
            </div>
          </div>
        );

      case 'victorian':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Victorian ornate borders */}
            <div className="absolute inset-4 border-2 border-purple-800/30 rounded-lg" />
            <div className="absolute inset-6 border border-purple-700/20 rounded" />
            
            {/* Decorative flourishes */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-gradient-to-r from-transparent via-purple-700/30 to-transparent rounded-full" />
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-gradient-to-r from-transparent via-purple-700/30 to-transparent rounded-full" />
            
            {/* Corner rosettes */}
            <div className="absolute top-6 left-6 w-6 h-6 rounded-full border-2 border-purple-800/40 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-purple-700/50" />
            </div>
            <div className="absolute top-6 right-6 w-6 h-6 rounded-full border-2 border-purple-800/40 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-purple-700/50" />
            </div>
            <div className="absolute bottom-6 left-6 w-6 h-6 rounded-full border-2 border-purple-800/40 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-purple-700/50" />
            </div>
            <div className="absolute bottom-6 right-6 w-6 h-6 rounded-full border-2 border-purple-800/40 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-purple-700/50" />
            </div>
            
            {/* Lace pattern simulation */}
            <div className="absolute inset-8 border border-dashed border-purple-600/20 rounded-lg" />
            
            {/* Victorian scrollwork */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-24 h-6 border-t border-l border-r border-purple-700/25 rounded-t-full" />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-6 border-b border-l border-r border-purple-700/25 rounded-b-full" />
          </div>
        );

      case 'mid-century':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Clean mid-century lines */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-slate-600/20 via-teal-500/30 to-slate-600/20" />
            <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-slate-600/20 via-teal-500/30 to-slate-600/20" />
            
            {/* Atomic age patterns */}
            <div className="absolute top-1/2 left-8 transform -translate-y-1/2 w-12 h-12 border-2 border-teal-500/30 rounded-full">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-teal-500/40 rounded-full" />
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-slate-600/50 rounded-full" />
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-1 h-1 bg-slate-600/50 rounded-full" />
              <div className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-slate-600/50 rounded-full" />
              <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-slate-600/50 rounded-full" />
            </div>
            
            <div className="absolute top-1/2 right-8 transform -translate-y-1/2 w-8 h-8 border-2 border-slate-500/30 rounded-full">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-slate-500/40 rounded-full" />
            </div>
            
            {/* Minimalist geometric accents */}
            <div className="absolute top-4 right-4 w-12 h-px bg-slate-500/40" />
            <div className="absolute top-6 right-4 w-8 h-px bg-teal-500/40" />
            <div className="absolute bottom-4 left-4 w-12 h-px bg-slate-500/40" />
            <div className="absolute bottom-6 left-4 w-8 h-px bg-teal-500/40" />
            
            {/* Atomic orbital rings */}
            <div className="absolute top-8 right-12 w-16 h-16 border border-teal-400/20 rounded-full">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-slate-500/20 rounded-full">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-teal-500/40 rounded-full" />
              </div>
            </div>
          </div>
        );

      case 'classic':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Classic elegant borders */}
            <div className="absolute inset-2 border-2 border-blue-900/30 rounded-lg" />
            <div className="absolute inset-4 border border-blue-800/20" />
            
            {/* Sophisticated corner elements */}
            <div className="absolute top-4 left-4 w-12 h-12">
              <div className="absolute top-0 left-0 w-8 h-px bg-blue-900/40" />
              <div className="absolute top-0 left-0 w-px h-8 bg-blue-900/40" />
              <div className="absolute top-2 left-2 w-4 h-px bg-blue-800/30" />
              <div className="absolute top-2 left-2 w-px h-4 bg-blue-800/30" />
            </div>
            
            <div className="absolute top-4 right-4 w-12 h-12">
              <div className="absolute top-0 right-0 w-8 h-px bg-blue-900/40" />
              <div className="absolute top-0 right-0 w-px h-8 bg-blue-900/40" />
              <div className="absolute top-2 right-2 w-4 h-px bg-blue-800/30" />
              <div className="absolute top-2 right-2 w-px h-4 bg-blue-800/30" />
            </div>
            
            <div className="absolute bottom-4 left-4 w-12 h-12">
              <div className="absolute bottom-0 left-0 w-8 h-px bg-blue-900/40" />
              <div className="absolute bottom-0 left-0 w-px h-8 bg-blue-900/40" />
              <div className="absolute bottom-2 left-2 w-4 h-px bg-blue-800/30" />
              <div className="absolute bottom-2 left-2 w-px h-4 bg-blue-800/30" />
            </div>
            
            <div className="absolute bottom-4 right-4 w-12 h-12">
              <div className="absolute bottom-0 right-0 w-8 h-px bg-blue-900/40" />
              <div className="absolute bottom-0 right-0 w-px h-8 bg-blue-900/40" />
              <div className="absolute bottom-2 right-2 w-4 h-px bg-blue-800/30" />
              <div className="absolute bottom-2 right-2 w-px h-4 bg-blue-800/30" />
            </div>
            
            {/* Central elegance markers */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-20 h-px bg-gradient-to-r from-transparent via-blue-800/40 to-transparent" />
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-20 h-px bg-gradient-to-r from-transparent via-blue-800/40 to-transparent" />
            
            {/* Classic typography guides */}
            <div className="absolute left-6 top-1/2 transform -translate-y-1/2 w-px h-16 bg-gradient-to-b from-transparent via-blue-800/30 to-transparent" />
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 w-px h-16 bg-gradient-to-b from-transparent via-blue-800/30 to-transparent" />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`absolute inset-0 ${className}`} style={style}>
      {/* Background layer - behind chart */}
      <div className={`absolute inset-0 z-0 opacity-10 ${
        theme === 'art-deco' ? 'bg-gradient-to-br from-yellow-50 to-amber-100' :
        theme === 'victorian' ? 'bg-gradient-to-br from-purple-50 to-indigo-100' :
        theme === 'mid-century' ? 'bg-gradient-to-br from-slate-100 to-blue-100' :
        theme === 'classic' ? 'bg-gradient-to-br from-blue-50 to-slate-100' :
        ''
      } rounded-lg`}>
        {/* Central decorative elements that should be in background */}
        {getBackgroundElements()}
      </div>
      
      {/* Foreground layer - edge-only accents */}
      <div className="absolute inset-0 z-20 theme-overlay-edges">
        {getEdgeElements()}
      </div>
    </div>
  );
}