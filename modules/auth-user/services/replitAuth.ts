// This file intentionally left empty to override Replit Auth blueprint
// We use our own custom authentication system instead

export function setupAuth() {
  // No-op - prevents blueprint from loading
}

export const isAuthenticated = (req: any, res: any, next: any) => {
  next();
};