import { Play, Music2, ExternalLink, User, Pause, MessageSquare, Waves, TrendingUp, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ShareButton from "@/components/share-button";
import { SpotifyExportButton } from "@/components/spotify-export-button";
import { StarRating } from "@/components/star-rating";
import ContentFeedback from "@/components/content-feedback";
import { useState, useRef, useEffect } from "react";

interface HarmonicCorrelationData {
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
  analysisTimestamp?: string;
  previewUrl?: string;
}

interface Song {
  title: string;
  artist: string;
  day: string;
  dayOfWeek: string;
  astrologicalInfluence: string;
  spotifyId?: string;
  externalUrl?: string;
  previewUrl?: string;
  rating?: number;
  harmonicCorrelation?: HarmonicCorrelationData;
  source?: string;
}

interface PlaylistCardProps {
  playlist: {
    name: string;
    description?: string;
    songs: Song[];
    weekStart: string;
    weekEnd: string;
    overallHarmonicScore?: number;
    harmonicsAnalyzed?: number;
    harmonicInsights?: string[];
  };
  sessionId?: string;
}

const dayColors = {
  'MON': 'bg-red-100 text-red-600',
  'TUE': 'bg-orange-100 text-orange-600',
  'WED': 'bg-green-100 text-green-600',
  'THU': 'bg-blue-100 text-blue-600',
  'FRI': 'bg-indigo-100 text-indigo-600',
  'SAT': 'bg-purple-100 text-purple-600',
  'SUN': 'bg-yellow-100 text-yellow-600',
};

export default function PlaylistCard({ playlist, sessionId }: PlaylistCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handlePlayPreview = async (song: Song, index: number) => {
    try {
      // Stop current audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // If clicking the same song that's playing, just stop
      if (playingIndex === index) {
        setPlayingIndex(null);
        return;
      }

      // Check if we have a preview URL
      if (!song.previewUrl) {
        // If no preview URL but we have a Spotify ID, try to get preview from Spotify
        if (song.spotifyId) {
          toast({
            title: "Preview not available",
            description: "This track doesn't have a preview available. Try opening it in Spotify!",
            variant: "default",
          });
          return;
        }
        toast({
          title: "Preview not available",
          description: "No preview available for this track",
          variant: "default",
        });
        return;
      }

      // Create and play audio
      const audio = new Audio(song.previewUrl);
      audioRef.current = audio;
      
      audio.addEventListener('ended', () => {
        setPlayingIndex(null);
        audioRef.current = null;
      });
      
      audio.addEventListener('error', () => {
        toast({
          title: "Playback failed",
          description: "Unable to play preview",
          variant: "destructive",
        });
        setPlayingIndex(null);
        audioRef.current = null;
      });

      setPlayingIndex(index);
      await audio.play();
      
      toast({
        title: "🎵 Playing preview",
        description: `"${song.title}" by ${song.artist}`,
      });
      
    } catch (error) {
      console.error('Audio playback error:', error);
      toast({
        title: "Playback failed",
        description: "Unable to play preview",
        variant: "destructive",
      });
      setPlayingIndex(null);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <Card className="bg-background border-border shadow-sm overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group">
      {/* Playlist Header */}
      <div className="cosmic-gradient p-4 border-b border-border relative">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-lg">{playlist.name}</h3>
            <p className="text-sm text-muted-foreground">
              7 songs • {formatDate(playlist.weekStart)} - {formatDate(playlist.weekEnd)}
            </p>
            {/* Harmonic Score Display */}
            {playlist.overallHarmonicScore !== undefined && (
              <div className="mt-2 flex items-center space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-1 bg-white/10 rounded-full px-2 py-1">
                        <Waves className="w-3 h-3 text-purple-200" />
                        <span className="text-xs font-medium text-purple-100">
                          {(playlist.overallHarmonicScore * 100).toFixed(0)}% cosmic alignment
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <p className="text-sm">
                        Harmonic correlation between your astrological chart and this playlist's musical frequencies.
                        {playlist.harmonicsAnalyzed && ` Analyzed ${playlist.harmonicsAnalyzed} songs.`}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {/* Harmonic Insights Button */}
            {playlist.harmonicInsights && playlist.harmonicInsights.length > 0 && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                    data-testid="button-harmonic-insights"
                  >
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Insights
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                      <Waves className="w-5 h-5 text-purple-600" />
                      <span>Harmonic Correlations</span>
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {playlist.harmonicInsights.map((insight, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                        <Info className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{insight}</p>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative">
              <Music2 className="w-6 h-6 text-white" />
              <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Track List */}
      <div className="divide-y divide-border">
        {playlist.songs.map((song, index) => (
          <div key={index} className="p-4 hover:bg-muted/50 transition-all duration-200 hover:scale-[1.01] group/song">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover/song:scale-110 ${dayColors[song.dayOfWeek as keyof typeof dayColors] || 'bg-gray-100 text-gray-600'}`}>
                <span className="text-xs font-semibold">{song.dayOfWeek}</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">"{song.title}" by {song.artist}</p>
                <p className="text-xs text-muted-foreground">{song.astrologicalInfluence}</p>
                
                {/* Harmonic Correlation Display */}
                {song.harmonicCorrelation && (
                  <div className="mt-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center space-x-1">
                              <Waves className="w-3 h-3 text-purple-500" />
                              <span className="text-xs font-medium text-purple-600">
                                {(song.harmonicCorrelation.overallScore * 100).toFixed(0)}% alignment
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-sm">
                            <div className="space-y-1">
                              <p className="text-sm font-medium">{song.harmonicCorrelation.recommendationReason}</p>
                              {song.harmonicCorrelation.dominantCorrelations.length > 0 && (
                                <p className="text-xs text-gray-600">
                                  Top correlation: {song.harmonicCorrelation.dominantCorrelations[0].aspect} → {song.harmonicCorrelation.dominantCorrelations[0].musicalInterval}
                                </p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      {/* Musical Features */}
                      {song.harmonicCorrelation.musicalFeatures.key && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                          Key: {song.harmonicCorrelation.musicalFeatures.key}
                        </span>
                      )}
                      {song.harmonicCorrelation.musicalFeatures.tempo && (
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                          {Math.round(song.harmonicCorrelation.musicalFeatures.tempo)} BPM
                        </span>
                      )}
                    </div>
                    
                    {/* Detailed Harmonic Info Button */}
                    {song.harmonicCorrelation.correlations.length > 0 && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-xs h-6 px-2 text-purple-600 hover:bg-purple-50"
                            data-testid={`button-harmonic-details-${index}`}
                          >
                            <Info className="w-3 h-3 mr-1" />
                            View Correlations
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2">
                              <Waves className="w-5 h-5 text-purple-600" />
                              <span>"{song.title}" - Harmonic Analysis</span>
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            {/* Overall Score */}
                            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-900">Cosmic Alignment Score</h4>
                                <span className="text-2xl font-bold text-purple-600">
                                  {(song.harmonicCorrelation.overallScore * 100).toFixed(0)}%
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{song.harmonicCorrelation.recommendationReason}</p>
                            </div>
                            
                            {/* Chart Resonance */}
                            <div className="grid grid-cols-3 gap-4">
                              <div className="text-center p-3 bg-red-50 rounded-lg">
                                <div className="text-lg font-semibold text-red-600">
                                  {(song.harmonicCorrelation.chartResonance.elementalAlignment * 100).toFixed(0)}%
                                </div>
                                <div className="text-xs text-red-700">Elemental Alignment</div>
                              </div>
                              <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <div className="text-lg font-semibold text-blue-600">
                                  {(song.harmonicCorrelation.chartResonance.aspectAlignment * 100).toFixed(0)}%
                                </div>
                                <div className="text-xs text-blue-700">Aspect Alignment</div>
                              </div>
                              <div className="text-center p-3 bg-green-50 rounded-lg">
                                <div className="text-lg font-semibold text-green-600">
                                  {(song.harmonicCorrelation.chartResonance.energyAlignment * 100).toFixed(0)}%
                                </div>
                                <div className="text-xs text-green-700">Energy Alignment</div>
                              </div>
                            </div>
                            
                            {/* Specific Correlations */}
                            {song.harmonicCorrelation.correlations.length > 0 && (
                              <div>
                                <h4 className="font-medium text-gray-900 mb-3">Harmonic Correlations</h4>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                  {song.harmonicCorrelation.correlations.map((correlation, corrIndex) => (
                                    <div key={corrIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                            
                            {/* Musical Features */}
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-2">Musical Analysis</h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                {song.harmonicCorrelation.musicalFeatures.key && (
                                  <div>
                                    <span className="text-gray-600">Key:</span> {song.harmonicCorrelation.musicalFeatures.key}
                                  </div>
                                )}
                                {song.harmonicCorrelation.musicalFeatures.tempo && (
                                  <div>
                                    <span className="text-gray-600">Tempo:</span> {Math.round(song.harmonicCorrelation.musicalFeatures.tempo)} BPM
                                  </div>
                                )}
                                <div>
                                  <span className="text-gray-600">Brightness:</span> {(song.harmonicCorrelation.musicalFeatures.brightness * 100).toFixed(0)}%
                                </div>
                                <div>
                                  <span className="text-gray-600">Energy:</span> {(song.harmonicCorrelation.musicalFeatures.energy * 100).toFixed(0)}%
                                </div>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                )}
                
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">Rating:</span>
                  <StarRating 
                    value={song.rating || Math.floor(Math.random() * 2) + 4} // 4-5 stars for cosmic quality
                    size="sm"
                    readonly={true}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {song.externalUrl && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => window.open(song.externalUrl, '_blank')}
                    className="hover:scale-110 transition-transform duration-200"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handlePlayPreview(song, index)}
                  className={`hover:scale-110 transition-all duration-200 ${
                    playingIndex === index ? 'bg-purple-100 text-purple-600 hover:bg-purple-200' : ''
                  }`}
                  title={playingIndex === index ? 'Stop preview' : 'Play preview'}
                >
                  {playingIndex === index ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Export and Share Options */}
      <div className="p-4 bg-muted/30 border-t border-border">
        <p className="text-sm font-medium text-foreground mb-3">Export and share:</p>
        <div className="flex gap-2 justify-center">
          {sessionId && (
            <SpotifyExportButton 
              sessionId={sessionId}
              playlistName={playlist.name}
            />
          )}
          {sessionId && (
            <ShareButton 
              type="playlist" 
              sessionId={sessionId} 
              variant="outline" 
              size="sm" 
            />
          )}
          {user && (
            <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-purple-600 border-purple-200 hover:bg-purple-50"
                  data-testid="button-feedback-playlist"
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Feedback
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto [&>button]:opacity-100 [&>button]:bg-gray-100 [&>button]:hover:bg-gray-200 [&>button]:border [&>button]:border-gray-300">
                <DialogHeader>
                  <DialogTitle>Rate this playlist</DialogTitle>
                </DialogHeader>
                <ContentFeedback 
                  contentType="playlist"
                  contentId={sessionId}
                  onClose={() => setShowFeedback(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </Card>
  );
}
