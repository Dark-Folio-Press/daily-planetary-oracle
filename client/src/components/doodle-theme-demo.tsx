import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, RefreshCw, Palette, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CSSdoodleWrapper, { DoodlePatterns } from '@/components/css-doodle-wrapper';

interface DoodleThemeDemoProps {
  userXP?: number;
}

export function DoodleThemeDemo({ userXP = 1200 }: DoodleThemeDemoProps) {
  const [currentPattern, setCurrentPattern] = useState('paperTexture');
  const [patternSeed, setPatternSeed] = useState(12345);
  const { toast } = useToast();

  const isUnlocked = userXP >= 1000;

  const refreshPattern = () => {
    setPatternSeed(Math.floor(Math.random() * 999999) + 1);
    toast({
      title: "Pattern Refreshed!",
      description: "Your doodle pattern has been regenerated with a new organic feel",
    });
  };

  const patternOptions = [
    { key: 'paperTexture', name: 'Paper Texture', description: 'Subtle organic spots and marks' },
    { key: 'sketchyDots', name: 'Sketchy Dots', description: 'Floating hand-drawn dots' },
    { key: 'decorativeBorder', name: 'Decorative Border', description: 'Dashed lines and patterns' },
    { key: 'scatteredDoodles', name: 'Scattered Doodles', description: 'Animated stars and shapes' },
    { key: 'organicShapes', name: 'Organic Shapes', description: 'Math-based blob patterns' }
  ];

  const fontExamples = [
    { class: 'font-reenie', name: 'Reenie Beanie', sample: 'Your Cosmic Journey ✨' },
    { class: 'font-patrick', name: 'Patrick Hand', sample: 'Mercury in Virgo ♍' },
    { class: 'font-caveat', name: 'Caveat', sample: 'Moon Sign: Sagittarius ♐' },
    { class: 'font-kalam', name: 'Kalam', sample: 'Rising: Pisces ♓' },
    { class: 'font-indie', name: 'Indie Flower', sample: 'Venus in Leo ♌' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-purple-200 font-reenie transform rotate-1">
          ✨ Doodle Theme Showcase ✨
        </h2>
        <p className="text-purple-300 font-patrick">
          Experience authentic hand-drawn aesthetics with CSS-Doodle patterns & Google handwritten fonts
        </p>
        
        {!isUnlocked && (
          <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-4 inline-block">
            <p className="text-amber-200 font-caveat text-lg">
              🔒 Unlock for 1000 XP • Your XP: {userXP}
            </p>
          </div>
        )}
      </div>

      <Tabs defaultValue="patterns" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-purple-900/30">
          <TabsTrigger value="patterns" className="font-patrick">Doodle Patterns</TabsTrigger>
          <TabsTrigger value="fonts" className="font-reenie">Handwritten Fonts</TabsTrigger>
          <TabsTrigger value="chart-demo" className="font-caveat">Chart Preview</TabsTrigger>
        </TabsList>

        {/* Doodle Patterns Tab */}
        <TabsContent value="patterns" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pattern Controls */}
            <Card className="bg-purple-900/20 border-purple-500/30">
              <CardHeader>
                <CardTitle className="font-patrick text-purple-200">Pattern Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {patternOptions.map((pattern) => (
                    <Button
                      key={pattern.key}
                      variant={currentPattern === pattern.key ? "default" : "outline"}
                      className={`w-full justify-start font-caveat ${
                        currentPattern === pattern.key 
                          ? "bg-purple-600 text-white" 
                          : "border-purple-500/30 text-purple-300"
                      }`}
                      onClick={() => setCurrentPattern(pattern.key)}
                      disabled={!isUnlocked}
                    >
                      <Palette className="w-4 h-4 mr-2" />
                      <div className="text-left">
                        <div className="font-medium">{pattern.name}</div>
                        <div className="text-xs opacity-70">{pattern.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
                
                <div className="pt-4 border-t border-purple-500/30">
                  <Button
                    onClick={refreshPattern}
                    variant="outline"
                    className="w-full font-patrick border-purple-500/30 text-purple-300"
                    disabled={!isUnlocked}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Generate New Pattern (Seed: {patternSeed})
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pattern Preview */}
            <Card className="bg-purple-900/20 border-purple-500/30">
              <CardHeader>
                <CardTitle className="font-patrick text-purple-200">Live Pattern Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-64 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg overflow-hidden border-2 border-dashed border-amber-600/30">
                  {isUnlocked && (
                    <CSSdoodleWrapper
                      pattern={DoodlePatterns[currentPattern as keyof typeof DoodlePatterns]}
                      seed={patternSeed}
                      className="absolute inset-0"
                      style={{ width: '100%', height: '100%' }}
                    />
                  )}
                  
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center space-y-2">
                      <h3 className="text-2xl font-bold text-amber-800 dark:text-amber-200 font-reenie transform -rotate-2">
                        Sample Chart Area
                      </h3>
                      <p className="text-amber-700 dark:text-amber-300 font-patrick">
                        {patternOptions.find(p => p.key === currentPattern)?.name}
                      </p>
                    </div>
                  </div>
                </div>
                
                {!isUnlocked && (
                  <div className="mt-4 text-center text-purple-300 text-sm font-caveat">
                    Unlock the doodle theme to see live patterns
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Handwritten Fonts Tab */}
        <TabsContent value="fonts" className="space-y-6">
          <div className="grid gap-4">
            {fontExamples.map((font, index) => (
              <Card key={index} className="bg-purple-900/20 border-purple-500/30">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-3 gap-4 items-center">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-purple-200">{font.name}</h3>
                      <p className="text-xs text-purple-300">Google Fonts</p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <p className={`text-3xl font-bold text-amber-800 dark:text-amber-200 ${font.class} ${!isUnlocked ? 'blur-sm' : ''}`} 
                         style={{ textShadow: '2px 2px 4px rgba(255, 255, 255, 0.8), 0 0 8px rgba(139, 69, 19, 0.2)' }}>
                        {font.sample}
                      </p>
                      <p className={`text-xl text-amber-700 dark:text-amber-300 mt-2 ${font.class} ${!isUnlocked ? 'blur-sm' : ''}`}
                         style={{ textShadow: '1px 1px 2px rgba(255, 255, 255, 0.7)' }}>
                        ABCDEFGHIJKLMnopqrstuvwxyz 123456789
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {!isUnlocked && (
              <div className="text-center text-purple-300 font-caveat text-lg">
                🔒 Unlock to see all handwritten fonts clearly
              </div>
            )}
          </div>
        </TabsContent>

        {/* Chart Demo Tab */}
        <TabsContent value="chart-demo" className="space-y-6">
          <Card className="bg-purple-900/20 border-purple-500/30">
            <CardHeader>
              <CardTitle className="font-patrick text-purple-200">Doodle Chart Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`chart-theme-doodle ${!isUnlocked ? 'opacity-50 pointer-events-none' : ''}`}>
                {isUnlocked && (
                  <CSSdoodleWrapper
                    pattern={DoodlePatterns.paperTexture}
                    seed={patternSeed}
                  />
                )}
                
                {/* Mock chart content */}
                <div className="relative z-10 space-y-4">
                  <h3 className="chart-title text-center text-amber-800 dark:text-amber-200">
                    Your Cosmic Birth Chart
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 chart-labels">
                    <div className="space-y-2 text-amber-700 dark:text-amber-300">
                      <p>☀️ Sun: Virgo</p>
                      <p>🌙 Moon: Sagittarius</p>
                      <p>⬆️ Rising: Pisces</p>
                    </div>
                    <div className="space-y-2 text-amber-700 dark:text-amber-300 chart-values">
                      <p>☿ Mercury: Leo</p>
                      <p>♀ Venus: Cancer</p>
                      <p>♂ Mars: Scorpio</p>
                    </div>
                  </div>

                  {/* Mock circular chart */}
                  <div className="flex justify-center">
                    <div className="w-48 h-48 border-4 border-dashed border-amber-600/50 rounded-full flex items-center justify-center relative">
                      <div className="text-center font-caveat text-amber-700 dark:text-amber-300">
                        <div className="text-3xl mb-2">✨</div>
                        <div>Zodiac Wheel</div>
                      </div>
                      
                      {/* Zodiac markers */}
                      {['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'].map((sign, i) => {
                        const angle = (i * 30) - 90;
                        const radian = (angle * Math.PI) / 180;
                        const x = Math.cos(radian) * 80;
                        const y = Math.sin(radian) * 80;
                        
                        return (
                          <div
                            key={i}
                            className="absolute font-patrick text-amber-600 dark:text-amber-400"
                            style={{
                              left: `calc(50% + ${x}px - 10px)`,
                              top: `calc(50% + ${y}px - 10px)`,
                              transform: `rotate(${Math.random() * 10 - 5}deg)`
                            }}
                          >
                            {sign}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              
              {!isUnlocked && (
                <div className="text-center mt-4">
                  <p className="text-purple-300 font-caveat text-lg">
                    🔒 Unlock the complete doodle experience for 1000 XP
                  </p>
                </div>
              )}
              
              {isUnlocked && (
                <div className="flex justify-center mt-6 space-x-4">
                  <Button
                    onClick={refreshPattern}
                    variant="outline"
                    className="font-patrick border-purple-500/30 text-purple-300"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    New Pattern
                  </Button>
                  <Button
                    variant="outline"
                    className="font-caveat border-purple-500/30 text-purple-300"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Save Chart
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}