import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Sparkles, Palette, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChartTheme {
  id: string;
  name: string;
  category: 'kerykeion' | 'doodle' | 'vintage' | 'cosmic';
  description: string;
  xpRequired: number;
  kerykeionTheme?: string; // For native Kerykeion themes
  preview: React.ReactNode;
}

interface ChartThemeSelectorProps {
  userXP: number;
  currentTheme?: string;
  onThemeSelect: (themeId: string) => void;
  className?: string;
}

const chartThemes: ChartTheme[] = [
  // Kerykeion Native Themes (0 XP - Available to all users)
  {
    id: 'kerykeion-default',
    name: 'Classic Professional',
    category: 'kerykeion',
    description: 'Clean, professional chart styling with Swiss Ephemeris accuracy',
    xpRequired: 0,
    kerykeionTheme: 'default',
    preview: (
      <div className="w-full h-24 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-300 rounded flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-2 border-slate-600 flex items-center justify-center">
          <span className="text-slate-700 text-xs font-semibold">NATAL</span>
        </div>
      </div>
    )
  },
  {
    id: 'kerykeion-dark',
    name: 'Dark Professional',
    category: 'kerykeion',
    description: 'Dark theme for comfortable viewing with reduced eye strain',
    xpRequired: 0,
    kerykeionTheme: 'dark',
    preview: (
      <div className="w-full h-24 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600 rounded flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-2 border-slate-300 flex items-center justify-center">
          <span className="text-slate-100 text-xs font-semibold">NATAL</span>
        </div>
      </div>
    )
  },
  {
    id: 'kerykeion-dark-contrast',
    name: 'High Contrast Dark',
    category: 'kerykeion',
    description: 'High contrast dark theme for maximum readability',
    xpRequired: 0,
    kerykeionTheme: 'dark_high_contrast',
    preview: (
      <div className="w-full h-24 bg-black border border-white rounded flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center">
          <span className="text-white text-xs font-bold">NATAL</span>
        </div>
      </div>
    )
  },
  
  // Doodle Theme (1000 XP)
  {
    id: 'doodle',
    name: 'Handwritten Doodle',
    category: 'doodle',
    description: 'Organic handwritten styling with paper textures and artistic fonts',
    xpRequired: 1000,
    preview: (
      <div className="w-full h-24 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-400 rounded chart-theme-doodle relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-amber-100" style={{
            backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(251,191,36,0.3) 0%, transparent 30%), radial-gradient(circle at 80% 70%, rgba(251,191,36,0.2) 0%, transparent 30%)'
          }} />
        </div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="w-16 h-16 rounded-full border-2 border-amber-700 flex items-center justify-center bg-amber-100/50">
            <span className="text-amber-800 text-xs font-reenie">Birth</span>
          </div>
        </div>
      </div>
    )
  },
  
  // Vintage Themes (2500-7500 XP)
  {
    id: 'vintage-art-deco',
    name: 'Art Deco 1920s',
    category: 'vintage',
    description: 'Glamorous Art Deco styling with gold accents and geometric patterns',
    xpRequired: 2500,
    preview: (
      <div className="w-full h-24 bg-gradient-to-br from-yellow-50 to-amber-100 border-2 border-yellow-600 rounded theme-art-deco relative">
        <div className="flex items-center justify-center h-full">
          <div className="w-16 h-16 rounded-full border-2 border-yellow-800 flex items-center justify-center bg-yellow-100">
            <span className="text-yellow-900 text-xs font-playfair font-bold">1920</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'vintage-victorian',
    name: 'Victorian Era',
    category: 'vintage',
    description: 'Elegant Victorian styling with ornate decorations and classic serif fonts',
    xpRequired: 5000,
    preview: (
      <div className="w-full h-24 bg-gradient-to-br from-purple-50 to-indigo-100 border-2 border-purple-700 rounded theme-victorian relative">
        <div className="flex items-center justify-center h-full">
          <div className="w-16 h-16 rounded-full border-2 border-purple-800 flex items-center justify-center bg-purple-100">
            <span className="text-purple-900 text-xs font-cinzel font-semibold">1837</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'vintage-mid-century',
    name: 'Mid-Century Modern',
    category: 'vintage',
    description: 'Clean mid-century design with atomic age aesthetics and modern typography',
    xpRequired: 3500,
    preview: (
      <div className="w-full h-24 bg-gradient-to-br from-slate-100 to-blue-100 border-2 border-slate-500 rounded theme-midcentury relative">
        <div className="flex items-center justify-center h-full">
          <div className="w-16 h-16 rounded-full border-2 border-slate-700 flex items-center justify-center bg-slate-200">
            <span className="text-slate-800 text-xs font-sans font-bold">1950</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'vintage-classic',
    name: 'Classic Elegance',
    category: 'vintage',
    description: 'Timeless classic styling with refined typography and sophisticated color palette',
    xpRequired: 7500,
    preview: (
      <div className="w-full h-24 bg-gradient-to-br from-blue-50 to-slate-100 border-2 border-blue-800 rounded theme-classic relative">
        <div className="flex items-center justify-center h-full">
          <div className="w-16 h-16 rounded-full border-2 border-blue-900 flex items-center justify-center bg-blue-100">
            <span className="text-blue-900 text-xs font-serif font-semibold">CLASS</span>
          </div>
        </div>
      </div>
    )
  },
  
  // Cosmic Themes (5000-12500 XP)
  {
    id: 'cosmic-deep-space',
    name: 'Deep Space',
    category: 'cosmic',
    description: 'Infinite starfield with twinkling stars and deep space gradients',
    xpRequired: 5000,
    preview: (
      <div className="w-full h-24 theme-deep-space rounded relative">
        <div className="flex items-center justify-center h-full relative z-10">
          <div className="w-16 h-16 rounded-full border-2 border-cyan-400 flex items-center justify-center">
            <span className="text-cyan-300 text-xs font-orbitron font-bold">DEEP</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'cosmic-nebula',
    name: 'Nebula',
    category: 'cosmic',
    description: 'Swirling cosmic clouds with vibrant nebula colors',
    xpRequired: 7500,
    preview: (
      <div className="w-full h-24 theme-nebula rounded relative">
        <div className="flex items-center justify-center h-full relative z-10">
          <div className="w-16 h-16 rounded-full border-2 border-pink-400 flex items-center justify-center">
            <span className="text-pink-300 text-xs font-audiowide font-bold">NΕΒΥΛΔ</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'cosmic-galaxy',
    name: 'Galaxy',
    category: 'cosmic',
    description: 'Spinning spiral galaxy with cosmic rotation effects',
    xpRequired: 10000,
    preview: (
      <div className="w-full h-24 theme-galaxy rounded relative">
        <div className="flex items-center justify-center h-full relative z-10">
          <div className="w-16 h-16 rounded-full border-2 border-teal-400 flex items-center justify-center">
            <span className="text-teal-300 text-xs font-exo font-bold">GΔLΔXY</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'cosmic-solar-system',
    name: 'Solar System',
    category: 'cosmic',
    description: 'Radial solar warmth with pulsing star core',
    xpRequired: 12500,
    preview: (
      <div className="w-full h-24 theme-solar-system rounded relative">
        <div className="flex items-center justify-center h-full relative z-10">
          <div className="w-16 h-16 rounded-full border-2 border-yellow-400 flex items-center justify-center">
            <span className="text-yellow-300 text-xs font-rajdhani font-bold">SOLAR</span>
          </div>
        </div>
      </div>
    )
  }
];

const categoryIcons = {
  kerykeion: Palette,
  doodle: Sparkles,
  vintage: '🏛️',
  cosmic: '🌌'
};

export function ChartThemeSelector({ 
  userXP, 
  currentTheme = 'kerykeion-default', 
  onThemeSelect,
  className = '' 
}: ChartThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const [expandedCategory, setExpandedCategory] = useState<string | null>('kerykeion');
  const { toast } = useToast();

  useEffect(() => {
    setSelectedTheme(currentTheme);
  }, [currentTheme]);

  const handleThemeSelect = (themeId: string) => {
    const theme = chartThemes.find(t => t.id === themeId);
    if (!theme) return;

    if (theme.xpRequired > userXP) {
      toast({
        title: "Theme Locked",
        description: `You need ${theme.xpRequired} XP to unlock this theme. Current XP: ${userXP}`,
        variant: "destructive",
      });
      return;
    }

    setSelectedTheme(themeId);
    onThemeSelect(themeId);
    
    toast({
      title: "Theme Applied",
      description: `${theme.name} theme is now active for all your birth charts!`,
    });
  };

  const groupedThemes = chartThemes.reduce((acc, theme) => {
    if (!acc[theme.category]) acc[theme.category] = [];
    acc[theme.category].push(theme);
    return acc;
  }, {} as Record<string, ChartTheme[]>);

  const categories = [
    { key: 'kerykeion', name: 'Professional Charts', description: 'Swiss Ephemeris accuracy with clean styling' },
    { key: 'doodle', name: 'Handwritten Style', description: 'Organic artistic fonts and paper textures' },
    { key: 'vintage', name: 'Historical Eras', description: 'Period-authentic typography and decorations' },
    { key: 'cosmic', name: 'Space Age Themes', description: 'Animated cosmic effects and stellar styling' }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Chart Theme Selection</h2>
        <p className="text-muted-foreground text-sm">
          Choose your preferred chart styling • Current XP: <strong>{userXP}</strong>
        </p>
      </div>

      <div className="space-y-4">
        {categories.map((category) => {
          const themes = groupedThemes[category.key] || [];
          const isExpanded = expandedCategory === category.key;
          const iconElement = categoryIcons[category.key as keyof typeof categoryIcons];
          const Icon = typeof iconElement === 'string' 
            ? () => <span className="text-lg">{iconElement}</span>
            : iconElement as React.ComponentType<any>;

          return (
            <Card key={category.key} className="overflow-hidden">
              <div 
                className="p-4 cursor-pointer hover:bg-accent/50 transition-colors border-b"
                onClick={() => setExpandedCategory(isExpanded ? null : category.key)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5" />
                    <div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {themes.length} theme{themes.length !== 1 ? 's' : ''}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      {isExpanded ? '−' : '+'}
                    </Button>
                  </div>
                </div>
              </div>
              
              {isExpanded && (
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {themes.map((theme) => {
                      const isLocked = theme.xpRequired > userXP;
                      const isSelected = selectedTheme === theme.id;
                      
                      return (
                        <div
                          key={theme.id}
                          className={`relative border rounded-lg p-4 cursor-pointer transition-all hover:scale-105 ${
                            isSelected 
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                              : isLocked 
                              ? 'border-gray-300 opacity-60' 
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                          onClick={() => handleThemeSelect(theme.id)}
                        >
                          {isLocked && (
                            <div className="absolute top-2 right-2 z-20">
                              <Lock className="w-4 h-4 text-gray-500" />
                            </div>
                          )}
                          
                          {isSelected && (
                            <div className="absolute top-2 right-2 z-20">
                              <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          )}
                          
                          <div className="space-y-3">
                            {theme.preview}
                            
                            <div>
                              <h4 className="font-semibold text-sm">{theme.name}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {theme.description}
                              </p>
                              
                              <div className="flex items-center justify-between mt-2">
                                <Badge 
                                  variant={isLocked ? "secondary" : theme.xpRequired === 0 ? "default" : "outline"}
                                  className="text-xs"
                                >
                                  {theme.xpRequired === 0 ? 'Free' : `${theme.xpRequired} XP`}
                                </Badge>
                                
                                {isSelected && (
                                  <Badge variant="default" className="text-xs bg-purple-600">
                                    Active
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}