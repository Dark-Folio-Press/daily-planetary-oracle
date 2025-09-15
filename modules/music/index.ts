// Music Module - Exports for Spotify integration, playlist generation, and music recommendations
export { SpotifyService, spotifyService } from './services/spotify';

// Re-export music components
export { default as CosmicLoading } from './components/cosmic-loading';

// Types
export type {
  SpotifyTrack,
  SpotifyUserProfile,
  PlaylistData
} from '@shared/schema';