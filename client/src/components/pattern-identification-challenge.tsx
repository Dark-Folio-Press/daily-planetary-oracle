import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Target, CheckCircle, XCircle } from 'lucide-react';

interface Planet {
  planet: string;
  sign: string;
  degree: number;
  house: number;
}

interface ChartData {
  planets: Planet[];
  lunarNodes: {
    northNode: string;
    southNode: string;
  };
}

interface BirthData {
  birthDate: string;
  birthTime: string;
  birthLocation: string;
}

interface PatternIdentificationChallengeProps {
  chartData?: ChartData;
  birthData?: BirthData;
}

interface ChartPattern {
  type: string;
  confidence: number;
  description: string;
  characteristics: string[];
}

const CHART_PATTERNS = [
  { id: 'bowl', name: 'Bowl', description: 'Planets span about 180°, self-contained focus' },
  { id: 'bucket', name: 'Bucket', description: 'Bowl pattern + one singleton planet, mission-focused' },
  { id: 'bundle', name: 'Bundle', description: 'Planets clustered in 120° or less, specialized expertise' },
  { id: 'locomotive', name: 'Locomotive', description: 'Planets span 240°, practical drive forward' },
  { id: 'seesaw', name: 'Seesaw', description: 'Two opposing groups, balancing dualities' },
  { id: 'splay', name: 'Splay', description: 'Irregular distribution, individualistic approach' },
  { id: 'splash', name: 'Splash', description: 'Evenly distributed, universal interests' }
];

const ZODIAC_SYMBOLS = {
  'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
  'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
  'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
};

const PLANET_SYMBOLS = {
  'Sun': '☉', 'Moon': '☽', 'Mercury': '☿', 'Venus': '♀',
  'Mars': '♂', 'Jupiter': '♃', 'Saturn': '♄', 'Uranus': '♅',
  'Neptune': '♆', 'Pluto': '♇'
};

const PLANET_COLORS = {
  'Sun': '#fbbf24', 'Moon': '#e5e7eb', 'Mercury': '#60a5fa', 'Venus': '#f472b6',
  'Mars': '#ef4444', 'Jupiter': '#a855f7', 'Saturn': '#6b7280', 'Uranus': '#06b6d4',
  'Neptune': '#3b82f6', 'Pluto': '#7c2d12'
};

