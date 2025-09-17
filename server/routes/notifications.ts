import { Router } from 'express';
import { requireAuth } from '../auth';
import { oneSignalService } from '../../modules/subscription/services/notifications';
import { storage } from '../storage';

const router = Router();

/**
 * Subscribe user to push notifications
 */
router.post('/subscribe', requireAuth, async (req, res) => {
  try {
    const userId = req.session?.passport?.user;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has subscription tier that allows notifications
    const userTier = (user as any).subscriptionTier || 'vibes';
    if (userTier === 'vibes') {
      return res.status(403).json({ 
        error: 'Push notifications require Stardust or Cosmic subscription' 
      });
    }

    // Subscribe user to OneSignal
    const success = await oneSignalService.subscribeUser(userId);
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to subscribe to notifications' });
    }

    // Update user notification preferences in database
    await storage.updateUserNotificationSettings(userId, {
      pushNotificationsEnabled: true,
      subscribedAt: new Date(),
    });

    res.json({ 
      success: true, 
      message: 'Successfully subscribed to notifications' 
    });

  } catch (error) {
    console.error('Notification subscribe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Unsubscribe user from push notifications
 */
router.post('/unsubscribe', requireAuth, async (req, res) => {
  try {
    const userId = req.session?.passport?.user;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Update user notification preferences in database
    await storage.updateUserNotificationSettings(userId, {
      pushNotificationsEnabled: false,
      unsubscribedAt: new Date(),
    });

    res.json({ 
      success: true, 
      message: 'Successfully unsubscribed from notifications' 
    });

  } catch (error) {
    console.error('Notification unsubscribe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Register OneSignal player ID and timezone (without enabling notifications)
 */
router.post('/onesignal/register', requireAuth, async (req, res) => {
  try {
    const userId = req.session?.passport?.user;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has subscription tier that allows notifications
    const userTier = (user as any).subscriptionTier || 'vibes';
    if (userTier === 'vibes') {
      return res.status(403).json({ 
        error: 'Push notifications require Stardust or Cosmic subscription' 
      });
    }

    const { oneSignalPlayerId, timezone } = req.body;

    if (!oneSignalPlayerId) {
      return res.status(400).json({ error: 'OneSignal player ID is required' });
    }

    // Store player ID and timezone without enabling notifications yet
    // Only /subscribe should enable notifications after tier validation
    await storage.updateUserNotificationSettings(userId, {
      oneSignalPlayerId,
      timezone: timezone || 'UTC'
      // Note: pushNotificationsEnabled will be set by /subscribe endpoint
    });

    res.json({ 
      success: true, 
      message: 'OneSignal player registered successfully',
      playerId: oneSignalPlayerId,
      timezone: timezone || 'UTC'
    });
  } catch (error) {
    console.error('OneSignal registration error:', error);
    res.status(500).json({ error: 'Failed to register OneSignal player' });
  }
});

/**
 * Get user notification settings
 */
router.get('/settings', requireAuth, async (req, res) => {
  try {
    const userId = req.session?.passport?.user;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const settings = {
      subscriptionTier: (user as any).subscriptionTier || 'vibes',
      pushNotificationsEnabled: (user as any).pushNotificationsEnabled || false,
      canReceiveNotifications: ['stardust', 'cosmic'].includes((user as any).subscriptionTier || 'vibes'),
    };

    res.json(settings);

  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;