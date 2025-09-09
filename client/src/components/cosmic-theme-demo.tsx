import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Sparkles, CircleDot, Sun, Rocket } from 'lucide-react';

interface CosmicTheme {
  name: string;
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
  effects: string;
}

const cosmicThemes: CosmicTheme[] = [
  {
    name: "Deep Space",
    description: "Infinite starfield with twinkling stars and deep space gradients, perfect for cosmic wonder",
    primaryFont: "Orbitron",
    accentFont: "Exo",
    colors: {
      primary: "#00d4ff", // Plasma Blue
      secondary: "#ffffff", // Star White  
      accent: "#4ecdc4", // Galaxy Teal
      background: "#0f0f23", // Void Black
      text: "#ffffff"
    },
    icon: <Sparkles className="w-5 h-5" />,
    className: "theme-deep-space",
    effects: "Animated twinkling starfield background"
  },
  {
    name: "Nebula",
    description: "Swirling cosmic clouds with vibrant nebula colors and ethereal space dust effects",
    primaryFont: "Audiowide",
    accentFont: "Rajdhani",
    colors: {
      primary: "#e056fd", // Nebula Pink
      secondary: "#ffb347", // Stellar Gold
      accent: "#00d4ff", // Plasma Blue
      background: "#1a0b2e", // Deep Purple
      text: "#ffffff"
    },
    icon: <CircleDot className="w-5 h-5" />,
    className: "theme-nebula",
    effects: "Swirling nebula clouds with color animations"
  },
  {
    name: "Galaxy",
    description: "Spinning spiral galaxy with cosmic rotation and radial stellar formations",
    primaryFont: "Exo",
    accentFont: "Space Mono",
    colors: {
      primary: "#4ecdc4", // Galaxy Teal
      secondary: "#e056fd", // Nebula Pink
      accent: "#ffb347", // Stellar Gold
      background: "#0f0f23", // Void Black
      text: "#ffffff"
    },
    icon: <Zap className="w-5 h-5" />,
    className: "theme-galaxy",
    effects: "Rotating galaxy spiral with stellar core"
  },
  {
    name: "Solar System",
    description: "Radial solar warmth with pulsing star core and planetary orbital aesthetics",
    primaryFont: "Rajdhani",
    accentFont: "Orbitron",
    colors: {
      primary: "#ffb347", // Stellar Gold
      secondary: "#00d4ff", // Plasma Blue
      accent: "#e056fd", // Nebula Pink
      background: "#16213e", // Royal Purple
      text: "#ffffff"
    },
    icon: <Sun className="w-5 h-5" />,
    className: "theme-solar-system",
    effects: "Pulsing solar core with orbital rings"
  }
];

