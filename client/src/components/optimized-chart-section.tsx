import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  ChevronDown, 
  ChevronUp, 
  Star, 
  Download, 
  Share2, 
  FileImage, 
  FileText,
  Loader2,
  Eye,
  Sparkles
} from 'lucide-react';
import { VisualBirthChart } from './visual-birth-chart';
import { HousesChart } from './houses-chart';
import { SignupPrompt } from './signup-prompt';
import { useAuth } from '@/hooks/useAuth';

interface OptimizedChartSectionProps {
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  userName?: string;
}

interface CachedChartData {
  visualChart?: {
    svgChart: string;
    chartInfo: any;
    cached: boolean;
  };
  houseData?: {
    houses: any;
    cached: boolean;
  };
}

export function OptimizedChartSection({ 
  birthDate, 
  birthTime, 
  birthLocation, 
  userName 
}: OptimizedChartSectionProps) {
  const [showCharts, setShowCharts] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  // Cache key for this specific birth data
  const cacheKey = `chart-data-${birthDate}-${birthTime}-${birthLocation}`;

  // Fetch cached chart data
  const { data: cachedChartData } = useQuery<CachedChartData>({
    queryKey: [cacheKey],
    enabled: false, // Don't fetch automatically
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 7 * 24 * 60 * 60 * 1000, // Keep for 7 days
  });

  // Generate and cache visual chart
  const generateVisualChart = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/chart/visual', {
        birthDate,
        birthTime,
        birthLocation
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Cache the visual chart data
      queryClient.setQueryData([cacheKey], (prev: CachedChartData | undefined) => ({
        ...prev,
        visualChart: data
      }));
    }
  });

  // Generate and cache house data
  const generateHouseData = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/chart/houses', {
        birthDate,
        birthTime,
        birthLocation
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Cache the house data
      queryClient.setQueryData([cacheKey], (prev: CachedChartData | undefined) => ({
        ...prev,
        houseData: data
      }));
    }
  });

  // Download chart as SVG
  const downloadSVG = useCallback(async () => {
    try {
      let svgContent = cachedChartData?.visualChart?.svgChart;
      
      if (!svgContent) {
        toast({
          title: "Generating Chart",
          description: "Creating your birth chart for download...",
        });
        
        const result = await generateVisualChart.mutateAsync();
        svgContent = result.svgChart;
      }

      if (svgContent) {
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${userName || 'birth-chart'}-${birthDate}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Chart Downloaded",
          description: "Your birth chart SVG has been saved to your downloads.",
        });
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download chart. Please try again.",
        variant: "destructive",
      });
    }
  }, [cachedChartData, generateVisualChart, userName, birthDate, toast]);

  // Download chart as PDF
  const downloadPDF = useCallback(async () => {
    try {
      toast({
        title: "Generating PDF",
        description: "Creating your chart PDF for download...",
      });

      // Create a comprehensive chart PDF with both visual and house data
      const response = await fetch('/api/chart/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate,
          birthTime,
          birthLocation,
          userName: userName || 'Birth Chart',
          includeHouses: true
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${userName || 'birth-chart'}-${birthDate}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "PDF Downloaded",
          description: "Your comprehensive chart PDF has been saved.",
        });
      } else {
        throw new Error('PDF generation failed');
      }
    } catch (error) {
      toast({
        title: "PDF Download Failed",
        description: "Unable to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  }, [birthDate, birthTime, birthLocation, userName, toast]);

  // Share chart data
  const shareChart = useCallback(async () => {
    try {
      const shareUrl = `${window.location.origin}/chart-share?date=${birthDate}&time=${birthTime}&location=${encodeURIComponent(birthLocation)}&name=${encodeURIComponent(userName || 'Chart')}`;
      
      if (navigator.share) {
        await navigator.share({
          title: `${userName || 'Astrological'} Birth Chart`,
          text: `Check out this personalized birth chart created with cosmic insights!`,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied",
          description: "Chart share link has been copied to your clipboard.",
        });
      }
    } catch (error) {
      toast({
        title: "Sharing Failed",
        description: "Unable to share chart. Please try again.",
        variant: "destructive",
      });
    }
  }, [birthDate, birthTime, birthLocation, userName, toast]);

  const loadChartData = useCallback(async () => {
    if (showCharts) {
      setShowCharts(false);
      return;
    }

    setShowCharts(true);

    // Check if we have cached data, if not, generate it
    if (!cachedChartData?.visualChart) {
      generateVisualChart.mutate();
    }
    
    if (!cachedChartData?.houseData) {
      generateHouseData.mutate();
    }
  }, [showCharts, cachedChartData, generateVisualChart, generateHouseData]);

  const isLoading = generateVisualChart.isPending || generateHouseData.isPending;
  const hasAnyData = cachedChartData?.visualChart || cachedChartData?.houseData;

  return (
    <div className="mt-6 pt-6 border-t border-purple-500/20">
      {/* Collapsed Header */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">Birth Charts & Analysis</h3>
              <p className="text-sm text-muted-foreground">
                {hasAnyData ? 'Cached data available • Click to reveal' : 'Click to generate your personalized charts'}
                {showCharts && ' • Data usage optimized'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Share and Download Menu */}
            {(showCharts || hasAnyData) && (
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="bg-purple-600/20 hover:bg-purple-500/30 border-purple-500/30"
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  Share & Export
                </Button>
                
                {showShareMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-50">
                    <div className="p-2 space-y-1">
                      <Button
                        variant="ghost"
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => {
                          shareChart();
                          setShowShareMenu(false);
                        }}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Link
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          downloadSVG();
                          setShowShareMenu(false);
                        }}
                      >
                        <FileImage className="w-4 h-4 mr-2" />
                        Download SVG
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          downloadPDF();
                          setShowShareMenu(false);
                        }}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Main Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={loadChartData}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-500/30 hover:to-pink-500/30 border-purple-500/30"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : showCharts ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Hide Charts
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  {hasAnyData ? 'Reveal Charts' : 'Generate Charts'}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Expanded Chart Section */}
        {showCharts && (
          <div className="mt-6 pt-6 border-t border-purple-500/20 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Visual Birth Chart */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-foreground flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
                  Visual Birth Chart
                </h4>
                <div className="bg-white/5 rounded-xl p-4">
                  <VisualBirthChart
                    birthDate={birthDate}
                    birthTime={birthTime}
                    birthLocation={birthLocation}
                    userName={userName}
                  />
                </div>
              </div>

              {/* Astrological Houses */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-foreground flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-pink-400" />
                  Astrological Houses
                </h4>
                <div className="bg-white/5 rounded-xl p-4">
                  <HousesChart
                    birthDate={birthDate}
                    birthTime={birthTime}
                    birthLocation={birthLocation}
                    userName={userName}
                  />
                </div>
              </div>
            </div>
            
            {/* Signup prompt for guest users after chart viewing */}
            {!isAuthenticated && (
              <div className="pt-6">
                <SignupPrompt feature="chart" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Click outside to close share menu */}
      {showShareMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowShareMenu(false)}
        />
      )}
    </div>
  );
}