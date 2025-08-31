import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, Sparkles, Play, RefreshCw, Calendar, Star, ExternalLink } from "lucide-react";
import { AddToJournalButton } from "@/components/add-to-journal-button";

interface TrackRecommendation {
  artist: string;
  title: string;
  genre: string;
  astrologyReasoning: string;
  mood: string;
  energy: "high" | "medium" | "low";
}

interface CosmicPlaylist {
  id: string;
  title: string;
  description: string;
  mood: string;
  genres: string[];
  tracks: TrackRecommendation[];
  astrologyContext: string;
  planetaryInfluence: string;
  generatedAt: string;
  validUntil?: string;
  spotifyUrl?: string;
}

export default function CosmicPlaylist() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTrack, setSelectedTrack] = useState<TrackRecommendation | null>(null);

  // Check Spotify connection status
  const { data: spotifyStatus } = useQuery({
    queryKey: ["/api/spotify/status"],
    retry: false,
  });

  // Connect to Spotify
  const connectSpotify = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/spotify/auth");
      return response.json();
    },
    onSuccess: (data) => {
      window.location.href = data.authUrl;
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to connect to Spotify. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Export to Spotify
  const exportToSpotify = useMutation({
    mutationFn: async (playlistId: string) => {
      const response = await apiRequest("POST", "/api/spotify/export-playlist", {
        playlistId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Playlist Exported to Spotify!",
        description: `"${data.playlistName}" created with ${data.foundTracks}/${data.totalTracks} tracks. The journal entry will now include your Spotify link!`,
      });
      
      // Refresh the playlist data to get the updated Spotify URL
      queryClient.invalidateQueries({ queryKey: ["/api/cosmic-playlist/daily"] });
      setTimeout(() => {
        refetch();
      }, 500); // Small delay to ensure database update is complete
      
      // Open the Spotify playlist in a new tab
      if (data.spotifyUrl) {
        setTimeout(() => {
          window.open(data.spotifyUrl, '_blank');
        }, 1000); // Small delay to show the toast first
      }
    },
    onError: (error) => {
      console.log("Spotify export error:", error);
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      // Check if it's a Spotify authentication issue
      if (error.message?.includes("Spotify authentication expired") || error.message?.includes("requiresReauth")) {
        toast({
          title: "Spotify Connection Expired",
          description: "Please reconnect to Spotify to export your playlist.",
          variant: "destructive",
        });
        // Trigger Spotify reconnection
        setTimeout(() => {
          connectSpotify.mutate();
        }, 1000);
        return;
      }
      
      toast({
        title: "Export Failed", 
        description: error.message || "Failed to export playlist to Spotify. Please try reconnecting to Spotify.",
        variant: "destructive",
      });
    },
  });

  const { data: playlist, isLoading, refetch } = useQuery({
    queryKey: ["/api/cosmic-playlist/daily"],
    enabled: !!user,
  });

  const generatePlaylist = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/cosmic-playlist/generate");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cosmic-playlist/daily"] });
      toast({
        title: "Cosmic Playlist Generated!",
        description: "Your personalized cosmic playlist is ready based on current astrological energies.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to generate cosmic playlist. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getEnergyColor = (energy: string) => {
    switch (energy) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-cosmic-500/20 text-cosmic-400 border-cosmic-500/30';
    }
  };

  const getMoodIcon = (mood: string) => {
    const moodIcons: Record<string, string> = {
      'energetic': '⚡',
      'calming': '🌙',
      'romantic': '💫',
      'introspective': '🔮',
      'adventurous': '🌟',
      'grounding': '🌍',
      'dreamy': '☁️',
      'confident': '👑',
      'harmonious': '🎵',
      'intense': '🔥'
    };
    return moodIcons[mood.toLowerCase()] || '🎶';
  };

  if (!user?.sunSign && !user?.moonSign && !user?.risingSign) {
    return (
      <div className="min-h-screen cosmic-gradient pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="mystical-card border-mystical-700/50 text-center">
            <CardContent className="p-8">
              <div className="text-4xl mb-4">🎵</div>
              <h3 className="text-lg font-semibold text-golden-400 mb-2">
                Complete Your Cosmic Profile
              </h3>
              <p className="text-cosmic-300 mb-4">
                Add your birth information to unlock personalized cosmic playlists
              </p>
              <Button
                onClick={() => window.location.href = "/profile-setup"}
                className="golden-gradient text-mystical-950 hover:from-golden-400 hover:to-golden-500"
              >
                <Star className="w-4 h-4 mr-2" />
                Complete Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cosmic-gradient pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-golden-400 to-golden-600 bg-clip-text text-transparent mb-4">
            <Music className="inline w-8 h-8 mr-3 text-golden-400" />
            Cosmic Playlist Generator
          </h1>
          <p className="text-cosmic-300">
            AI-curated music to match your daily astrological mood
          </p>
        </div>

        {/* Generate/Refresh Playlist */}
        <div className="text-center mb-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => generatePlaylist.mutate()}
              disabled={generatePlaylist.isPending || isLoading}
              className="golden-gradient text-mystical-950 hover:from-golden-400 hover:to-golden-500"
            >
              {generatePlaylist.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Generate New Playlist
            </Button>
            
            {playlist && (
              <>
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  className="border-cosmic-500/50 text-cosmic-300 hover:bg-cosmic-500/10"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                
                {!spotifyStatus?.connected ? (
                  <Button
                    onClick={() => connectSpotify.mutate()}
                    disabled={connectSpotify.isPending}
                    variant="outline"
                    className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                  >
                    {connectSpotify.isPending ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ExternalLink className="w-4 h-4 mr-2" />
                    )}
                    Connect Spotify
                  </Button>
                ) : (
                  <Button
                    onClick={() => exportToSpotify.mutate(playlist.id)}
                    disabled={exportToSpotify.isPending}
                    variant="outline"
                    className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                  >
                    {exportToSpotify.isPending ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ExternalLink className="w-4 h-4 mr-2" />
                    )}
                    Export to Spotify
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {isLoading && (
          <Card className="mystical-card border-mystical-700/50 text-center">
            <CardContent className="p-8">
              <div className="animate-spin w-8 h-8 border-4 border-golden-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-cosmic-300">Channeling cosmic energies for your playlist...</p>
            </CardContent>
          </Card>
        )}

        {playlist && (
          <div className="space-y-6">
            {/* Playlist Header */}
            <Card className="mystical-card border-mystical-700/50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center text-golden-400">
                      <div className="text-2xl mr-3">{getMoodIcon(playlist.mood)}</div>
                      {playlist.title}
                    </CardTitle>
                    <p className="text-cosmic-300">{playlist.description}</p>
                  </div>
                  <AddToJournalButton
                    source="cosmic-playlist"
                    sourceId={playlist.id}
                    prefilledContent={`${playlist.spotifyUrl ? `🎧 SPOTIFY PLAYLIST: ${playlist.spotifyUrl}\n` : spotifyStatus?.connected ? '🎧 SPOTIFY PLAYLIST: Available for export\n' : ''}Generated a cosmic playlist: ${playlist.title}

${playlist.description}

🎵 COSMIC TRACK LIST:
${playlist.tracks?.map((track: TrackRecommendation, index: number) => 
  `${index + 1}. "${track.title}" by ${track.artist}
   Genre: ${track.genre} | Energy: ${track.energy}
   Cosmic Reason: ${track.reason}`
).join('\n\n') || 'No tracks available'}

✨ ASTROLOGICAL CONTEXT:
${playlist.astrologyContext}

🪐 PLANETARY INFLUENCE:
${playlist.planetaryInfluence}

🎼 GENRES: ${playlist.genres?.join(', ') || 'Various'}
🌙 MOOD: ${playlist.mood}

${spotifyStatus?.connected ? '🎧 Spotify: Connected (can export playlist)' : '🎧 Spotify: Not connected'}`}
                    prefilledTitle={`Cosmic Playlist: ${playlist.title}`}
                    buttonText="Add to Journal"
                    size="sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-semibold text-golden-400 mb-2">Mood & Energy</h4>
                    <Badge className={`${getEnergyColor(playlist.mood)} border`}>
                      {playlist.mood}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-golden-400 mb-2">Genres</h4>
                    <div className="flex flex-wrap gap-1">
                      {playlist.genres?.map((genre: string, index: number) => (
                        <Badge key={index} variant="outline" className="border-mystical-600/50 text-cosmic-300">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-golden-400">Astrological Context</h4>
                  <p className="text-cosmic-300 text-sm">{playlist.astrologyContext}</p>
                  <div className="flex items-center text-xs text-golden-400">
                    <Star className="w-3 h-3 mr-1" />
                    {playlist.planetaryInfluence}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Track List */}
            <Card className="mystical-card border-mystical-700/50">
              <CardHeader>
                <CardTitle className="text-golden-400">Your Cosmic Tracks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {playlist.tracks?.map((track: TrackRecommendation, index: number) => (
                    <div
                      key={index}
                      className="bg-mystical-900/30 rounded-lg p-4 border border-mystical-700/30 hover:border-golden-500/30 transition-all cursor-pointer"
                      onClick={() => setSelectedTrack(selectedTrack?.title === track.title ? null : track)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Play className="w-4 h-4 text-golden-400" />
                            <span className="font-semibold text-cosmic-100">
                              {track.title}
                            </span>
                            <Badge className={`${getEnergyColor(track.energy)} border text-xs`}>
                              {track.energy}
                            </Badge>
                          </div>
                          <p className="text-cosmic-300 text-sm mb-1">
                            by {track.artist} • {track.genre}
                          </p>
                          <div className="flex items-center text-xs text-golden-400">
                            <div className="mr-2">{getMoodIcon(track.mood)}</div>
                            {track.mood}
                          </div>
                        </div>
                      </div>
                      
                      {selectedTrack?.title === track.title && (
                        <div className="mt-3 pt-3 border-t border-mystical-700/50">
                          <h5 className="text-xs font-semibold text-golden-400 mb-1">Astrological Reasoning</h5>
                          <p className="text-xs text-cosmic-300">{track.astrologyReasoning}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Generated Info */}
            <Card className="mystical-card border-mystical-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-xs text-cosmic-400">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Generated: {new Date(playlist.generatedAt).toLocaleString()}
                  </div>
                  <div className="text-golden-400">
                    Based on your cosmic profile: {user.sunSign} ☀️ {user.moonSign} 🌙 {user.risingSign} ⬆️
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!playlist && !isLoading && (
          <Card className="mystical-card border-mystical-700/50 text-center">
            <CardContent className="p-8">
              <div className="text-4xl mb-4">🎵</div>
              <h3 className="text-lg font-semibold text-golden-400 mb-2">
                Your Cosmic Playlist Awaits
              </h3>
              <p className="text-cosmic-300 mb-4">
                Generate a personalized playlist based on your astrological profile and today's cosmic energies
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}