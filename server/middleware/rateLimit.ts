/**
 * Simple Rate Limiting for Guest Users
 * Limits playlist generation to 3 per hour per IP address
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory storage for rate limits (resets on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(rateLimitStore.entries());
  for (const [ip, entry] of entries) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}, 60 * 60 * 1000); // Clean up every hour

/**
 * Rate limit middleware for guest playlist generation
 * Limits: 3 requests per hour per IP address
 */
export function guestPlaylistRateLimit(req: Request, res: Response, next: NextFunction) {
  // Only apply rate limiting to guest users
  const userId = (req.user as any)?.id;
  if (userId && !userId.startsWith('guest')) {
    // Authenticated users have their own limits via database
    return next();
  }

  // Get client IP address
  const ip = req.ip || 
             req.headers['x-forwarded-for'] as string || 
             req.socket.remoteAddress || 
             'unknown';
  
  const now = Date.now();
  const hourInMs = 60 * 60 * 1000;
  
  let entry = rateLimitStore.get(ip);
  
  if (!entry || now > entry.resetTime) {
    // First request or expired entry
    entry = {
      count: 1,
      resetTime: now + hourInMs
    };
    rateLimitStore.set(ip, entry);
    
    // Add headers to inform client
    res.setHeader('X-RateLimit-Limit', '3');
    res.setHeader('X-RateLimit-Remaining', '2');
    res.setHeader('X-RateLimit-Reset', entry.resetTime.toString());
    
    return next();
  }
  
  if (entry.count >= 3) {
    // Rate limit exceeded
    const resetIn = Math.ceil((entry.resetTime - now) / 1000 / 60); // minutes
    
    res.setHeader('X-RateLimit-Limit', '3');
    res.setHeader('X-RateLimit-Remaining', '0');
    res.setHeader('X-RateLimit-Reset', entry.resetTime.toString());
    
    return res.status(429).json({
      error: `Guest limit reached: 3 playlists per hour. Try again in ${resetIn} minutes, or sign up for unlimited playlists!`,
      limitType: 'guest_hourly',
      resetIn: resetIn,
      upgradeUrl: '/signup'
    });
  }
  
  // Increment count
  entry.count++;
  rateLimitStore.set(ip, entry);
  
  // Add headers
  res.setHeader('X-RateLimit-Limit', '3');
  res.setHeader('X-RateLimit-Remaining', (3 - entry.count).toString());
  res.setHeader('X-RateLimit-Reset', entry.resetTime.toString());
  
  next();
}

/**
 * Get current rate limit status for an IP
 */
export function getRateLimitStatus(ip: string): { 
  remaining: number; 
  resetIn: number; 
  limit: number;
} {
  const entry = rateLimitStore.get(ip);
  const now = Date.now();
  
  if (!entry || now > entry.resetTime) {
    return { remaining: 3, resetIn: 0, limit: 3 };
  }
  
  const resetIn = Math.ceil((entry.resetTime - now) / 1000 / 60); // minutes
  return {
    remaining: Math.max(0, 3 - entry.count),
    resetIn,
    limit: 3
  };
}
