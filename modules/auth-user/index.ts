// Auth & User Module - Exports for authentication, user management, and profiles
export { requireAuth } from './services/auth';
export { useAuth } from './services/useAuth';
export { useOAuthAvailable } from './services/useOAuthAvailable';

// Re-export auth components
export { default as AvatarSelector } from './components/avatar-selector';
export { default as AvatarDisplay } from './components/avatar-display';
export { default as LoginPage } from './components/login';
export { default as SignupPage } from './components/signup';
export { default as ProfileSetupPage } from './components/profile-setup';

// Types
export type {
  User,
  UpsertUser,
  InsertUser
} from '@shared/schema';