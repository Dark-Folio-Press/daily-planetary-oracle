import type { TrackRecommendation } from "./cosmicPlaylist";

export interface SpotifyTrack {
  id: string;
  uri: string;
  name: string;
  artists: Array<{ name: string }>;
  album: { name: string };
  preview_url?: string;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  external_urls: { spotify: string };
  tracks: { total: number };
}

export class SpotifyService {
  private accessToken: string;
  
  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async searchTrack(artist: string, title: string): Promise<SpotifyTrack | null> {
    try {
      const query = `artist:${artist} track:${title}`;
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        console.error(`Spotify search failed: ${response.status}`);
        return null;
      }

      const data = await response.json();
      const tracks = data.tracks?.items || [];
      return tracks.length > 0 ? tracks[0] : null;
    } catch (error) {
      console.error('Error searching Spotify track:', error);
      return null;
    }
  }

  async createPlaylist(userId: string, name: string, description: string): Promise<SpotifyPlaylist | null> {
    try {
      const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          public: true,
        }),
      });

      if (!response.ok) {
        console.error(`Failed to create Spotify playlist: ${response.status}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating Spotify playlist:', error);
      return null;
    }
  }

  async addTracksToPlaylist(playlistId: string, trackUris: string[]): Promise<boolean> {
    try {
      // Spotify API allows max 100 tracks per request
      const chunks = this.chunkArray(trackUris, 100);
      
      for (const chunk of chunks) {
        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uris: chunk,
          }),
        });

        if (!response.ok) {
          console.error(`Failed to add tracks to Spotify playlist: ${response.status}`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error adding tracks to Spotify playlist:', error);
      return false;
    }
  }

  async getCurrentUser(): Promise<{ id: string; display_name: string } | null> {
    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        console.error(`Failed to get Spotify user: ${response.status}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting Spotify user:', error);
      return null;
    }
  }

  async exportCosmicPlaylist(
    tracks: TrackRecommendation[],
    playlistTitle: string,
    playlistDescription: string
  ): Promise<{ playlist: SpotifyPlaylist; foundTracks: number; totalTracks: number } | null> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return null;

      // Search for tracks on Spotify
      const spotifyTracks: SpotifyTrack[] = [];
      for (const track of tracks) {
        const spotifyTrack = await this.searchTrack(track.artist, track.title);
        if (spotifyTrack) {
          spotifyTracks.push(spotifyTrack);
        }
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (spotifyTracks.length === 0) {
        console.error('No tracks found on Spotify');
        return null;
      }

      // Create playlist
      const playlist = await this.createPlaylist(user.id, playlistTitle, playlistDescription);
      if (!playlist) return null;

      // Add tracks to playlist
      const trackUris = spotifyTracks.map(track => track.uri);
      const success = await this.addTracksToPlaylist(playlist.id, trackUris);
      
      if (!success) {
        console.error('Failed to add some tracks to playlist');
      }

      return {
        playlist,
        foundTracks: spotifyTracks.length,
        totalTracks: tracks.length,
      };
    } catch (error) {
      console.error('Error exporting cosmic playlist to Spotify:', error);
      return null;
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// Spotify OAuth helper functions
export function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
}

export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier));
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export function getSpotifyAuthUrl(clientId: string, redirectUri: string, codeChallenge: string): string {
  const scopes = [
    'playlist-modify-public',
    'playlist-modify-private',
    'user-read-private',
    'user-read-email'
  ];

  const authUrl = new URL('https://accounts.spotify.com/authorize');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('code_challenge_method', 'S256');
  authUrl.searchParams.append('code_challenge', codeChallenge);
  authUrl.searchParams.append('scope', scopes.join(' '));

  return authUrl.toString();
}

export async function exchangeCodeForToken(
  clientId: string,
  code: string,
  redirectUri: string,
  codeVerifier: string
): Promise<{ access_token: string; refresh_token: string; expires_in: number } | null> {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      console.error(`Failed to exchange code for token: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    return null;
  }
}