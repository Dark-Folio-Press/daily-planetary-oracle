import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { requireAuth } from '../auth';
import { db } from '../db';
import { waitlist } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Admin middleware (simple check - can be enhanced with proper role system)
const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  const user = req.user;
  // For now, only allow specific admin emails - this should be moved to database roles
  const adminEmails = ['admin@cosmiccurator.com', 'staff@cosmiccurator.com'];
  
  if (!adminEmails.includes(user.email)) {
    return res.status(403).json({ message: "Admin access required" });
  }
  
  next();
};

// Validation schemas
const waitlistSignupSchema = z.object({
  email: z.string().email('Invalid email format'),
  referralCode: z.string().optional(),
});

const shareUpdateSchema = z.object({
  email: z.string().email('Invalid email format'),
});

// In-memory store for rate limiting (in production, use Redis or similar)
const shareRateLimit = new Map();
const SHARE_LIMIT_PER_EMAIL = 5; // Maximum 5 shares per email per day
const SHARE_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Join the waitlist
 */
router.post('/signup', async (req, res) => {
  try {
    const { email, referralCode } = waitlistSignupSchema.parse(req.body);
    const ipAddress = req.ip || req.connection?.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Add to waitlist
    const result = await storage.addToWaitlist(email, ipAddress, userAgent);

    // Process referral if provided
    if (referralCode) {
      await storage.processReferral(referralCode, email);
    }

    res.json({
      success: true,
      position: Number(result.position), // Ensure it's a number
      referralCode: result.referralCode,
      message: `You're #${result.position} on the waitlist!`
    });

  } catch (error) {
    console.error('Waitlist signup error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        details: error.errors 
      });
    }

    res.status(500).json({ error: 'Failed to join waitlist' });
  }
});

/**
 * Get waitlist position by email
 */
router.get('/position', async (req, res) => {
  try {
    const email = req.query.email as string;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const position = await storage.getWaitlistPosition(email);
    
    if (position === null) {
      return res.status(404).json({ error: 'Email not found on waitlist' });
    }

    const entry = await storage.getWaitlistByEmail(email);
    
    res.json({
      position,
      referralCode: entry?.referralCode,
      referralCount: entry?.referralCount || 0,
      socialShares: entry?.socialShares || 0,
      positionBoost: entry?.positionBoost || 0,
      effectivePosition: Math.max(1, position - (entry?.positionBoost || 0))
    });

  } catch (error) {
    console.error('Get position error:', error);
    res.status(500).json({ error: 'Failed to get waitlist position' });
  }
});

/**
 * Update social shares count
 */
router.post('/share', async (req, res) => {
  try {
    const { email } = shareUpdateSchema.parse(req.body);
    
    // Check rate limiting
    const now = Date.now();
    const userShares = shareRateLimit.get(email);
    
    if (userShares) {
      // Clean up old entries (older than 24 hours)
      userShares.timestamps = userShares.timestamps.filter(
        (timestamp: number) => now - timestamp < SHARE_COOLDOWN
      );
      
      // Check if user has exceeded daily limit
      if (userShares.timestamps.length >= SHARE_LIMIT_PER_EMAIL) {
        return res.status(429).json({ 
          error: 'Share limit exceeded',
          message: 'You can only share 5 times per day. Please wait before sharing again.'
        });
      }
      
      userShares.timestamps.push(now);
    } else {
      shareRateLimit.set(email, { timestamps: [now] });
    }
    
    await storage.updateSocialShares(email);
    
    const updatedEntry = await storage.getWaitlistByEmail(email);
    
    res.json({
      success: true,
      socialShares: updatedEntry?.socialShares || 0,
      positionBoost: updatedEntry?.positionBoost || 0,
      message: 'Social share recorded! Your position has been boosted.',
      sharesRemaining: Math.max(0, SHARE_LIMIT_PER_EMAIL - (userShares?.timestamps.length || 1))
    });

  } catch (error) {
    console.error('Share update error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        details: error.errors 
      });
    }

    res.status(500).json({ error: 'Failed to update social shares' });
  }
});

/**
 * Get waitlist stats (for admin or public display)
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await storage.getWaitlistStats();
    
    res.json({
      totalSignups: stats.totalSignups,
      totalInvited: stats.totalInvited,
      totalAccepted: stats.totalAccepted,
      spotsRemaining: Math.max(0, 1000 - stats.totalAccepted) // Assuming 1000 beta spots
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get waitlist stats' });
  }
});

/**
 * Preview invitation and show confirmation page (when user clicks email link)
 */
