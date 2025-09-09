import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, Sparkles, Palette } from 'lucide-react';
import CSSdoodleWrapper, { DoodlePatterns } from '@/components/css-doodle-wrapper';

interface VisualBirthChartProps {
  birthDate?: string;
  birthTime?: string;
  birthLocation?: string;
  userName?: string;
  enableDoodleTheme?: boolean;
  userXP?: number;
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
  userXP = 0
}: VisualBirthChartProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [chartData, setChartData] = useState<ChartResponse | null>(null);
  const [doodleTheme, setDoodleTheme] = useState(enableDoodleTheme);
  const { toast } = useToast();
  
  const canUseDoodle = userXP >= 1000;

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
              {canUseDoodle && (
                <Button
                  onClick={() => {
                    setDoodleTheme(!doodleTheme);
                    toast({
                      title: doodleTheme ? "Classic Theme Applied" : "Doodle Theme Applied",
                      description: doodleTheme 
                        ? "Your chart now shows in classic styling" 
                        : "Your chart now features handwritten fonts and organic styling!",
                    });
                  }}
                  variant={doodleTheme ? "default" : "outline"}
                  size="sm"
                  className={doodleTheme 
                    ? "bg-amber-600 hover:bg-amber-700 text-white font-reenie" 
                    : "border-purple-500 text-purple-300 hover:bg-purple-700"
                  }
                  data-testid="button-toggle-doodle-theme"
                >
                  <Palette className="w-4 h-4 mr-2" />
                  {doodleTheme ? "Classic" : "Doodle"}
                </Button>
              )}
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
          <div className={`relative border rounded-lg p-4 ${
            doodleTheme 
              ? 'chart-theme-doodle border-amber-600/30 bg-gradient-to-br from-amber-50/10 to-orange-50/10' 
              : 'border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-blue-900/20'
          }`}>
            {doodleTheme && canUseDoodle && (
              <CSSdoodleWrapper
                pattern={DoodlePatterns.paperTexture}
                seed={42}
                className="absolute inset-0"
                style={{ width: '100%', height: '100%', borderRadius: '8px' }}
              />
            )}
            
            <div
              className={`relative z-10 w-full flex justify-center cursor-pointer hover:opacity-80 transition-opacity ${
                doodleTheme ? 'chart-content-doodle' : ''
              }`}
              onClick={openChartInNewTab}
              dangerouslySetInnerHTML={{ __html: chartData.svgChart || '' }}
              data-testid="visual-birth-chart-display"
              title="Click to open in large view"
            />
            
            <p className={`text-xs text-center mt-2 opacity-70 relative z-10 ${
              doodleTheme ? 'text-amber-700 dark:text-amber-300 font-patrick' : 'text-purple-300'
            }`}>
              Click chart to view in full size
              {doodleTheme && canUseDoodle && ' • Handwritten Doodle Theme Active'}
            </p>
          </div>

          {/* Chart Info */}
          {chartData.chartInfo && (
            <div className={`text-xs space-y-1 ${
              doodleTheme ? 'text-amber-700 dark:text-amber-300 font-patrick' : 'text-purple-300'
            }`}>
              <p><strong>Chart Type:</strong> {chartData.chartInfo.chart_type}</p>
              <p><strong>Generated:</strong> {new Date(chartData.chartInfo.generated_at).toLocaleString()}</p>
              <p><strong>Calculation:</strong> Swiss Ephemeris professional accuracy</p>
              {doodleTheme && canUseDoodle && (
                <p className="text-amber-600 dark:text-amber-400"><strong>Theme:</strong> Handwritten Doodle Style • 1000 XP Unlocked</p>
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