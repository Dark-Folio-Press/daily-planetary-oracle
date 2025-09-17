// OneSignal Push Notification Service for Stardust/Cosmic tiers
import type { User } from '../../../shared/schema';

export interface NotificationPayload {
  title: string;
  message: string;
  data?: Record<string, any>;
  userId: string;
}

export interface ScheduledNotification {
  type: 'daily_transit' | 'weekly_horoscope' | 'playlist_alert' | 'cosmic_report';
  userId: string;
  scheduledFor: Date;
  payload: NotificationPayload;
}

export class OneSignalService {
  private readonly appId: string;
  private readonly apiKey: string;
  private readonly baseUrl = 'https://onesignal.com/api/v1';

  constructor() {
    // These will be set from environment variables
    this.appId = process.env.ONESIGNAL_APP_ID || '';
    this.apiKey = process.env.ONESIGNAL_REST_API_KEY || '';
  }

  /**
   * Send push notification to specific user
   */
  async sendNotification(payload: NotificationPayload): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${this.apiKey}`,
        },
        body: JSON.stringify({
          app_id: this.appId,
          include_external_user_ids: [payload.userId],
          headings: { en: payload.title },
          contents: { en: payload.message },
          data: payload.data,
        }),
      });

      const result = await response.json();
      return result.id ? true : false;
    } catch (error) {
      console.error('OneSignal notification failed:', error);
      return false;
    }
  }

  /**
   * Subscribe user to push notifications
   */
  async subscribeUser(userId: string, pushToken?: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/players`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${this.apiKey}`,
        },
        body: JSON.stringify({
          app_id: this.appId,
          device_type: 5, // Web push
          external_user_id: userId,
          identifier: pushToken,
        }),
      });

      const result = await response.json();
      return result.success === true;
    } catch (error) {
      console.error('OneSignal subscription failed:', error);
      return false;
    }
  }
}

export class NotificationScheduler {
  private oneSignal: OneSignalService;

  constructor() {
    this.oneSignal = new OneSignalService();
  }

  /**
   * Schedule daily transit notifications for Stardust/Cosmic users
   */
  async scheduleDailyTransit(user: User, transitData: any): Promise<void> {
    if (!this.canReceiveNotifications(user, 'daily_transit')) return;

    const payload: NotificationPayload = {
      title: '🌟 Your Daily Cosmic Weather',
      message: `Today's transit: ${transitData.summary}`,
      data: {
        type: 'daily_transit',
        transitData,
        userId: user.id,
      },
      userId: user.id,
    };

    await this.oneSignal.sendNotification(payload);
  }

  /**
   * Schedule weekly horoscope notifications for Stardust/Cosmic users
   */
  async scheduleWeeklyHoroscope(user: User, horoscope: any): Promise<void> {
    if (!this.canReceiveNotifications(user, 'weekly_horoscope')) return;

    const payload: NotificationPayload = {
      title: '✨ Your Weekly Cosmic Forecast',
      message: `This week's energy: ${horoscope.summary}`,
      data: {
        type: 'weekly_horoscope',
        horoscope,
        userId: user.id,
      },
      userId: user.id,
    };

    await this.oneSignal.sendNotification(payload);
  }

  /**
   * Schedule playlist notifications for Stardust/Cosmic users
   */
  async schedulePlaylistAlert(user: User, playlistData: any): Promise<void> {
    if (!this.canReceiveNotifications(user, 'playlist_alert')) return;

    const payload: NotificationPayload = {
      title: '🎵 New Cosmic Playlist Ready!',
      message: `Your ${playlistData.theme} playlist is ready to stream`,
      data: {
        type: 'playlist_alert',
        playlistData,
        userId: user.id,
      },
      userId: user.id,
    };

    await this.oneSignal.sendNotification(payload);
  }

  /**
   * Schedule monthly cosmic reports for Cosmic tier users
   */
  async scheduleCosmicReport(user: User, reportData: any): Promise<void> {
    if (!this.canReceiveNotifications(user, 'cosmic_report')) return;

    const payload: NotificationPayload = {
      title: '📊 Your Monthly Cosmic Report',
      message: 'Your personalized astrological insights are ready!',
      data: {
        type: 'cosmic_report',
        reportData,
        userId: user.id,
      },
      userId: user.id,
    };

    await this.oneSignal.sendNotification(payload);
  }

  /**
   * Check if user can receive specific notification type based on subscription
   */
  private canReceiveNotifications(user: User, type: string): boolean {
    // Free tier (Vibes) - no notifications
    const subscriptionTier = (user as any).subscriptionTier;
    if (!subscriptionTier || subscriptionTier === 'vibes') {
      return false;
    }

    // Stardust tier - daily/weekly/playlist notifications
    if (subscriptionTier === 'stardust') {
      return ['daily_transit', 'weekly_horoscope', 'playlist_alert'].includes(type);
    }

    // Cosmic tier - all notifications
    if (subscriptionTier === 'cosmic') {
      return true;
    }

    return false;
  }
}

// Export singleton instances
export const oneSignalService = new OneSignalService();
export const notificationScheduler = new NotificationScheduler();