import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Crown, Sparkles, Heart, Star, Diamond } from 'lucide-react';
import { VintageChartPreview } from './enhanced-vintage-chart';

interface VintageTheme {
  name: string;
  era: string;
  description: string;
  primaryFont: string;
  accentFont: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  icon: React.ReactNode;
  className: string;
}

const vintageThemes: VintageTheme[] = [
  {
    name: "Art Deco Elegance",
    era: "1920s-1930s",
    description: "Bold geometric patterns with luxury gold accents and sophisticated serif typography from the Jazz Age",
    primaryFont: "Playfair Display",
    accentFont: "Cinzel", 
    colors: {
      primary: "#C9A961", // Rich Gold
      secondary: "#2C2C2C", // Charcoal Black
      accent: "#8B4513", // Bronze
      background: "#F5F5DC", // Cream
      text: "#1a1a1a"
    },
    icon: <Crown className="w-5 h-5" />,
    className: "theme-art-deco"
  },
  {
    name: "Victorian Romance",
    era: "1837-1901",
    description: "Ornate script fonts with deep burgundy and gold, evoking the elegance of the Victorian era",
    primaryFont: "Great Vibes",
    accentFont: "Cormorant Garamond",
    colors: {
      primary: "#722F37", // Deep Burgundy
      secondary: "#D4AF37", // Antique Gold
      accent: "#8B4513", // Saddle Brown
      background: "#FDF5E6", // Old Lace
      text: "#2F1B14"
    },
    icon: <Heart className="w-5 h-5" />,
    className: "theme-victorian"
  },
  {
    name: "Mid-Century Modern",
    era: "1950s",
    description: "Clean atomic age styling with bold serif headers and vintage teal and orange color palette",
    primaryFont: "Abril Fatface",
    accentFont: "Crimson Text",
    colors: {
      primary: "#2F4F4F", // Dark Slate Gray
      secondary: "#FF6347", // Tomato Red
      accent: "#20B2AA", // Light Sea Green
      background: "#F5F5F5", // White Smoke
      text: "#2F2F2F"
    },
    icon: <Star className="w-5 h-5" />,
    className: "theme-midcentury"
  },
  {
    name: "Classic Elegance", 
    era: "Timeless",
    description: "Refined traditional typography with rich navy and gold, perfect for sophisticated astrological charts",
    primaryFont: "Cormorant Garamond",
    accentFont: "Playfair Display",
    colors: {
      primary: "#1e3a8a", // Rich Navy
      secondary: "#d97706", // Amber Gold  
      accent: "#7c2d12", // Deep Brown
      background: "#fefdf9", // Warm White
      text: "#1f2937"
    },
    icon: <Diamond className="w-5 h-5" />,
    className: "theme-classic"
  }
];

export function VintageThemeDemo() {
  const [selectedTheme, setSelectedTheme] = useState<VintageTheme>(vintageThemes[0]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Vintage Chart Themes</h2>
        <p className="text-muted-foreground text-sm">
          Authentic period styling for birth charts • Unlocked at different XP levels
        </p>
      </div>

      {/* Theme Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vintageThemes.map((theme) => (
          <Button
            key={theme.name}
            onClick={() => setSelectedTheme(theme)}
            variant={selectedTheme.name === theme.name ? "default" : "outline"}
            className={`h-auto p-4 flex flex-col items-start space-y-2 ${
              selectedTheme.name === theme.name 
                ? "bg-amber-600 hover:bg-amber-700" 
                : "hover:bg-accent"
            }`}
          >
            <div className="flex items-center space-x-2">
              <div className="text-amber-600">{theme.icon}</div>
              <div className="text-left">
                <p className="font-semibold">{theme.name}</p>
                <p className="text-xs opacity-70">{theme.era}</p>
              </div>
            </div>
          </Button>
        ))}
      </div>

      {/* Selected Theme Preview */}
      <Card className={`${selectedTheme.className} transition-all duration-300`}>
        <CardContent className="p-6">
          {/* Theme Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div style={{ color: selectedTheme.colors.primary }}>
                {selectedTheme.icon}
              </div>
              <h3 
                className="text-xl font-bold"
                style={{ 
                  fontFamily: selectedTheme.primaryFont,
                  color: selectedTheme.colors.primary 
                }}
              >
                {selectedTheme.name}
              </h3>
            </div>
            <p 
              className="text-sm"
              style={{ 
                fontFamily: selectedTheme.accentFont,
                color: selectedTheme.colors.text 
              }}
            >
              {selectedTheme.description}
            </p>
          </div>

          {/* Enhanced Birth Chart Preview */}
          <VintageChartPreview theme={selectedTheme} />

          {/* Font & Color Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <h5 className="font-semibold mb-2" style={{ color: selectedTheme.colors.primary }}>
                Typography
              </h5>
              <p style={{ color: selectedTheme.colors.text }}>
                <strong>Headlines:</strong> {selectedTheme.primaryFont}
              </p>
              <p style={{ color: selectedTheme.colors.text }}>
                <strong>Body Text:</strong> {selectedTheme.accentFont}
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-2" style={{ color: selectedTheme.colors.primary }}>
                Color Palette
              </h5>
              <div className="flex space-x-1">
                <div 
                  className="w-4 h-4 rounded border border-gray-300" 
                  style={{ backgroundColor: selectedTheme.colors.primary }}
                  title="Primary"
                />
                <div 
                  className="w-4 h-4 rounded border border-gray-300" 
                  style={{ backgroundColor: selectedTheme.colors.secondary }}
                  title="Secondary"
                />
                <div 
                  className="w-4 h-4 rounded border border-gray-300" 
                  style={{ backgroundColor: selectedTheme.colors.accent }}
                  title="Accent"
                />
                <div 
                  className="w-4 h-4 rounded border border-gray-300" 
                  style={{ backgroundColor: selectedTheme.colors.background }}
                  title="Background"
                />
              </div>
            </div>
          </div>

          {/* XP Requirements */}
          <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              <span className="font-semibold">{selectedTheme.name}</span> • 
              Unlocks at {selectedTheme.name === "Art Deco Elegance" ? "1500" : 
                         selectedTheme.name === "Victorian Romance" ? "2000" :
                         selectedTheme.name === "Mid-Century Modern" ? "2500" : "3000"} XP
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}