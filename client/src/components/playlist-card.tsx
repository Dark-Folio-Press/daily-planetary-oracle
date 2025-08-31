import { Play, Music2, ExternalLink, User, Pause, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ShareButton from "@/components/share-button";
import { SpotifyExportButton } from "@/components/spotify-export-button";
import { StarRating } from "@/components/star-rating";
import ContentFeedback from "@/components/content-feedback";
import { useState, useRef, useEffect } from "react";

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
}

interface PlaylistCardProps {
  playlist: {
    name: string;
    description?: string;
    songs: Song[];
    weekStart: string;
    weekEnd: string;
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
          <div>
            <h3 className="font-semibold text-foreground text-lg">{playlist.name}</h3>
            <p className="text-sm text-muted-foreground">
              7 songs • {formatDate(playlist.weekStart)} - {formatDate(playlist.weekEnd)}
            </p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative">
            <Music2 className="w-6 h-6 text-white" />
            <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300"></div>
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
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
