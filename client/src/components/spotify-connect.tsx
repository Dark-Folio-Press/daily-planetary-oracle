import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Music, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface SpotifyStatus {
  connected: boolean;
  spotifyId?: string;
  musicProfile?: {
    preferredGenres: string[];
    averageEnergy: number;
    averageValence: number;
    averageTempo: number;
    topArtists: string[];
  };
}

export function SpotifyConnect() {
  const [status, setStatus] = useState<SpotifyStatus | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    checkSpotifyStatus();
    
    // Check for callback parameters
    const urlParams = new URLSearchParams(window.location.search);
    const spotifyResult = urlParams.get('spotify');
    
    if (spotifyResult === 'connected') {
      toast({
        title: "Spotify Connected!",
        description: "Your music profile has been analyzed for personalized playlists.",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      checkSpotifyStatus();
    } else if (spotifyResult === 'error') {
      toast({
        title: "Connection Failed",
        description: "There was an issue connecting to Spotify. Please try again.",
        variant: "destructive",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  const checkSpotifyStatus = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await apiRequest('GET', '/api/spotify/status');
      const data = await response.json();
      console.log("Spotify status response:", data);
      setStatus(data);
    } catch (error) {
      console.error("Error checking Spotify status:", error);
    }
  };

  const refreshMusicProfile = async () => {
    if (!isAuthenticated) return;
    
    try {
      toast({
        title: "Refreshing Profile",
        description: "Analyzing your latest Spotify data...",
      });
      
      const response = await apiRequest('POST', '/api/spotify/refresh-profile');
      const data = await response.json();
      
      if (data.success) {
        // Update the status with new profile data
        setStatus(prev => prev ? {
          ...prev,
          musicProfile: data.musicProfile
        } : null);
        
        toast({
          title: "Profile Updated!",
          description: "Your music profile has been refreshed with latest data.",
        });
      }
    } catch (error) {
      console.error("Error refreshing music profile:", error);
      toast({
        title: "Refresh Failed",
        description: "Could not refresh your music profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const connectSpotify = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to connect your Spotify account.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      const response = await apiRequest('GET', '/api/spotify/auth');
      const data = await response.json();
      console.log("Spotify auth response:", data);
      
      if (data.authUrl) {
        // Open in new tab to avoid redirect issues
        const authWindow = window.open(data.authUrl, '_blank');
        if (authWindow) {
          toast({
            title: "Authorization Window Opened",
            description: "Complete Spotify login in the new tab, then return here and click 'Check Connection'.",
            duration: 8000,
          });
        } else {
          toast({
            title: "Please Allow Popups",
            description: "Enable popups for this site and try again, or manually visit the authorization URL.",
            variant: "destructive",
            duration: 8000,
          });
        }
      }
    } catch (error) {
      console.error("Error getting Spotify auth URL:", error);
      toast({
        title: "Connection Error",
        description: "Failed to initiate Spotify connection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectSpotify = async () => {
    try {
      await apiRequest('POST', '/api/spotify/disconnect');
      setStatus({ connected: false });
      toast({
        title: "Spotify Disconnected",
        description: "Your Spotify account has been disconnected.",
      });
    } catch (error) {
      console.error("Error disconnecting Spotify:", error);
      toast({
        title: "Disconnect Failed",
        description: "Failed to disconnect Spotify. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="w-5 h-5" />
          Spotify Integration
        </CardTitle>
      </CardHeader>
      <CardContent>
        {status?.connected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Connected to Spotify</span>
            </div>
            
            {status.musicProfile && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-sm">Your Music Profile:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>Energy Level: {Math.round((status.musicProfile.averageEnergy || 0) * 100)}%</div>
                  <div>Happiness: {Math.round((status.musicProfile.averageValence || 0) * 100)}%</div>
                  <div>Tempo: {Math.round(status.musicProfile.averageTempo || 0)} BPM</div>
                  <div>Genres: {(status.musicProfile.preferredGenres || []).slice(0, 3).join(', ') || 'Loading...'}</div>
                </div>
                {status.musicProfile.topArtists && status.musicProfile.topArtists.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Top Artists: {status.musicProfile.topArtists.slice(0, 3).join(', ')}
                  </div>
                )}
              </div>
            )}
            
            <div className="flex gap-2">
              <Button onClick={refreshMusicProfile} variant="outline" size="sm">
                Refresh Profile
              </Button>
              <Button onClick={disconnectSpotify} variant="destructive" size="sm">
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="w-5 h-5" />
              <span>Connect Spotify for personalized playlists</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Connect your Spotify account to analyze your music taste and create playlists 
              that perfectly match both your astrological profile and your musical preferences.
            </p>
            <div className="text-xs text-muted-foreground bg-muted/30 rounded p-2 space-y-2">
              <div>🎵 <strong>Easy 3-Step Connection:</strong></div>
              <div>1. Click "Connect Spotify" → Sign in your Spotify account</div>
              <div>2. Authorize the app permissions</div>
              <div>3. Return here and click "Check Connection"</div>
              <div className="text-blue-600 dark:text-blue-400 text-xs">
                Opens in new tab to avoid redirect issues
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button 
                  onClick={connectSpotify} 
                  disabled={isConnecting}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {isConnecting ? "Connecting..." : "Connect Spotify"}
                </Button>
                <Button 
                  onClick={checkSpotifyStatus} 
                  variant="outline" 
                  size="sm"
                  className="shrink-0"
                >
                  Check Connection
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                <strong>Connection Status:</strong> OAuth flow works in development - no deployment needed!
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}