export function PatternIdentificationChallenge({ chartData, birthData }: PatternIdentificationChallengeProps) {
  const [detailedChart, setDetailedChart] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [hasGuessed, setHasGuessed] = useState(false);
  const [detectedPattern, setDetectedPattern] = useState<ChartPattern | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isCorrectGuess, setIsCorrectGuess] = useState(false);

  // Fetch detailed chart data
  useEffect(() => {
    const fetchChartData = async () => {
      if (!birthData?.birthDate || !birthData?.birthTime || !birthData?.birthLocation) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/chart/detailed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            birthDate: birthData.birthDate,
            birthTime: birthData.birthTime,
            birthLocation: birthData.birthLocation
          })
        });

        const data = await response.json();
        if (data.success && data.chart) {
          setDetailedChart(data.chart);
          
          // Detect the pattern
          const pattern = detectChartPattern(data.chart.planets);
          setDetectedPattern(pattern);
        }
      } catch (error) {
        console.error('Failed to fetch detailed chart:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [birthData]);

  // Convert zodiac sign and degree to chart position
  const getChartPosition = (sign: string, degree: number) => {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const signIndex = signs.indexOf(sign);
    const totalDegree = (signIndex * 30 + degree) % 360;
    const angle = (totalDegree - 90) * (Math.PI / 180); // Start from top (Aries)
    
    const radius = 120; // Distance from center
    const centerX = 160; // Half of 320px width
    const centerY = 160; // Half of 320px height
    
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
      degree: totalDegree
    };
  };

  // Detect chart pattern based on planetary positions
  const detectChartPattern = (planets: Planet[]): ChartPattern => {
    if (!planets || planets.length === 0) {
      return { type: 'splash', confidence: 0.5, description: 'Unable to determine pattern', characteristics: [] };
    }

    // Convert planets to degrees
    const planetDegrees = planets.map(planet => {
      const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                     'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
      const signIndex = signs.indexOf(planet.sign);
      return (signIndex * 30 + planet.degree) % 360;
    }).sort((a, b) => a - b);

    // Calculate gaps between planets
    const gaps = [];
    for (let i = 0; i < planetDegrees.length; i++) {
      const current = planetDegrees[i];
      const next = planetDegrees[(i + 1) % planetDegrees.length];
      const gap = next > current ? next - current : (360 - current) + next;
      gaps.push(gap);
    }

    const maxGap = Math.max(...gaps);
    const minGap = Math.min(...gaps);
    const totalSpread = planetDegrees[planetDegrees.length - 1] - planetDegrees[0];

    // Pattern detection logic
    if (maxGap >= 120 && totalSpread <= 180) {
      return {
        type: 'bowl',
        confidence: 0.9,
        description: 'Bowl pattern - planets occupy about half the chart',
        characteristics: ['Self-contained', 'Purposeful', 'Mission-oriented', 'Seeks completion']
      };
    } else if (maxGap >= 120 && gaps.filter(g => g < 30).length >= 1) {
      return {
        type: 'bucket',
        confidence: 0.85,
        description: 'Bucket pattern - bowl with singleton planet',
        characteristics: ['Mission-focused', 'Single-pointed drive', 'Specialized purpose', 'Leadership oriented']
      };
    } else if (totalSpread <= 120) {
      return {
        type: 'bundle',
        confidence: 0.8,
        description: 'Bundle pattern - highly concentrated planets',
        characteristics: ['Specialized expertise', 'Intense focus', 'Narrow but deep interests', 'Expert development']
      };
    } else if (totalSpread >= 240 && maxGap <= 120) {
      return {
        type: 'locomotive',
        confidence: 0.75,
        description: 'Locomotive pattern - steady progression around chart',
        characteristics: ['Practical drive', 'Steady progress', 'Methodical approach', 'Building momentum']
      };
    } else if (gaps.filter(g => g >= 60).length >= 2) {
      return {
        type: 'seesaw',
        confidence: 0.7,
        description: 'Seesaw pattern - opposing planetary groups',
        characteristics: ['Balancing opposites', 'Dualistic nature', 'Relationship-focused', 'Seeks harmony']
      };
    } else if (gaps.every(g => g >= 20 && g <= 80)) {
      return {
        type: 'splash',
        confidence: 0.6,
        description: 'Splash pattern - evenly distributed planets',
        characteristics: ['Universal interests', 'Versatile approach', 'Many talents', 'Broad perspective']
      };
    } else {
      return {
        type: 'splay',
        confidence: 0.65,
        description: 'Splay pattern - irregular planetary distribution',
        characteristics: ['Individualistic', 'Unique approach', 'Non-conformist', 'Creative expression']
      };
    }
  };

  // Handle pattern guess
  const handlePatternGuess = (patternId: string) => {
    setSelectedPattern(patternId);
    setHasGuessed(true);
    
    const isCorrect = detectedPattern?.type === patternId;
    setIsCorrectGuess(isCorrect);
    
    if (isCorrect) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  };

  // Get celebration message
  const getCelebrationMessage = () => {
    if (!detectedPattern) return '';
    
    const patternName = CHART_PATTERNS.find(p => p.id === detectedPattern.type)?.name || detectedPattern.type;
    
    if (isCorrectGuess) {
      return `🌟 Incredible! You correctly identified your ${patternName} pattern! Your astrological intuition is spot on!`;
    } else {
      const guessedName = CHART_PATTERNS.find(p => p.id === selectedPattern)?.name || selectedPattern;
      return `Good guess with ${guessedName}! Let me show you your actual ${patternName} pattern and what it means.`;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading your birth chart...</p>
      </div>
    );
  }

  if (!detailedChart || !detectedPattern) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">Unable to load your birth chart data. Please ensure your birth information is complete.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h4 className="font-semibold mb-2 flex items-center justify-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          Your Personal Chart Pattern Challenge
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {!hasGuessed ? 
            "Look at your birth chart below. Can you identify the pattern your planets form?" :
            getCelebrationMessage()
          }
        </p>
      </div>

      {/* Celebration Animation */}
      {showCelebration && (
        <div className="text-center py-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-center gap-2 text-purple-700 dark:text-purple-300">
            <Sparkles className="w-6 h-6 animate-pulse" />
            <span className="text-lg font-semibold">Amazing intuition!</span>
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
        </div>
      )}

      {/* Interactive Chart Wheel */}
      <div className="relative">
        <div className="relative w-80 h-80 mx-auto border-2 border-indigo-400 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
          {/* Chart wheel background */}
          <div className="absolute inset-4 border border-gray-300 rounded-full"></div>
          <div className="absolute inset-8 border border-gray-200 rounded-full"></div>
          
          {/* Hemisphere dividers */}
          <div className="absolute w-full h-0.5 bg-indigo-300 top-1/2 transform -translate-y-px"></div>
          <div className="absolute h-full w-0.5 bg-indigo-300 left-1/2 transform -translate-x-px"></div>
          
          {/* Zodiac signs around the wheel */}
          {Object.entries(ZODIAC_SYMBOLS).map(([sign, symbol], index) => {
            const angle = (index * 30 - 90) * (Math.PI / 180);
            const x = 160 + Math.cos(angle) * 140;
            const y = 160 + Math.sin(angle) * 140;
            
            return (
              <div
                key={sign}
                className="absolute text-xs font-semibold text-gray-500 dark:text-gray-400"
                style={{
                  left: x - 10,
                  top: y - 8,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {symbol}
              </div>
            );
          })}
          
          {/* Real planetary positions */}
          {detailedChart.planets.map((planet) => {
            const position = getChartPosition(planet.sign, planet.degree);
            const symbol = PLANET_SYMBOLS[planet.planet as keyof typeof PLANET_SYMBOLS] || planet.planet[0];
            const color = PLANET_COLORS[planet.planet as keyof typeof PLANET_COLORS] || '#6b7280';
            
            return (
              <div
                key={planet.planet}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: position.x, top: position.y }}
                title={`${planet.planet} in ${planet.sign}`}
              >
                <div 
                  className="w-5 h-5 rounded-full shadow-lg border-2 border-white flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  {symbol}
                </div>
              </div>
            );
          })}
          
          {/* Pattern overlay (shown after guess) */}
          {hasGuessed && detectedPattern && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {detectedPattern.type === 'bowl' && (
                <path 
                  d="M 60 80 A 100 100 0 1 1 260 80" 
                  stroke={isCorrectGuess ? "#10b981" : "#8b5cf6"} 
                  strokeWidth="3" 
                  fill="none" 
                  strokeDasharray="6,6" 
                  opacity="0.8"
                  className="animate-pulse"
                />
              )}
              {detectedPattern.type === 'bundle' && (
                <circle 
                  cx="160" 
                  cy="100" 
                  r="40" 
                  stroke={isCorrectGuess ? "#10b981" : "#8b5cf6"} 
                  strokeWidth="3" 
                  fill="none" 
                  strokeDasharray="6,6" 
                  opacity="0.8"
                  className="animate-pulse"
                />
              )}
              {detectedPattern.type === 'seesaw' && (
                <>
                  <circle cx="120" cy="120" r="30" stroke={isCorrectGuess ? "#10b981" : "#8b5cf6"} strokeWidth="3" fill="none" strokeDasharray="6,6" opacity="0.8" className="animate-pulse" />
                  <circle cx="200" cy="200" r="30" stroke={isCorrectGuess ? "#10b981" : "#8b5cf6"} strokeWidth="3" fill="none" strokeDasharray="6,6" opacity="0.8" className="animate-pulse" />
                  <line x1="120" y1="120" x2="200" y2="200" stroke={isCorrectGuess ? "#10b981" : "#8b5cf6"} strokeWidth="2" strokeDasharray="4,4" opacity="0.6" />
                </>
              )}
            </svg>
          )}
          
          {/* Center label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center bg-white dark:bg-gray-800 px-3 py-1 rounded-full border shadow-sm">
              <div className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">Your Chart</div>
              <div className="text-xs text-indigo-600 dark:text-indigo-400">{birthData?.birthLocation}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pattern Selection (before guess) */}
      {!hasGuessed && (
        <div className="space-y-4">
          <p className="text-center text-sm font-medium text-gray-700 dark:text-gray-300">
            Which pattern do you see in your chart?
          </p>
          <div className="grid grid-cols-2 gap-3">
            {CHART_PATTERNS.slice(0, 4).map((pattern) => (
              <Button
                key={pattern.id}
                variant="outline"
                className="h-auto p-3 text-left border-purple-200 hover:border-purple-400 hover:bg-purple-50 dark:border-purple-700 dark:hover:border-purple-500 dark:hover:bg-purple-900/20"
                onClick={() => handlePatternGuess(pattern.id)}
              >
                <div>
                  <div className="font-semibold text-purple-700 dark:text-purple-300">{pattern.name}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{pattern.description}</div>
                </div>
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {CHART_PATTERNS.slice(4).map((pattern) => (
              <Button
                key={pattern.id}
                variant="outline"
                className="h-auto p-3 text-left border-purple-200 hover:border-purple-400 hover:bg-purple-50 dark:border-purple-700 dark:hover:border-purple-500 dark:hover:bg-purple-900/20"
                onClick={() => handlePatternGuess(pattern.id)}
              >
                <div>
                  <div className="font-semibold text-purple-700 dark:text-purple-300">{pattern.name}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{pattern.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Pattern Analysis (after guess) */}
      {hasGuessed && detectedPattern && (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            {isCorrectGuess ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <XCircle className="w-6 h-6 text-orange-500" />
            )}
            <Badge variant={isCorrectGuess ? "default" : "secondary"} className={isCorrectGuess ? "bg-green-500" : "bg-orange-500"}>
              {isCorrectGuess ? "Correct!" : "Close!"}
            </Badge>
          </div>

          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
            <CardContent className="p-6">
              <h5 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">
                Your {CHART_PATTERNS.find(p => p.id === detectedPattern.type)?.name} Pattern
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {detectedPattern.description}
              </p>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Key Characteristics:</p>
                <div className="flex flex-wrap gap-2">
                  {detectedPattern.characteristics.map((characteristic, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {characteristic}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Personal Insights</p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  This {detectedPattern.type} pattern in your chart suggests you approach life with a focus on{' '}
                  {detectedPattern.characteristics[0]?.toLowerCase() || 'balance and growth'}. Your planetary arrangement 
                  reveals unique strengths in {detectedPattern.characteristics[1]?.toLowerCase() || 'personal development'} 
                  and shows how cosmic energies shape your individual path.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}