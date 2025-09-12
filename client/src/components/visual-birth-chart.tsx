import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, Sparkles, Palette, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CSSdoodleWrapper, { DoodlePatterns } from '@/components/css-doodle-wrapper';
import { ChartThemeSelector } from '@/components/chart-theme-selector';

interface VisualBirthChartProps {
  birthDate?: string;
  birthTime?: string;
  birthLocation?: string;
  userName?: string;
  enableDoodleTheme?: boolean;
  userXP?: number;
  onThemeChange?: (theme: string) => void;
}

interface ChartResponse {
  success: boolean;
  svgChart?: string;
  chartInfo?: any;
  cached?: boolean;
  error?: string;
}

export function VisualBirthChart({ 
  birthDate, 
  birthTime, 
  birthLocation, 
  userName,
  enableDoodleTheme = false,
  userXP = 0,
  onThemeChange
}: VisualBirthChartProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [chartData, setChartData] = useState<ChartResponse | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string>('kerykeion-default');
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const { toast } = useToast();
  
  const canUseDoodle = userXP >= 1000;
  
  // Legacy doodle theme support
  const doodleTheme = selectedTheme === 'doodle';

  const generateChart = async () => {
    if (!birthDate || !birthTime || !birthLocation) {
      toast({
        title: "Missing Birth Information",
        description: "Please provide your complete birth date, time, and location for chart generation.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/chart/visual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          birthDate,
          birthTime,
          birthLocation,
          theme: getBaseKerykeionTheme(selectedTheme),
        }),
      });

      const data: ChartResponse = await response.json();

      if (data.success && data.svgChart) {
        setChartData(data);
        toast({
          title: data.cached ? "Chart Retrieved" : "Chart Generated",
          description: data.cached 
            ? "Your existing birth chart has been loaded." 
            : "Your professional birth chart has been generated using Swiss Ephemeris calculations.",
        });
      } else {
        throw new Error(data.error || 'Failed to generate chart');
      }
    } catch (error) {
      console.error('Chart generation error:', error);
      toast({
        title: "Chart Generation Failed",
        description: "Unable to generate your birth chart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getKerykeionTheme = (themeId: string): string => {
    const themeMap: Record<string, string> = {
      'kerykeion-default': 'default',
      'kerykeion-dark': 'dark',
      'kerykeion-dark-contrast': 'dark_high_contrast'
    };
    return themeMap[themeId] || 'default';
  };

  const getBaseKerykeionTheme = (themeId: string): string => {
    // For Kerykeion themes, use the actual theme
    if (themeId.startsWith('kerykeion-')) {
      return getKerykeionTheme(themeId);
    }
    
    // For ALL custom themes (vintage, cosmic, doodle), use a neutral base
    // This ensures each custom theme starts with a fresh, consistent SVG foundation
    return 'default';
  };

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    onThemeChange?.(themeId);
    setShowThemeSelector(false);
    
    // ALWAYS clear existing chart data to force fresh regeneration for ANY theme change
    // This prevents state bleeding between different themes
    setChartData(null);
  };

  const getChartDisplayClasses = (themeId: string): string => {
    if (themeId === 'doodle') {
      return 'chart-theme-doodle border-amber-600/30 bg-gradient-to-br from-amber-50/10 to-orange-50/10';
    }
    if (themeId.startsWith('vintage-')) {
      return 'chart-theme-vintage border-amber-600/30';
    }
    if (themeId.startsWith('cosmic-')) {
      return 'chart-theme-cosmic border-purple-500/30';
    }
    return 'border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-blue-900/20';
  };

  const getVintageThemeClass = (themeId: string): string => {
    const themeMap: Record<string, string> = {
      'vintage-art-deco': 'theme-art-deco',
      'vintage-victorian': 'theme-victorian',
      'vintage-mid-century': 'theme-midcentury',
      'vintage-classic': 'theme-classic'
    };
    return themeMap[themeId] || '';
  };

  const getCosmicThemeClass = (themeId: string): string => {
    const themeMap: Record<string, string> = {
      'cosmic-deep-space': 'theme-deep-space',
      'cosmic-nebula': 'theme-nebula',
      'cosmic-galaxy': 'theme-galaxy',
      'cosmic-solar-system': 'theme-solar-system'
    };
    return themeMap[themeId] || '';
  };

  const getChartContentClasses = (themeId: string): string => {
    if (themeId === 'doodle') return 'chart-content-doodle';
    if (themeId.startsWith('vintage-')) return 'font-playfair';
    if (themeId.startsWith('cosmic-')) return 'font-orbitron';
    return '';
  };

  const getChartTextClasses = (themeId: string): string => {
    if (themeId === 'doodle') return 'text-amber-700 dark:text-amber-300 font-patrick';
    if (themeId.startsWith('vintage-')) return 'text-amber-700 dark:text-amber-300 font-playfair';
    if (themeId.startsWith('cosmic-')) return 'text-purple-300 font-exo';
    return 'text-purple-300';
  };

  const getThemeAccentClass = (themeId: string): string => {
    if (themeId === 'doodle') return 'text-amber-600 dark:text-amber-400';
    if (themeId.startsWith('vintage-')) return 'text-amber-600 dark:text-amber-400';
    if (themeId.startsWith('cosmic-')) return 'text-purple-400 dark:text-purple-300';
    return 'text-purple-400';
  };

  const getThemeName = (themeId: string): string => {
    const themeNames: Record<string, string> = {
      'kerykeion-default': 'Classic Professional',
      'kerykeion-dark': 'Dark Professional',
      'kerykeion-dark-contrast': 'High Contrast Dark',
      'doodle': 'Handwritten Doodle',
      'vintage-art-deco': 'Art Deco 1920s',
      'vintage-victorian': 'Victorian Era',
      'vintage-mid-century': 'Mid-Century Modern',
      'vintage-classic': 'Classic Elegance',
      'cosmic-deep-space': 'Deep Space',
      'cosmic-nebula': 'Nebula',
      'cosmic-galaxy': 'Galaxy',
      'cosmic-solar-system': 'Solar System'
    };
    return themeNames[themeId] || 'Unknown Theme';
  };

  const getThemeXPRequirement = (themeId: string): string => {
    const xpMap: Record<string, string> = {
      'kerykeion-default': 'Free',
      'kerykeion-dark': 'Free',
      'kerykeion-dark-contrast': 'Free',
      'doodle': '1000',
      'vintage-art-deco': '2500',
      'vintage-victorian': '5000',
      'vintage-mid-century': '3500',
      'vintage-classic': '7500',
      'cosmic-deep-space': '5000',
      'cosmic-nebula': '7500',
      'cosmic-galaxy': '10000',
      'cosmic-solar-system': '12500'
    };
    return xpMap[themeId] || 'Unknown';
  };

  const downloadChart = () => {
    if (!chartData?.svgChart) return;

    const blob = new Blob([chartData.svgChart], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `birth-chart-${userName || 'chart'}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Chart Downloaded",
      description: "Your birth chart has been saved as an SVG file.",
    });
  };

  const openChartInNewTab = () => {
    if (!chartData?.svgChart) return;

    const blob = new Blob([chartData.svgChart], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank');
    
    if (newWindow) {
      newWindow.document.title = `Birth Chart - ${userName || 'Chart'}`;
      // Clean up the URL after a delay to allow the new window to load
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    toast({
      title: "Chart Opened",
      description: "Your birth chart has been opened in a new tab for better viewing.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-purple-200">Visual Birth Chart</h3>
          <p className="text-sm text-purple-300 mt-1">
            {userName}'s Cosmic Birth Chart using Swiss Ephemeris calculations
          </p>
        </div>
        
        {!chartData && (
          <Button
            onClick={generateChart}
            disabled={isGenerating || !birthDate || !birthTime || !birthLocation}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            data-testid="button-generate-visual-chart"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Consulting the stars...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Visual Chart
              </>
            )}
          </Button>
        )}
      </div>

      {chartData && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-purple-300">
                {chartData.cached ? 'Retrieved from storage' : 'Freshly generated'}
              </span>
            </div>
            
            <div className="flex space-x-2">
              <Dialog open={showThemeSelector} onOpenChange={setShowThemeSelector}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-purple-500 text-purple-300 hover:bg-purple-700"
                    data-testid="button-chart-theme-selector"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Chart Themes
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Chart Theme Selection</DialogTitle>
                  </DialogHeader>
                  <ChartThemeSelector 
                    userXP={userXP}
                    currentTheme={selectedTheme}
                    onThemeSelect={handleThemeSelect}
                  />
                </DialogContent>
              </Dialog>
              <Button
                onClick={openChartInNewTab}
                variant="outline"
                size="sm"
                className="border-purple-500 text-purple-300 hover:bg-purple-700"
                data-testid="button-open-chart-tab"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open Large View
              </Button>
              <Button
                onClick={downloadChart}
                variant="outline"
                size="sm"
                className="border-purple-500 text-purple-300 hover:bg-purple-700"
                data-testid="button-download-chart"
              >
                <Download className="w-4 h-4 mr-2" />
                Download SVG
              </Button>
              <Button
                onClick={() => setChartData(null)}
                variant="outline"
                size="sm"
                className="border-purple-500 text-purple-300 hover:bg-purple-700"
                data-testid="button-regenerate-chart"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            </div>
          </div>

          {/* Chart Display */}
          <div className={`relative border rounded-lg p-4 chart-container ${
            getChartDisplayClasses(selectedTheme)
          } ${getVintageThemeClass(selectedTheme)} ${getCosmicThemeClass(selectedTheme)}`}>
            {selectedTheme === 'doodle' && canUseDoodle && (
              <CSSdoodleWrapper
                pattern={DoodlePatterns.paperTexture}
                seed={42}
                className="absolute inset-0"
                style={{ width: '100%', height: '100%', borderRadius: '8px' }}
              />
            )}
            
            {/* Additional theme overlays for vintage and cosmic themes */}
            {selectedTheme.startsWith('vintage-') && (
              <div className={`absolute inset-0 ${getVintageThemeClass(selectedTheme)} opacity-20 pointer-events-none`} />
            )}
            
            {selectedTheme.startsWith('cosmic-') && (
              <div className={`absolute inset-0 ${getCosmicThemeClass(selectedTheme)} pointer-events-none`} />
            )}
            
            <div
              className={`relative z-10 w-full flex justify-center cursor-pointer hover:opacity-80 transition-opacity ${
                getChartContentClasses(selectedTheme)
              }`}
              onClick={openChartInNewTab}
              dangerouslySetInnerHTML={{ 
                __html: chartData.svgChart?.replace('<svg', '<svg class="chart-svg"') || '' 
              }}
              data-testid="visual-birth-chart-display"
              title="Click to open in large view"
            />
            
            <p className={`text-xs text-center mt-2 opacity-70 relative z-10 ${
              getChartTextClasses(selectedTheme)
            }`}>
              Click chart to view in full size
              {selectedTheme !== 'kerykeion-default' && ` • ${getThemeName(selectedTheme)} Theme Active`}
            </p>
          </div>

          {/* Chart Info */}
          {chartData.chartInfo && (
            <div className={`text-xs space-y-1 ${
              getChartTextClasses(selectedTheme)
            }`}>
              <p><strong>Chart Type:</strong> {chartData.chartInfo.chart_type}</p>
              <p><strong>Generated:</strong> {new Date(chartData.chartInfo.generated_at).toLocaleString()}</p>
              <p><strong>Calculation:</strong> Swiss Ephemeris professional accuracy</p>
              {selectedTheme !== 'kerykeion-default' && (
                <p className={getThemeAccentClass(selectedTheme)}>
                  <strong>Theme:</strong> {getThemeName(selectedTheme)} • {getThemeXPRequirement(selectedTheme)} XP
                </p>
              )}
            </div>
          )}
          
          {/* XP Requirement Message */}
          {!canUseDoodle && (
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-amber-700 dark:text-amber-300 text-sm font-caveat">
                🔒 Unlock the beautiful handwritten doodle theme for your birth charts at 1000 XP • Current XP: {userXP}
              </p>
            </div>
          )}
        </div>
      )}

      {!birthDate || !birthTime || !birthLocation ? (
        <div className="text-center p-6 border border-purple-500/30 rounded-lg bg-purple-900/10">
          <Sparkles className="w-8 h-8 mx-auto mb-3 text-purple-400 opacity-50" />
          <p className="text-purple-300 text-sm">
            Complete birth information required to generate your professional birth chart
          </p>
        </div>
      ) : null}
    </div>
  );
}