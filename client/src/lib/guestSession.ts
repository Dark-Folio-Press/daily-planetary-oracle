/**
 * Guest Session Management
 * Handles anonymous user sessions with browser-only storage
 * Compliant with Spotify Developer Policy - no login required for free tier
 */

export interface GuestBirthData {
  birthDate: string;
  birthTime: string;
  birthLocation: string;
}

export interface GuestSession {
  id: string;
  birthData: GuestBirthData | null;
  createdAt: string;
  playlistsGenerated: number; // Track weekly limit (3 for free tier)
  lastResetDate: string; // For weekly limit resets
}

const GUEST_SESSION_KEY = 'cosmic_guest_session';
const WEEKLY_LIMIT = 3;

/**
 * Generate a unique guest ID
 */
export function generateGuestId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get or create guest session
 */
export function getGuestSession(): GuestSession {
  const stored = localStorage.getItem(GUEST_SESSION_KEY);
  
  if (stored) {
    try {
      const session: GuestSession = JSON.parse(stored);
      
      // Check if we need to reset weekly limit
      const lastReset = new Date(session.lastResetDate);
      const now = new Date();
      const daysSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceReset >= 7) {
        // Reset weekly limit
        session.playlistsGenerated = 0;
        session.lastResetDate = now.toISOString();
        saveGuestSession(session);
      }
      
      return session;
    } catch (error) {
      console.error('Failed to parse guest session, creating new:', error);
    }
  }
  
  // Create new guest session
  const newSession: GuestSession = {
    id: generateGuestId(),
    birthData: null,
    createdAt: new Date().toISOString(),
    playlistsGenerated: 0,
    lastResetDate: new Date().toISOString()
  };
  
  saveGuestSession(newSession);
  return newSession;
}

/**
 * Save guest session to localStorage
 */
export function saveGuestSession(session: GuestSession): void {
  localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session));
}

/**
 * Save birth data for guest user
 */
export function saveGuestBirthData(birthData: GuestBirthData): void {
  const session = getGuestSession();
  session.birthData = birthData;
  saveGuestSession(session);
}

/**
 * Get birth data for guest user
 */
export function getGuestBirthData(): GuestBirthData | null {
  const session = getGuestSession();
  return session.birthData;
}

/**
 * Check if guest user can generate a playlist
 */
export function canGuestGeneratePlaylist(): boolean {
  const session = getGuestSession();
  return session.playlistsGenerated < WEEKLY_LIMIT;
}

/**
 * Increment playlist generation count for guest
 */
export function incrementGuestPlaylistCount(): void {
  const session = getGuestSession();
  session.playlistsGenerated += 1;
  saveGuestSession(session);
}

/**
 * Get remaining playlist generations for guest
 */
export function getGuestRemainingPlaylists(): number {
  const session = getGuestSession();
  return Math.max(0, WEEKLY_LIMIT - session.playlistsGenerated);
}

/**
 * Clear guest session (logout)
 */
export function clearGuestSession(): void {
  localStorage.removeItem(GUEST_SESSION_KEY);
}

/**
 * Check if user is in guest mode (vs authenticated)
 */
export function isGuestMode(userId: string | undefined): boolean {
  return !userId || userId === 'guest' || userId.startsWith('guest_');
}

/**
 * Get user ID for API calls (returns guest ID if not authenticated)
 */
export function getUserIdForApi(authenticatedUserId: string | undefined): string {
  if (authenticatedUserId) {
    return authenticatedUserId;
  }
  
  const guestSession = getGuestSession();
  return guestSession.id;
}

/**
 * Migrate guest data to authenticated account (when user signs up)
 */
export function prepareGuestDataForMigration(): {
  birthData: GuestBirthData | null;
  guestId: string;
} {
  const session = getGuestSession();
  return {
    birthData: session.birthData,
    guestId: session.id
  };
}

/**
 * Get or create a stable chat session ID
 * Uses sessionStorage so it persists across component remounts but clears on browser tab close
 * This prevents infinite loops from creating new sessions on every render
 */
const CHAT_SESSION_KEY = 'cosmic_chat_session_id';

export function getChatSessionId(): string {
  // Try to get existing session ID from sessionStorage (persists across remounts)
  const existingSessionId = sessionStorage.getItem(CHAT_SESSION_KEY);
  
  if (existingSessionId) {
    return existingSessionId;
  }
  
  // Create new chat session ID
  const newSessionId = `session_${Date.now()}_${Math.random()}`;
  sessionStorage.setItem(CHAT_SESSION_KEY, newSessionId);
  
  return newSessionId;
}

/**
 * Clear chat session (forces new session on next page load)
 */
export function clearChatSession(): void {
  sessionStorage.removeItem(CHAT_SESSION_KEY);
}
