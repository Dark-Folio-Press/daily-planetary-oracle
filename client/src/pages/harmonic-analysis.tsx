import { useState, useRef } from "react";
import { Upload, Waves, Music, Play, Pause, AlertCircle, Crown, TrendingUp, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface HarmonicAnalysisResult {
  overallScore: number;
  correlations: Array<{
    aspect: string;
    musicalInterval: string;
    harmonicRatio: number;
    ratioString: string;
    matchStrength: number;
    resonanceType: string;
    explanation: string;
  }>;
  dominantCorrelations: Array<{
    aspect: string;
    musicalInterval: string;
    matchStrength: number;
    explanation: string;
  }>;
  chartResonance: {
    elementalAlignment: number;
    aspectAlignment: number;
    energyAlignment: number;
  };
  musicalFeatures: {
    key?: string;
    tempo?: number;
    brightness: number;
    energy: number;
    harmonicComplexity: number;
  };
  harmonicInsights: string[];
  recommendationReason: string;
  analysisTimestamp: string;
  filename: string;
}

export default function HarmonicAnalysisPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<HarmonicAnalysisResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Check if user has paid access
  const hasPaidAccess = user?.subscriptionTier === 'paid' || user?.subscriptionTier === 'premium';

  const analyzeAudioMutation = useMutation({
    mutationFn: async (file: File): Promise<HarmonicAnalysisResult> => {
      const formData = new FormData();
      formData.append('audio', file);
      
      // Mock progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      try {
        const response = await fetch('/api/analyze-audio', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Analysis failed');
        }
        
        const result = await response.json();
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        return result;
      } catch (error) {
        clearInterval(progressInterval);
        setUploadProgress(0);
        throw error;
      }
    },
    onSuccess: (result: HarmonicAnalysisResult) => {
      setAnalysisResult(result);
      setUploadProgress(0);
      toast({
        title: "Analysis Complete! ✨",
        description: `Found ${result.correlations.length} harmonic correlations with ${(result.overallScore * 100).toFixed(0)}% cosmic alignment.`,
      });
    },
    onError: (error) => {
      setUploadProgress(0);
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your audio file. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/m4a'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an MP3, WAV, OGG, or M4A audio file.",
          variant: "destructive",
        });
        return;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = () => {
    if (!hasPaidAccess) {
      toast({
        title: "Premium Feature",
        description: "Audio upload analysis requires a paid subscription. Please upgrade your account.",
        variant: "destructive",
      });
      return;
    }

    if (selectedFile) {
      analyzeAudioMutation.mutate(selectedFile);
    }
  };

  const handlePlayPreview = () => {
    if (!selectedFile) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    const audio = new Audio(URL.createObjectURL(selectedFile));
    audioRef.current = audio;
    
    audio.onended = () => setIsPlaying(false);
    audio.onpause = () => setIsPlaying(false);
    
    audio.play();
    setIsPlaying(true);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center">
          <div className="mb-4">
            <Waves className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">Sign In Required</h2>
            <p className="text-gray-600 mt-2">Please sign in to access the harmonic analysis tool.</p>
          </div>
          <Button onClick={() => window.location.href = '/login'} className="w-full">
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Waves className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Harmonic Analysis Studio</h1>
            {hasPaidAccess && <Crown className="w-6 h-6 text-yellow-500" />}
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload your own audio files to discover their harmonic correlations with your astrological chart.
            Analyze the cosmic frequencies hidden within your favorite songs.
          </p>
        </div>

        {/* Premium Access Notice */}
        {!hasPaidAccess && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <Crown className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <div className="flex items-center justify-between">
                <span>Audio upload analysis is a premium feature. Upgrade to unlock unlimited harmonic analysis of your own music collection.</span>
                <Button size="sm" variant="outline" className="ml-4">
                  Upgrade Now
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Section */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="hidden"
                data-testid="input-audio-file"
              />
              
              {!selectedFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-purple-400 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Choose Audio File</h3>
                  <p className="text-gray-600 mb-4">Upload MP3, WAV, OGG, or M4A files (max 10MB)</p>
                  <Button 
                    onClick={handleUploadClick}
                    variant="outline"
                    disabled={!hasPaidAccess}
                    data-testid="button-choose-file"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <Music className="w-6 h-6 text-purple-600" />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-600">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      onClick={handlePlayPreview}
                      variant="ghost"
                      size="sm"
                      data-testid="button-preview-audio"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </div>
                  
                  {analyzeAudioMutation.isPending && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Analyzing harmonic frequencies...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="w-full" />
                    </div>
                  )}
                  
                  <div className="flex space-x-3">
                    <Button
                      onClick={handleAnalyze}
                      disabled={!hasPaidAccess || analyzeAudioMutation.isPending}
                      className="flex-1"
                      data-testid="button-analyze-audio"
                    >
                      <Waves className="w-4 h-4 mr-2" />
                      {analyzeAudioMutation.isPending ? 'Analyzing...' : 'Analyze Harmonics'}
                    </Button>
                    <Button
                      onClick={() => setSelectedFile(null)}
                      variant="outline"
                      data-testid="button-clear-file"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Analysis Results */}
        {analysisResult && (
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span>Analysis Results</span>
                </h3>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">
                    {(analysisResult.overallScore * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600">Cosmic Alignment</div>
                </div>
              </div>

              {/* Overall Insights */}
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                <p className="text-gray-800 font-medium mb-2">{analysisResult.recommendationReason}</p>
                <p className="text-sm text-gray-600">
                  Analysis completed on {new Date(analysisResult.analysisTimestamp).toLocaleString()}
                </p>
              </div>

              {/* Chart Resonance */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {(analysisResult.chartResonance.elementalAlignment * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-red-700">Elemental Alignment</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {(analysisResult.chartResonance.aspectAlignment * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-blue-700">Aspect Alignment</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {(analysisResult.chartResonance.energyAlignment * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-green-700">Energy Alignment</div>
                </div>
              </div>

              {/* Musical Features */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Musical Analysis</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {analysisResult.musicalFeatures.key && (
                    <div>
                      <span className="text-gray-600">Key:</span> <span className="font-medium">{analysisResult.musicalFeatures.key}</span>
                    </div>
                  )}
                  {analysisResult.musicalFeatures.tempo && (
                    <div>
                      <span className="text-gray-600">Tempo:</span> <span className="font-medium">{Math.round(analysisResult.musicalFeatures.tempo)} BPM</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Brightness:</span> <span className="font-medium">{(analysisResult.musicalFeatures.brightness * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Energy:</span> <span className="font-medium">{(analysisResult.musicalFeatures.energy * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              {/* Harmonic Correlations */}
              {analysisResult.correlations.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Harmonic Correlations</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {analysisResult.correlations.map((correlation, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900">
                            {correlation.aspect} → {correlation.musicalInterval}
                          </div>
                          <div className="text-xs text-gray-600">
                            Ratio: {correlation.ratioString} • {correlation.resonanceType}
                          </div>
                          <div className="text-xs text-gray-700 mt-1">
                            {correlation.explanation}
                          </div>
                        </div>
                        <div className="text-sm font-medium text-purple-600">
                          {(correlation.matchStrength * 100).toFixed(0)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Harmonic Insights */}
              {analysisResult.harmonicInsights.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Cosmic Insights</h4>
                  <div className="space-y-2">
                    {analysisResult.harmonicInsights.map((insight, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                        <Info className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}