router.get('/accept/:inviteToken', async (req, res) => {
  try {
    const { inviteToken } = req.params;
    
    if (!inviteToken) {
      return res.status(400).send('<h1>Invalid invitation link</h1><p>The invitation token is missing.</p>');
    }

    // Just validate token without accepting it
    const [invitation] = await db.select()
      .from(waitlist)
      .where(eq(waitlist.inviteToken, inviteToken))
      .limit(1);

    if (!invitation || invitation.inviteStatus !== 'invited' || invitation.acceptedAt) {
      return res.status(404).send(`
        <html>
          <head><title>Invitation Invalid</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>🔒 Invitation Invalid</h1>
            <p>This invitation link has expired, already been used, or is invalid.</p>
            <p>Please contact support if you believe this is an error.</p>
          </body>
        </html>
      `);
    }

    // Check if invitation has expired (7 days from invite date)
    if (invitation.invitedAt) {
      const inviteDate = new Date(invitation.invitedAt);
      const expiryDate = new Date(inviteDate.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
      if (new Date() > expiryDate) {
        return res.status(410).send(`
          <html>
            <head><title>Invitation Expired</title></head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h1>⏰ Invitation Expired</h1>
              <p>This invitation link has expired.</p>
              <p>Please contact support for a new invitation.</p>
            </body>
          </html>
        `);
      }
    }

    // Show confirmation page instead of auto-accepting
    const baseUrl = process.env.REPLIT_DOMAIN 
      ? `https://${process.env.REPLIT_DOMAIN}` 
      : 'http://localhost:5000';
    
    res.send(`
      <html>
        <head><title>Confirm Beta Invitation</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; min-height: 100vh;">
          <h1>🌟 Welcome to Cosmic Music Curator Beta!</h1>
          <p style="font-size: 18px; margin: 20px 0;">You've been invited to join our exclusive beta program.</p>
          <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 12px; margin: 30px auto; max-width: 500px;">
            <h2>What You'll Get:</h2>
            <ul style="text-align: left; display: inline-block;">
              <li>AI-powered weekly playlists based on astrological transits</li>
              <li>Personalized daily horoscopes with music recommendations</li>
              <li>Birth chart analysis with cosmic soundtracks</li>
              <li>Push notifications for planetary movements</li>
            </ul>
          </div>
          <form method="POST" action="/api/waitlist/accept/${inviteToken}" style="margin-top: 30px;">
            <button type="submit" 
                    style="display: inline-block; background: white; color: #6366f1; padding: 15px 30px; border: none; border-radius: 8px; font-weight: bold; font-size: 16px; cursor: pointer;">
              Accept Beta Invitation
            </button>
          </form>
          <p style="font-size: 14px; margin-top: 20px; opacity: 0.8;">
            By clicking "Accept Beta Invitation", you confirm you want to join our beta program.
          </p>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('Preview invitation error:', error);
    res.status(500).send('<h1>Error</h1><p>An error occurred while processing your invitation. Please try again later.</p>');
  }
});

/**
 * Accept invitation via POST API (for programmatic access)
 */
router.post('/accept/:inviteToken', async (req, res) => {
  try {
    const { inviteToken } = req.params;
    
    if (!inviteToken) {
      return res.status(400).json({ error: 'Invite token is required' });
    }

    const success = await storage.acceptInvitation(inviteToken);
    
    if (!success) {
      return res.status(404).json({ error: 'Invalid or expired invite token' });
    }

    // For POST API, redirect to success page
    const baseUrl = process.env.REPLIT_DOMAIN 
      ? `https://${process.env.REPLIT_DOMAIN}` 
      : 'http://localhost:5000';
    
    res.send(`
      <html>
        <head><title>Beta Access Granted</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; min-height: 100vh;">
          <h1>🌟 Welcome to Cosmic Music Curator Beta!</h1>
          <p style="font-size: 18px; margin: 20px 0;">Your invitation has been accepted successfully!</p>
          <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 12px; margin: 30px auto; max-width: 500px;">
            <h2>🚀 You're In!</h2>
            <p>You now have full access to all beta features. Start exploring your personalized cosmic music journey.</p>
          </div>
          <a href="${baseUrl}" 
             style="display: inline-block; background: white; color: #6366f1; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin-top: 20px;">
            Enter Cosmic Music Curator
          </a>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
});

// Send invitation email to specific users (admin only)
router.post('/invite/:position', requireAdmin, async (req, res) => {
  try {
    const position = parseInt(req.params.position);
    if (isNaN(position) || position < 1) {
      return res.status(400).json({ error: 'Invalid position number' });
    }

    const success = await storage.sendWaitlistInvitation(position);
    
    if (!success) {
      return res.status(404).json({ 
        error: 'No one found at that position or already invited' 
      });
    }

    res.json({ 
      success: true, 
      message: `Invitation sent to person at position ${position}` 
    });
  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
});

// Bulk invite multiple positions
router.post('/invite/bulk', requireAdmin, async (req, res) => {
  try {
    const { positions } = req.body;
    
    if (!Array.isArray(positions) || positions.length === 0) {
      return res.status(400).json({ error: 'Positions array is required' });
    }

    const results = [];
    for (const position of positions) {
      const success = await storage.sendWaitlistInvitation(position);
      results.push({ position, success });
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    res.json({ 
      success: true, 
      message: `Sent ${successful} invitations, ${failed} failed`,
      results 
    });
  } catch (error) {
    console.error('Error sending bulk invitations:', error);
    res.status(500).json({ error: 'Failed to send invitations' });
  }
});

// Get waitlist entries (admin view)
router.get('/entries', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const entries = await storage.getWaitlistEntries(page, limit);
    
    res.json(entries);
  } catch (error) {
    console.error('Error fetching waitlist entries:', error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

export default router;