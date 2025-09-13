import { ReactNode } from 'react';

interface ThemeSkinProps {
  theme: string;
  children: ReactNode;
  className?: string;
}

export default function ThemeSkin({ theme, children, className = '' }: ThemeSkinProps) {
  const getSkinClass = (themeId: string): string => {
    // Map theme IDs to skin classes
    const skinMap: Record<string, string> = {
      'cosmic-deep-space': 'skin-cosmic-deep-space',
      'cosmic-nebula': 'skin-cosmic-nebula', 
      'cosmic-galaxy': 'skin-cosmic-galaxy',
      'cosmic-solar-system': 'skin-cosmic-solar-system',
      'vintage-art-deco': 'skin-vintage-art-deco',
      'vintage-victorian': 'skin-vintage-victorian',
      'vintage-mid-century': 'skin-vintage-mid-century', 
      'vintage-classic': 'skin-vintage-classic',
      'doodle': 'chart-skin', // Keep doodle as base skin
      'kerykeion-default': 'chart-skin',
      'kerykeion-dark': 'chart-skin',
      'kerykeion-dark-contrast': 'chart-skin'
    };
    
    return skinMap[themeId] || 'chart-skin';
  };

  const getBackgroundAtmosphere = (themeId: string): ReactNode => {
    // Simple background atmosphere only - no decorative elements
    if (themeId.startsWith('cosmic-')) {
      return (
        <div 
          className="absolute inset-0 pointer-events-none opacity-30 rounded-lg"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(168, 85, 247, 0.06) 0%, transparent 50%)
            `
          }}
        />
      );
    }
    
    if (themeId.startsWith('vintage-')) {
      return (
        <div 
          className="absolute inset-0 pointer-events-none opacity-20 rounded-lg"
          style={{
            background: `
              radial-gradient(circle at 10% 10%, rgba(139, 69, 19, 0.08) 0%, transparent 60%),
              radial-gradient(circle at 90% 90%, rgba(160, 82, 45, 0.06) 0%, transparent 60%)
            `
          }}
        />
      );
    }
    
    return null;
  };

  return (
    <div className={`chart-skin ${getSkinClass(theme)} relative ${className}`}>
      {/* Layer 1: Background atmosphere - subtle and behind everything */}
      {getBackgroundAtmosphere(theme)}
      
      {/* Layer 2: The chart content with CSS theming applied via skin class */}
      {children}
    </div>
  );
}