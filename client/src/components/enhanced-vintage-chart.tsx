import { Card, CardContent } from '@/components/ui/card';

interface VintageChartPreviewProps {
  theme: {
    name: string;
    era: string;
    primaryFont: string;
    accentFont: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    className: string;
  };
}

export function VintageChartPreview({ theme }: VintageChartPreviewProps) {
  return (
    <div 
      className="border-2 rounded-lg p-6 mb-4 relative overflow-hidden"
      style={{ 
        borderColor: theme.colors.secondary,
        backgroundColor: theme.colors.background 
      }}
    >
      {/* Chart Header */}
      <div className="text-center mb-6 relative z-10">
        <h4 
          className="text-2xl font-bold mb-2"
          style={{ 
            fontFamily: theme.primaryFont,
            color: theme.colors.primary,
            textShadow: theme.name === 'Art Deco Elegance' ? '1px 1px 2px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          {theme.name === 'Art Deco Elegance' ? 'BIRTH CHART' :
           theme.name === 'Victorian Romance' ? 'Astrological Chart' :
           theme.name === 'Mid-Century Modern' ? 'NATAL CHART' : 'Birth Chart'}
        </h4>
        <div 
          className="w-16 h-0.5 mx-auto mb-3"
          style={{ backgroundColor: theme.colors.secondary }}
        />
        <p 
          className="text-base font-medium"
          style={{ 
            fontFamily: theme.accentFont,
            color: theme.colors.text,
            fontStyle: theme.name === 'Victorian Romance' ? 'italic' : 'normal'
          }}
        >
          Mary Shelley
        </p>
        <p 
          className="text-sm mt-1"
          style={{ 
            fontFamily: theme.accentFont,
            color: theme.colors.accent 
          }}
        >
          August 30, 1797 • 11:20 PM • London, England
        </p>
      </div>

      {/* Chart Circle Mockup */}
      <div className="flex justify-center mb-6">
        <div 
          className="w-48 h-48 rounded-full border-4 relative flex items-center justify-center"
          style={{ 
            borderColor: theme.colors.primary,
            background: `conic-gradient(from 0deg, ${theme.colors.background} 0deg, ${theme.colors.primary}15 30deg, ${theme.colors.background} 60deg, ${theme.colors.secondary}15 90deg, ${theme.colors.background} 120deg, ${theme.colors.accent}15 150deg, ${theme.colors.background} 180deg, ${theme.colors.primary}15 210deg, ${theme.colors.background} 240deg, ${theme.colors.secondary}15 270deg, ${theme.colors.background} 300deg, ${theme.colors.accent}15 330deg, ${theme.colors.background} 360deg)`
          }}
        >
          {/* Inner circle */}
          <div 
            className="w-32 h-32 rounded-full border-2 flex items-center justify-center"
            style={{ 
              borderColor: theme.colors.secondary,
              backgroundColor: theme.colors.background
            }}
          >
            <div 
              className="text-center"
              style={{ fontFamily: theme.primaryFont, color: theme.colors.primary }}
            >
              <div className="text-xl font-bold">♍</div>
              <div className="text-xs mt-1">Virgo Sun</div>
            </div>
          </div>
          
          {/* Planetary markers around the circle */}
          {[
            { symbol: '☉', position: 'top-4 left-1/2 transform -translate-x-1/2' },
            { symbol: '☽', position: 'bottom-4 left-1/2 transform -translate-x-1/2' },
            { symbol: '♀', position: 'right-4 top-1/2 transform -translate-y-1/2' },
            { symbol: '♂', position: 'left-4 top-1/2 transform -translate-y-1/2' }
          ].map((planet, i) => (
            <div 
              key={i}
              className={`absolute ${planet.position} w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold`}
              style={{ 
                backgroundColor: theme.colors.secondary,
                color: theme.colors.background
              }}
            >
              {planet.symbol}
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Planetary Placements Table */}
      <div className="space-y-3">
        <h5 
          className="text-center font-bold mb-4"
          style={{ 
            fontFamily: theme.primaryFont,
            color: theme.colors.primary,
            fontSize: theme.name === 'Art Deco Elegance' ? '1.1rem' : '1rem',
            letterSpacing: theme.name === 'Art Deco Elegance' ? '0.05em' : 'normal'
          }}
        >
          {theme.name === 'Victorian Romance' ? 'Celestial Placements' : 'Planetary Positions'}
        </h5>
        
        <div className="grid grid-cols-1 gap-2">
          {[
            { planet: "☉ Sun", sign: "♍ Virgo", house: "6th House", degree: "6°42'", description: "Core identity & vitality" },
            { planet: "☽ Moon", sign: "♓ Pisces", house: "12th House", degree: "23°17'", description: "Emotions & instincts" },
            { planet: "↗ Ascendant", sign: "♓ Pisces", house: "1st House", degree: "24°44'", description: "Rising sign & appearance" },
            { planet: "☿ Mercury", sign: "♌ Leo", house: "5th House", degree: "28°31'", description: "Communication & mind" },
            { planet: "♀ Venus", sign: "♎ Libra", house: "7th House", degree: "12°58'", description: "Love & relationships" },
            { planet: "♂ Mars", sign: "♋ Cancer", house: "4th House", degree: "19°02'", description: "Action & energy" }
          ].map((placement, i) => (
            <div 
              key={i} 
              className="p-3 rounded border grid grid-cols-4 gap-2 items-center"
              style={{ 
                borderColor: theme.colors.accent + '40',
                backgroundColor: theme.colors.background
              }}
            >
              <div 
                className="font-bold text-center"
                style={{ 
                  fontFamily: theme.primaryFont,
                  color: theme.colors.primary,
                  fontSize: '0.95rem'
                }}
              >
                {placement.planet}
              </div>
              <div 
                className="text-center"
                style={{ 
                  fontFamily: theme.accentFont,
                  color: theme.colors.text,
                  fontSize: '0.9rem'
                }}
              >
                {placement.sign}
              </div>
              <div 
                className="text-center font-mono text-sm"
                style={{ color: theme.colors.secondary }}
              >
                {placement.degree}
              </div>
              <div 
                className="text-xs opacity-75"
                style={{ 
                  fontFamily: theme.accentFont,
                  color: theme.colors.accent
                }}
              >
                {placement.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Era-specific decorative elements */}
      {theme.name === 'Art Deco Elegance' && (
        <>
          <div className="absolute top-4 left-4 w-8 h-8 border-2 border-current opacity-20 rotate-45" style={{ color: theme.colors.primary }} />
          <div className="absolute top-4 right-4 w-8 h-8 border-2 border-current opacity-20 rotate-45" style={{ color: theme.colors.primary }} />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-2 border-current opacity-20 rotate-45" style={{ color: theme.colors.primary }} />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-2 border-current opacity-20 rotate-45" style={{ color: theme.colors.primary }} />
        </>
      )}
      
      {theme.name === 'Victorian Romance' && (
        <>
          <div className="absolute top-2 left-2 text-2xl opacity-15" style={{ color: theme.colors.secondary }}>❦</div>
          <div className="absolute top-2 right-2 text-2xl opacity-15" style={{ color: theme.colors.secondary }}>❦</div>
          <div className="absolute bottom-2 left-2 text-2xl opacity-15" style={{ color: theme.colors.secondary }}>❦</div>
          <div className="absolute bottom-2 right-2 text-2xl opacity-15" style={{ color: theme.colors.secondary }}>❦</div>
        </>
      )}

      {theme.name === 'Mid-Century Modern' && (
        <>
          <div className="absolute top-6 left-6 w-4 h-4 rounded-full opacity-20" style={{ backgroundColor: theme.colors.accent }} />
          <div className="absolute top-6 right-6 w-4 h-4 rounded-full opacity-20" style={{ backgroundColor: theme.colors.secondary }} />
          <div className="absolute bottom-6 left-6 w-4 h-4 rounded-full opacity-20" style={{ backgroundColor: theme.colors.primary }} />
          <div className="absolute bottom-6 right-6 w-4 h-4 rounded-full opacity-20" style={{ backgroundColor: theme.colors.accent }} />
        </>
      )}

      {theme.name === 'Classic Elegance' && (
        <>
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-8 h-1 opacity-20" style={{ backgroundColor: theme.colors.secondary }} />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-1 opacity-20" style={{ backgroundColor: theme.colors.secondary }} />
          <div className="absolute top-1/2 left-4 transform -translate-y-1/2 w-1 h-8 opacity-20" style={{ backgroundColor: theme.colors.secondary }} />
          <div className="absolute top-1/2 right-4 transform -translate-y-1/2 w-1 h-8 opacity-20" style={{ backgroundColor: theme.colors.secondary }} />
        </>
      )}
    </div>
  );
}