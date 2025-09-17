import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

// Validation schemas
const waitlistSignupSchema = z.object({
  email: z.string().email('Invalid email format'),
  referralCode: z.string().optional(),
});

const shareUpdateSchema = z.object({
  email: z.string().email('Invalid email format'),
});

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
      position: result.position,
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
    
    await storage.updateSocialShares(email);
    
    const updatedEntry = await storage.getWaitlistByEmail(email);
    
    res.json({
      success: true,
      socialShares: updatedEntry?.socialShares || 0,
      positionBoost: updatedEntry?.positionBoost || 0,
      message: 'Social share recorded! Your position has been boosted.'
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
 * Accept invitation (when user gets beta access)
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

    res.json({
      success: true,
      message: 'Invitation accepted! Welcome to the beta.',
      redirectUrl: '/onboarding'
    });

  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
});

export default router;