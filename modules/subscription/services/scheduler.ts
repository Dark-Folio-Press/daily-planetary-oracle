// Notification Scheduling System for subscription tiers
import { notificationScheduler } from './notifications';
import { storage } from '../../../server/storage';
import type { User } from '../../../shared/schema';

export class NotificationCron {
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Start daily notification cycle
   * Runs every day at 8 AM user's local time
   */
  startDailyNotifications(): void {
    // Run every hour and check if it's 8 AM for any users
    const interval = setInterval(async () => {
      await this.processDailyNotifications();
    }, 60 * 60 * 1000); // Every hour

    this.intervals.set('daily', interval);
  }

  /**
   * Start weekly notification cycle  
   * Runs every Monday at 7 AM user's local time
   */
  startWeeklyNotifications(): void {
    // Run hourly and check if it's Monday 7 AM for any users (proper timezone handling)
    const interval = setInterval(async () => {
      await this.processWeeklyNotifications();
    }, 60 * 60 * 1000); // Every hour

    this.intervals.set('weekly', interval);
  }

  /**
   * Process daily transit notifications
   */
  private async processDailyNotifications(): Promise<void> {
    try {
      // Get only users who are eligible for notifications (paid tier + opted in + have player ID)
      const users = await this.getEligibleUsers();
      
      for (const user of users) {
        // Defensive guards - ensure user is still eligible
        if (!(user as any).pushNotificationsEnabled || !(user as any).oneSignalPlayerId) {
          continue;
        }
        
        const userTime = this.getUserLocalTime(user);
        
        // Send at 8 AM user's time
        if (userTime.getHours() === 8 && userTime.getMinutes() < 60) {
          await this.sendDailyTransit(user);
        }
      }
    } catch (error) {
      console.error('Daily notification processing failed:', error);
    }
  }

  /**
   * Process weekly horoscope notifications
   */
  private async processWeeklyNotifications(): Promise<void> {
    try {
      // Get only users who are eligible for notifications (paid tier + opted in + have player ID)
      const users = await this.getEligibleUsers();
      
      for (const user of users) {
        // Defensive guards - ensure user is still eligible
        if (!(user as any).pushNotificationsEnabled || !(user as any).oneSignalPlayerId) {
          continue;
        }
        
        const userTime = this.getUserLocalTime(user);
        
        // Send on Monday at 7 AM user's time
        if (userTime.getDay() === 1 && userTime.getHours() === 7 && userTime.getMinutes() < 60) {
          await this.sendWeeklyHoroscope(user);
          await this.sendPlaylistNotification(user);
        }
      }
    } catch (error) {
      console.error('Weekly notification processing failed:', error);
    }
  }

  /**
   * Send daily transit notification to user
   */
  private async sendDailyTransit(user: User): Promise<void> {
    try {
      // Get user's daily transit data (this would use your astrology service)
      const transitData = await this.generateDailyTransit(user);
      await notificationScheduler.scheduleDailyTransit(user, transitData);
    } catch (error) {
      console.error(`Failed to send daily transit for user ${user.id}:`, error);
    }
  }

  /**
   * Send weekly horoscope notification to user
   */
  private async sendWeeklyHoroscope(user: User): Promise<void> {
    try {
      // Get user's weekly horoscope (this would use your astrology service)
      const horoscope = await this.generateWeeklyHoroscope(user);
      await notificationScheduler.scheduleWeeklyHoroscope(user, horoscope);
    } catch (error) {
      console.error(`Failed to send weekly horoscope for user ${user.id}:`, error);
    }
  }

  /**
   * Send playlist notification to user
   */
  private async sendPlaylistNotification(user: User): Promise<void> {
    try {
      // Generate weekly playlist notification
      const playlistData = {
        theme: 'Weekly Cosmic Vibes',
        summary: 'Your personalized weekly playlist is ready!',
        userId: user.id,
      };
      await notificationScheduler.schedulePlaylistAlert(user, playlistData);
    } catch (error) {
      console.error(`Failed to send playlist notification for user ${user.id}:`, error);
    }
  }

  /**
   * Get user's local time based on their timezone
   */
  private getUserLocalTime(user: User): Date {
    // Use user's timezone from birth data if available
    const timezone = user.timezone || 'UTC';
    return new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
  }

  /**
   * Generate daily transit data for user
   * (This is a placeholder - would integrate with your astrology service)
   */
  private async generateDailyTransit(user: User): Promise<any> {
    return {
      summary: 'Mercury in harmony brings clear communication today',
      details: 'Focus on creative projects and meaningful conversations',
      energy: 'harmonious',
      recommendations: ['Express yourself creatively', 'Connect with loved ones'],
    };
  }

  /**
   * Generate weekly horoscope for user
   * (This is a placeholder - would integrate with your astrology service)
   */
  private async generateWeeklyHoroscope(user: User): Promise<any> {
    return {
      summary: 'A transformative week ahead with Venus bringing new opportunities',
      themes: ['love', 'creativity', 'growth'],
      advice: 'Stay open to unexpected connections and creative inspiration',
      energy: 'transformative',
    };
  }

  /**
   * Stop all notification intervals
   */
  stopAll(): void {
    for (const [name, interval] of this.intervals.entries()) {
      clearInterval(interval);
    }
    this.intervals.clear();
  }

  /**
   * Get users who are eligible for notifications (paid tier + opted in + have player ID)
   */
  private async getEligibleUsers(): Promise<User[]> {
    return await storage.getNotificationEligibleUsers();
  }
}

// Export singleton
export const notificationCron = new NotificationCron();

// Export startup function for server boot
export function startNotifications(): void {
  notificationCron.startDailyNotifications();
  notificationCron.startWeeklyNotifications();
  console.log('✨ OneSignal notification scheduling started - daily and weekly notifications active');
}