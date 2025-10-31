/**
 * Unified User Session Hook
 * Handles both authenticated users and guest sessions
 */

import { useAuth } from "./useAuth";
import { 
  getGuestSession, 
  getUserIdForApi, 
  isGuestMode,
  canGuestGeneratePlaylist,
  getGuestRemainingPlaylists,
  GuestSession
} from "@/lib/guestSession";
import { useState, useEffect } from "react";

export interface UserSession {
  userId: string;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  guestSession?: GuestSession;
  canGeneratePlaylist: boolean;
  remainingPlaylists: number;
  tier: 'vibes' | 'stardust' | 'cosmic';
  canUseSpotifyPersonalization: boolean;
}

export function useUserSession(): UserSession {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [guestSession, setGuestSession] = useState<GuestSession | undefined>();
  
  // Load guest session on mount
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      const session = getGuestSession();
      setGuestSession(session);
    }
  }, [isAuthenticated, authLoading]);
  
  // Determine user ID
  const userId = getUserIdForApi(user?.id);
  const isGuest = isGuestMode(user?.id);
  
  // Determine tier (default to vibes for guests)
  const tier = isGuest ? 'vibes' : (user?.subscriptionTier as 'vibes' | 'stardust' | 'cosmic' || 'vibes');
  
  // Check if user can generate playlists
  let canGeneratePlaylist = false;
  let remainingPlaylists = 0;
  
  if (isGuest) {
    canGeneratePlaylist = canGuestGeneratePlaylist();
    remainingPlaylists = getGuestRemainingPlaylists();
  } else if (user) {
    // For authenticated users, check their tier limits
    // Vibes: 3 per week, Stardust/Cosmic: unlimited
    if (tier === 'vibes') {
      remainingPlaylists = 3; // Placeholder - should check actual usage
      canGeneratePlaylist = remainingPlaylists > 0;
    } else {
      canGeneratePlaylist = true;
      remainingPlaylists = Infinity;
    }
  }
  
  // Check if user can use Spotify personalization (paid feature)
  const canUseSpotifyPersonalization = !isGuest && (tier === 'stardust' || tier === 'cosmic');
  
  return {
    userId,
    isAuthenticated,
    isGuest,
    isLoading: authLoading,
    guestSession,
    canGeneratePlaylist,
    remainingPlaylists,
    tier,
    canUseSpotifyPersonalization
  };
}
