import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Music, ExternalLink, Loader2, Clock, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

interface SpotifyExportButtonProps {
  sessionId: string;
  playlistName?: string;
  className?: string;
}

export function SpotifyExportButton({ sessionId, playlistName, className = "" }: SpotifyExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  // Note: Export/sharing is now unlimited, only playlist generation has weekly limits

  const exportToSpotify = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign In Required",
        description: "Sign in to export playlists to Spotify.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const response = await apiRequest('POST', '/api/spotify/create-playlist', {
        sessionId,
        playlistName: playlistName || undefined,
      });
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Playlist Created!",
          description: `Successfully created Spotify playlist with ${data.tracksAdded}/${data.totalSongs} songs.`,
        });
        
        // Open Spotify playlist in new tab with a longer delay for playlist to become available
        if (data.playlistUrl) {
          toast({
            title: "Opening Playlist",
            description: "Your playlist is now opening in Spotify...",
          });
          setTimeout(() => {
            window.open(data.playlistUrl, '_blank');
          }, 2000); // Increased delay for playlist availability
        }
      }
    } catch (error: any) {
      console.error("Error exporting to Spotify:", error);
      
      if (error.message.includes('Spotify not connected')) {
        toast({
          title: "Spotify Not Connected",
          description: "Please connect your Spotify account first to export playlists.",
          variant: "destructive",
        });
      } else if (error.message.includes('token expired')) {
        toast({
          title: "Spotify Connection Expired",
          description: "Please reconnect your Spotify account to continue.",
          variant: "destructive",
        });
      } else {
        // Note: Weekly export limits removed - sharing is now unlimited
        toast({
          title: "Export Failed",
          description: "Failed to export playlist to Spotify. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsExporting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className={`${className} bg-green-50 hover:bg-green-100 border-green-200 text-green-700 dark:bg-green-950 dark:hover:bg-green-900 dark:border-green-800 dark:text-green-400`}
        onClick={() => {
          toast({
            title: "Sign In Required",
            description: "Sign in to export playlists to Spotify.",
            variant: "destructive",
          });
        }}
      >
        <Music className="w-4 h-4 mr-2" />
        Sign in to Export
      </Button>
    );
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className={`${className} bg-green-50 hover:bg-green-100 border-green-200 text-green-700 dark:bg-green-950 dark:hover:bg-green-900 dark:border-green-800 dark:text-green-400`}
      onClick={exportToSpotify}
      disabled={isExporting}
    >
      {isExporting ? (
        <>
          <div className="relative mr-2">
            <Loader2 className="w-4 h-4 text-green-500 animate-spin" />
            <Sparkles className="w-2 h-2 absolute -top-1 -right-1 text-yellow-400 animate-pulse" />
          </div>
          <span className="animate-pulse">Creating cosmic playlist...</span>
        </>
      ) : (
        <>
          <Music className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
          Export to Spotify
          <ExternalLink className="w-3 h-3 ml-1" />
        </>
      )}
    </Button>
  );
}