export function CosmicThemeDemo() {
  const [selectedTheme, setSelectedTheme] = useState<CosmicTheme>(cosmicThemes[0]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Rocket className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold">Cosmic Chart Themes</h2>
        </div>
        <p className="text-muted-foreground text-sm">
          Space-age styling with animated cosmic effects • Unlocked at premium XP levels
        </p>
      </div>

      {/* Theme Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cosmicThemes.map((theme) => (
          <Button
            key={theme.name}
            onClick={() => setSelectedTheme(theme)}
            variant={selectedTheme.name === theme.name ? "default" : "outline"}
            className={`h-auto p-4 flex flex-col items-start space-y-2 ${
              selectedTheme.name === theme.name 
                ? "bg-purple-600 hover:bg-purple-700 text-white" 
                : "hover:bg-accent border-purple-500/30"
            }`}
          >
            <div className="flex items-center space-x-2">
              <div style={{ color: theme.colors.primary }}>
                {theme.icon}
              </div>
              <div className="text-left">
                <p className="font-semibold">{theme.name}</p>
                <p className="text-xs opacity-70">{theme.effects}</p>
              </div>
            </div>
          </Button>
        ))}
      </div>

      {/* Selected Theme Preview */}
      <Card className={`${selectedTheme.className} transition-all duration-300 border-2`}>
        <CardContent className="p-6 relative z-10">
          {/* Theme Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div style={{ color: selectedTheme.colors.primary }}>
                {selectedTheme.icon}
              </div>
              <h3 
                className="text-xl font-bold tracking-wide"
                style={{ 
                  fontFamily: selectedTheme.primaryFont,
                  color: selectedTheme.colors.primary,
                  textShadow: '0 0 10px rgba(255,255,255,0.5)'
                }}
              >
                {selectedTheme.name.toUpperCase()}
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

          {/* Enhanced Cosmic Birth Chart Preview */}
          <div 
            className="border-2 rounded-lg p-6 mb-4 relative overflow-hidden"
            style={{ 
              borderColor: selectedTheme.colors.secondary,
              backgroundColor: selectedTheme.colors.background + '90' 
            }}
          >
            {/* Chart Header */}
            <div className="text-center mb-6 relative z-10">
              <h4 
                className="text-2xl font-bold mb-2 tracking-widest"
                style={{ 
                  fontFamily: selectedTheme.primaryFont,
                  color: selectedTheme.colors.primary,
                  textShadow: `0 0 15px ${selectedTheme.colors.primary}50`,
                  letterSpacing: '0.1em'
                }}
              >
                {selectedTheme.name === 'Deep Space' ? 'STELLAR CHART' :
                 selectedTheme.name === 'Nebula' ? 'COSMIC CHART' :
                 selectedTheme.name === 'Galaxy' ? 'GALACTIC CHART' : 'SOLAR CHART'}
              </h4>
              <div 
                className="w-20 h-0.5 mx-auto mb-3"
                style={{ 
                  backgroundColor: selectedTheme.colors.secondary,
                  boxShadow: `0 0 10px ${selectedTheme.colors.secondary}`
                }}
              />
              <p 
                className="text-base font-medium"
                style={{ 
                  fontFamily: selectedTheme.accentFont,
                  color: selectedTheme.colors.text,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Mary Shelley
              </p>
              <p 
                className="text-sm mt-1 font-mono"
                style={{ 
                  fontFamily: 'Space Mono',
                  color: selectedTheme.colors.accent 
                }}
              >
                1797.08.30 • 23:20:00 • LONDON.EARTH
              </p>
            </div>

            {/* Cosmic Chart Circle */}
            <div className="flex justify-center mb-6">
              <div 
                className="w-52 h-52 rounded-full border-4 relative flex items-center justify-center"
                style={{ 
                  borderColor: selectedTheme.colors.primary,
                  background: `conic-gradient(from 0deg, ${selectedTheme.colors.background}80 0deg, ${selectedTheme.colors.primary}20 30deg, ${selectedTheme.colors.background}80 60deg, ${selectedTheme.colors.secondary}20 90deg, ${selectedTheme.colors.background}80 120deg, ${selectedTheme.colors.accent}20 150deg, ${selectedTheme.colors.background}80 180deg, ${selectedTheme.colors.primary}20 210deg, ${selectedTheme.colors.background}80 240deg, ${selectedTheme.colors.secondary}20 270deg, ${selectedTheme.colors.background}80 300deg, ${selectedTheme.colors.accent}20 330deg, ${selectedTheme.colors.background}80 360deg)`,
                  boxShadow: `0 0 30px ${selectedTheme.colors.primary}40`
                }}
              >
                {/* Inner cosmic circle */}
                <div 
                  className="w-36 h-36 rounded-full border-2 flex items-center justify-center"
                  style={{ 
                    borderColor: selectedTheme.colors.secondary,
                    backgroundColor: selectedTheme.colors.background + '90',
                    boxShadow: `inset 0 0 20px ${selectedTheme.colors.primary}30`
                  }}
                >
                  <div 
                    className="text-center"
                    style={{ 
                      fontFamily: selectedTheme.primaryFont, 
                      color: selectedTheme.colors.primary 
                    }}
                  >
                    <div className="text-2xl font-bold mb-1">♍</div>
                    <div 
                      className="text-xs font-bold tracking-wide"
                      style={{ 
                        fontFamily: selectedTheme.accentFont,
                        textTransform: 'uppercase'
                      }}
                    >
                      VIRGO
                    </div>
                  </div>
                </div>
                
                {/* Cosmic planetary markers */}
                {[
                  { symbol: '☉', position: 'top-2 left-1/2 transform -translate-x-1/2', color: selectedTheme.colors.secondary },
                  { symbol: '☽', position: 'bottom-2 left-1/2 transform -translate-x-1/2', color: selectedTheme.colors.accent },
                  { symbol: '♀', position: 'right-2 top-1/2 transform -translate-y-1/2', color: selectedTheme.colors.primary },
                  { symbol: '♂', position: 'left-2 top-1/2 transform -translate-y-1/2', color: selectedTheme.colors.secondary }
                ].map((planet, i) => (
                  <div 
                    key={i}
                    className={`absolute ${planet.position} w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2`}
                    style={{ 
                      backgroundColor: planet.color,
                      color: selectedTheme.colors.background,
                      borderColor: selectedTheme.colors.background,
                      boxShadow: `0 0 15px ${planet.color}50`
                    }}
                  >
                    {planet.symbol}
                  </div>
                ))}
              </div>
            </div>

            {/* Cosmic Planetary Data Table */}
            <div className="space-y-3">
              <h5 
                className="text-center font-bold mb-4 tracking-widest"
                style={{ 
                  fontFamily: selectedTheme.primaryFont,
                  color: selectedTheme.colors.primary,
                  fontSize: '1.1rem',
                  textShadow: `0 0 10px ${selectedTheme.colors.primary}50`,
                  textTransform: 'uppercase'
                }}
              >
                {selectedTheme.name === 'Deep Space' ? 'STELLAR POSITIONS' :
                 selectedTheme.name === 'Nebula' ? 'COSMIC COORDINATES' :
                 selectedTheme.name === 'Galaxy' ? 'GALACTIC POSITIONS' : 'ORBITAL DATA'}
              </h5>
              
              <div className="grid grid-cols-1 gap-3">
                {[
                  { planet: "☉ SOL", sign: "♍ VIRGO", house: "SECTOR VI", degree: "06°42'", description: "Core stellar identity" },
                  { planet: "☽ LUNA", sign: "♓ PISCES", house: "SECTOR XII", degree: "23°17'", description: "Emotional resonance" },
                  { planet: "↗ RISE", sign: "♓ PISCES", house: "SECTOR I", degree: "24°44'", description: "Cosmic emergence" },
                  { planet: "☿ HERMES", sign: "♌ LEO", house: "SECTOR V", degree: "28°31'", description: "Neural pathways" },
                  { planet: "♀ APHRODITE", sign: "♎ LIBRA", house: "SECTOR VII", degree: "12°58'", description: "Harmony frequency" },
                  { planet: "♂ ARES", sign: "♋ CANCER", house: "SECTOR IV", degree: "19°02'", description: "Energy dynamics" }
                ].map((placement, i) => (
                  <div 
                    key={i} 
                    className="p-4 rounded-lg border grid grid-cols-4 gap-3 items-center"
                    style={{ 
                      borderColor: selectedTheme.colors.accent + '50',
                      backgroundColor: selectedTheme.colors.background + '60',
                      boxShadow: `0 2px 10px ${selectedTheme.colors.primary}20`
                    }}
                  >
                    <div 
                      className="font-bold text-center tracking-wide"
                      style={{ 
                        fontFamily: selectedTheme.primaryFont,
                        color: selectedTheme.colors.primary,
                        fontSize: '0.9rem',
                        textShadow: `0 0 5px ${selectedTheme.colors.primary}30`
                      }}
                    >
                      {placement.planet}
                    </div>
                    <div 
                      className="text-center font-semibold"
                      style={{ 
                        fontFamily: selectedTheme.accentFont,
                        color: selectedTheme.colors.text,
                        fontSize: '0.85rem'
                      }}
                    >
                      {placement.sign}
                    </div>
                    <div 
                      className="text-center font-mono text-sm font-bold"
                      style={{ 
                        color: selectedTheme.colors.secondary,
                        textShadow: `0 0 5px ${selectedTheme.colors.secondary}30`
                      }}
                    >
                      {placement.degree}
                    </div>
                    <div 
                      className="text-xs italic"
                      style={{ 
                        fontFamily: selectedTheme.accentFont,
                        color: selectedTheme.colors.accent
                      }}
                    >
                      {placement.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Theme-specific cosmic effects overlay */}
            {selectedTheme.name === 'Deep Space' && (
              <div className="absolute inset-0 pointer-events-none opacity-30">
                <div className="absolute top-8 left-8 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                <div className="absolute top-16 right-12 w-1 h-1 bg-cyan-300 rounded-full animate-pulse delay-100"></div>
                <div className="absolute bottom-20 left-16 w-1 h-1 bg-white rounded-full animate-pulse delay-200"></div>
                <div className="absolute bottom-8 right-8 w-1 h-1 bg-teal-300 rounded-full animate-pulse delay-300"></div>
              </div>
            )}
          </div>

          {/* Font & Effects Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <h5 
                className="font-semibold mb-2" 
                style={{ 
                  color: selectedTheme.colors.primary,
                  fontFamily: selectedTheme.primaryFont,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Typography
              </h5>
              <p style={{ color: selectedTheme.colors.text }}>
                <strong>Headers:</strong> {selectedTheme.primaryFont}
              </p>
              <p style={{ color: selectedTheme.colors.text }}>
                <strong>Body:</strong> {selectedTheme.accentFont}
              </p>
              <p style={{ color: selectedTheme.colors.text }}>
                <strong>Data:</strong> Space Mono
              </p>
            </div>
            <div>
              <h5 
                className="font-semibold mb-2" 
                style={{ 
                  color: selectedTheme.colors.primary,
                  fontFamily: selectedTheme.primaryFont,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Cosmic Palette
              </h5>
              <div className="flex space-x-1 mb-2">
                <div 
                  className="w-4 h-4 rounded border" 
                  style={{ 
                    backgroundColor: selectedTheme.colors.primary,
                    boxShadow: `0 0 5px ${selectedTheme.colors.primary}50`
                  }}
                  title="Primary"
                />
                <div 
                  className="w-4 h-4 rounded border" 
                  style={{ 
                    backgroundColor: selectedTheme.colors.secondary,
                    boxShadow: `0 0 5px ${selectedTheme.colors.secondary}50`
                  }}
                  title="Secondary"
                />
                <div 
                  className="w-4 h-4 rounded border" 
                  style={{ 
                    backgroundColor: selectedTheme.colors.accent,
                    boxShadow: `0 0 5px ${selectedTheme.colors.accent}50`
                  }}
                  title="Accent"
                />
              </div>
              <p style={{ color: selectedTheme.colors.text, fontSize: '0.75rem' }}>
                {selectedTheme.effects}
              </p>
            </div>
          </div>

          {/* XP Requirements */}
          <div className="mt-4 p-3 rounded-lg border" style={{
            backgroundColor: selectedTheme.colors.primary + '20',
            borderColor: selectedTheme.colors.primary + '50'
          }}>
            <p className="text-sm" style={{ color: selectedTheme.colors.text }}>
              <span className="font-semibold font-orbitron tracking-wide">
                {selectedTheme.name.toUpperCase()}
              </span> • Unlocks at {
                selectedTheme.name === 'Deep Space' ? "5000" : 
                selectedTheme.name === 'Nebula' ? "7500" :
                selectedTheme.name === 'Galaxy' ? "10000" : "12500"
              } XP
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}