import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, Sparkles } from 'lucide-react';

interface VisualBirthChartProps {
  birthDate?: string;
  birthTime?: string;
  birthLocation?: string;
  userName?: string;
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
  userName 
}: VisualBirthChartProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [chartData, setChartData] = useState<ChartResponse | null>(null);
  const { toast } = useToast();

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
          <div className="border border-purple-500/30 rounded-lg p-4 bg-gradient-to-br from-purple-900/20 to-blue-900/20">
            <div
              className="w-full flex justify-center"
              dangerouslySetInnerHTML={{ __html: chartData.svgChart || '' }}
              data-testid="visual-birth-chart-display"
            />
          </div>

          {/* Chart Info */}
          {chartData.chartInfo && (
            <div className="text-xs text-purple-300 space-y-1">
              <p><strong>Chart Type:</strong> {chartData.chartInfo.chart_type}</p>
              <p><strong>Generated:</strong> {new Date(chartData.chartInfo.generated_at).toLocaleString()}</p>
              <p><strong>Calculation:</strong> Swiss Ephemeris professional accuracy</p>
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