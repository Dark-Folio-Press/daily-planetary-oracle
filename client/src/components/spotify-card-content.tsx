import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Music, CheckCircle, AlertCircle, X } from "lucide-react";
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

export function SpotifyCardContent() {
  const [status, setStatus] = useState<SpotifyStatus | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
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
      console.error("Error refreshing profile:", error);
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const connectSpotify = async () => {
    if (!isAuthenticated) return;
    
    setIsConnecting(true);
    try {
      const response = await apiRequest('GET', '/api/spotify/auth');
      const data = await response.json();
      
      if (data.authUrl) {
        const authWindow = window.open(data.authUrl, '_blank');
        if (authWindow) {
          toast({
            title: "Authorization Window Opened",
            description: "Complete Spotify login in the new tab, then return here and refresh to see your connection.",
            duration: 8000,
          });
        } else {
          // Fallback if popup is blocked
          window.location.href = data.authUrl;
        }
      }
    } catch (error) {
      console.error("Error connecting to Spotify:", error);
      toast({
        title: "Connection Failed",
        description: "Unable to connect to Spotify. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectSpotify = async () => {
    if (!isAuthenticated) return;
    
    try {
      await apiRequest('POST', '/api/spotify/disconnect');
      setStatus({ connected: false });
      toast({
        title: "Disconnected",
        description: "Your Spotify account has been disconnected.",
      });
    } catch (error) {
      console.error("Error disconnecting Spotify:", error);
      toast({
        title: "Disconnect Failed",
        description: "Unable to disconnect. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center text-muted-foreground">
        <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Sign in to connect your Spotify account</p>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="text-center">
        <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
        <p className="text-sm text-muted-foreground">Loading Spotify status...</p>
      </div>
    );
  }

  if (isHidden) {
    return null;
  }

  return (
    <div className="space-y-4">
      {status?.connected ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Connected to Spotify</span>
          </div>
          
          {status.musicProfile && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 relative">
              <h4 className="font-medium text-sm mb-2">Your Music Profile:</h4>
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
            <Button
              onClick={refreshMusicProfile}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Music className="w-3 h-3 mr-1" />
              Refresh Profile
            </Button>
            
            <Button
              onClick={disconnectSpotify}
              variant="destructive"
              size="sm"
              className="text-xs"
            >
              Disconnect
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Not Connected</span>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Connect your Spotify account to get:</p>
            <ul className="list-disc list-inside space-y-1 text-xs pl-2">
              <li>Personalized playlist recommendations</li>
              <li>Music based on your listening history</li>
              <li>Direct playlist creation in your Spotify account</li>
            </ul>
          </div>

          <Button
            onClick={connectSpotify}
            disabled={isConnecting}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <Music className="w-4 h-4 mr-2" />
            {isConnecting ? "Connecting..." : "Connect Spotify"}
          </Button>
        </div>
      )}
    </div>
  );
}