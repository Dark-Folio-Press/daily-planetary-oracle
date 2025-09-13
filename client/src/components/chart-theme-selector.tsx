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

// Only the three native Kerykeion themes - available to all users
const chartThemes: ChartTheme[] = [
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
  const { toast } = useToast();

  useEffect(() => {
    setSelectedTheme(currentTheme);
  }, [currentTheme]);

  const handleThemeSelect = (themeId: string) => {
    const theme = chartThemes.find(t => t.id === themeId);
    if (!theme) return;

    setSelectedTheme(themeId);
    onThemeSelect(themeId);
    
    toast({
      title: "Theme Applied",
      description: `${theme.name} theme is now active for all your birth charts!`,
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Chart Theme Selection</h2>
        <p className="text-muted-foreground text-sm">
          Choose your preferred professional chart styling
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Palette className="w-5 h-5" />
            <div>
              <h3 className="font-semibold">Professional Charts</h3>
              <p className="text-sm text-muted-foreground">Swiss Ephemeris accuracy with clean styling</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {chartThemes.map((theme) => {
              const isSelected = selectedTheme === theme.id;
              
              return (
                <div
                  key={theme.id}
                  className={`relative border rounded-lg p-4 cursor-pointer transition-all hover:scale-105 ${
                    isSelected 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                  onClick={() => handleThemeSelect(theme.id)}
                >
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
                        <Badge variant="default" className="text-xs">
                          Free
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
      </Card>
    </div>
  );
}