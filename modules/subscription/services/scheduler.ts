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
  async processDailyNotifications(): Promise<void> {
    try {
      // Get only users who are eligible for notifications (paid tier + opted in + have player ID)
      const users = await this.getEligibleUsers();
      console.log(`📊 Daily notifications check: ${users.length} eligible users found`);
      
      let sentCount = 0;
      for (const user of users) {
        // Defensive guards - ensure user is still eligible
        if (!(user as any).pushNotificationsEnabled || !(user as any).oneSignalPlayerId) {
          continue;
        }
        
        const userTz = (user as any).timezone || 'UTC';
        const now = Date.now();
        const parts = this.localParts(now, userTz);
        
        // Send at 8 AM user's time
        if (parts.hour === 8 && parts.minute < 60) {
          // Check idempotency - don't send if already sent today (using timezone-safe comparison)
          const todayKey = this.localDateKey(now, userTz);
          const lastSent = (user as any).lastDailySentAt;
          const lastSentKey = lastSent ? this.localDateKey(lastSent.getTime(), userTz) : null;
          
          if (lastSentKey !== todayKey) {
            await this.sendDailyTransit(user);
            sentCount++;
          }
        }
      }
      
      if (sentCount > 0) {
        console.log(`🌟 Daily notifications sent to ${sentCount} users`);
      }
    } catch (error) {
      console.error('Daily notification processing failed:', error);
    }
  }

  /**
   * Process weekly horoscope notifications
   */
  async processWeeklyNotifications(): Promise<void> {
    try {
      // Get only users who are eligible for notifications (paid tier + opted in + have player ID)
      const users = await this.getEligibleUsers();
      console.log(`📊 Weekly notifications check: ${users.length} eligible users found`);
      
      let sentCount = 0;
      for (const user of users) {
        // Defensive guards - ensure user is still eligible
        if (!(user as any).pushNotificationsEnabled || !(user as any).oneSignalPlayerId) {
          continue;
        }
        
        const userTz = (user as any).timezone || 'UTC';
        const now = Date.now();
        const parts = this.localParts(now, userTz);
        
        // Send on Monday at 7 AM user's time
        if (parts.weekday === 1 && parts.hour === 7 && parts.minute < 60) {
          // Check idempotency - don't send if already sent this week (using timezone-safe comparison)
          const currentWeekMonday = this.mondayKey(now, userTz);
          
          const lastSent = (user as any).lastWeeklySentAt;
          const lastSentWeekMonday = lastSent ? this.mondayKey(lastSent.getTime(), userTz) : null;
          
          if (lastSentWeekMonday !== currentWeekMonday) {
            await this.sendWeeklyHoroscope(user);
            await this.sendPlaylistNotification(user);
            
            // Update last sent timestamp for idempotency
            await storage.updateUserNotificationSettings(user.id, {
              lastWeeklySentAt: new Date()
            });
            sentCount++;
          }
        }
      }
      
      if (sentCount > 0) {
        console.log(`🌟 Weekly notifications sent to ${sentCount} users`);
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
      
      // Update last sent timestamp for idempotency
      await storage.updateUserNotificationSettings(user.id, {
        lastDailySentAt: new Date()
      });
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
    this.intervals.forEach((interval, name) => {
      clearInterval(interval);
      console.log(`🛑 Stopped ${name} notifications`);
    });
    this.intervals.clear();
  }

  /**
   * Get timezone-safe local date parts without Date constructor bugs
   */
  private localParts(epochMs: number, timezone: string): { year: number; month: number; day: number; weekday: number; hour: number; minute: number } {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    const parts = formatter.formatToParts(new Date(epochMs));
    const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    
    return {
      year: parseInt(parts.find(p => p.type === 'year')?.value || '0'),
      month: parseInt(parts.find(p => p.type === 'month')?.value || '0'),
      day: parseInt(parts.find(p => p.type === 'day')?.value || '0'),
      weekday: weekdayMap[parts.find(p => p.type === 'weekday')?.value || 'Sun'] || 0,
      hour: parseInt(parts.find(p => p.type === 'hour')?.value || '0'),
      minute: parseInt(parts.find(p => p.type === 'minute')?.value || '0')
    };
  }

  /**
   * Get user-local YYYY-MM-DD string for date comparison
   */
  private localDateKey(epochMs: number, timezone: string): string {
    const parts = this.localParts(epochMs, timezone);
    return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
  }

  /**
   * Get Monday of week in user timezone using pure arithmetic (no Date constructor)
   */
  private mondayKey(epochMs: number, timezone: string): string {
    const parts = this.localParts(epochMs, timezone);
    const daysToMonday = parts.weekday === 0 ? 6 : parts.weekday - 1; // Sun=6 days back, Mon=0 days back
    
    // Calculate Monday using pure arithmetic to avoid timezone bugs
    let mondayYear = parts.year;
    let mondayMonth = parts.month;
    let mondayDay = parts.day - daysToMonday;
    
    // Handle month rollover
    while (mondayDay <= 0) {
      mondayMonth--;
      if (mondayMonth <= 0) {
        mondayMonth = 12;
        mondayYear--;
      }
      mondayDay += this.getDaysInMonth(mondayYear, mondayMonth);
    }
    
    return `${mondayYear}-${String(mondayMonth).padStart(2, '0')}-${String(mondayDay).padStart(2, '0')}`;
  }

  /**
   * Get days in month with leap year handling
   */
  private getDaysInMonth(year: number, month: number): number {
    const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (month === 2 && this.isLeapYear(year)) return 29;
    return monthDays[month - 1] || 31;
  }

  /**
   * Check if year is leap year
   */
  private isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
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