// Shared Module - Common utilities, types, and helpers used across modules
export { storage } from '../../server/storage';
export * from '../../shared/schema';

// Common utilities
export { cn } from '../../client/src/lib/utils';
export { apiRequest, queryClient } from '../../client/src/lib/queryClient';

// Common hooks
export { useToast } from '../../client/src/hooks/use-toast';
export { useTheme } from '../../client/src/hooks/useTheme';