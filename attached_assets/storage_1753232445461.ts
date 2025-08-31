import {
  users,
  chatMessages,
  horoscopes,
  premiumReports,
  userSubscriptions,
  cosmicPlaylists,
  moonPhases,
  moonRituals,
  userMoonTracking,
  journalEntries,
  onboardingSteps,
  zodiacJourneyMilestones,
  zodiacJourneyProgress,
  zodiacJourneyAchievements,
  type User,
  type UpsertUser,
  type InsertChatMessage,
  type ChatMessage,
  type Horoscope,
  type InsertHoroscope,
  type PremiumReport,
  type InsertPremiumReport,
  type UserSubscription,
  type InsertUserSubscription,
  type CosmicPlaylist,
  type InsertCosmicPlaylist,
  type MoonPhase,
  type InsertMoonPhase,
  type MoonRitual,
  type InsertMoonRitual,
  type UserMoonTracking,
  type InsertUserMoonTracking,
  type JournalEntry,
  type InsertJournalEntry,
  type OnboardingStep,
  type ZodiacJourneyMilestone,
  type InsertZodiacJourneyMilestone,
  type ZodiacJourneyProgress,
  type InsertZodiacJourneyProgress,
  type ZodiacJourneyAchievement,
  type InsertZodiacJourneyAchievement,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, or, isNull, sql, like, asc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Chat operations
  saveChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getUserChatMessages(userId: string, limit?: number): Promise<ChatMessage[]>;
  
  // Horoscope operations
  saveHoroscope(horoscope: InsertHoroscope): Promise<Horoscope>;
  getUserHoroscopeForDate(userId: string, date: string): Promise<Horoscope | undefined>;
  
  // Premium report operations
  savePremiumReport(report: InsertPremiumReport): Promise<PremiumReport>;
  getUserPremiumReports(userId: string): Promise<PremiumReport[]>;
  getPremiumReport(reportId: string, userId: string): Promise<PremiumReport | undefined>;
  
  // Profile operations
  updateUserProfile(userId: string, profileData: Partial<UpsertUser>): Promise<User>;
  
  // Subscription operations
  getUserSubscription(userId: string): Promise<UserSubscription | undefined>;
  upsertSubscription(subscription: InsertUserSubscription): Promise<UserSubscription>;
  
  // Cosmic Playlist operations
  saveCosmicPlaylist(playlist: InsertCosmicPlaylist): Promise<CosmicPlaylist>;
  getCosmicPlaylist(id: string): Promise<CosmicPlaylist | undefined>;
  getUserDailyPlaylist(userId: string): Promise<CosmicPlaylist | undefined>;
  getUserPlaylists(userId: string): Promise<CosmicPlaylist[]>;
  
  // Moon Calendar operations
  saveMoonPhase(moonPhase: InsertMoonPhase): Promise<MoonPhase>;
  getMoonPhase(date: string): Promise<MoonPhase | undefined>;
  saveMoonRitual(ritual: InsertMoonRitual): Promise<MoonRitual>;
  getMoonRituals(phase: string): Promise<MoonRitual[]>;
  saveUserMoonTracking(tracking: InsertUserMoonTracking): Promise<UserMoonTracking>;
  getUserMoonTracking(userId: string, date: string): Promise<UserMoonTracking | undefined>;
  getUserMoonTrackingHistory(userId: string, limit?: number): Promise<UserMoonTracking[]>;
  
  // Journal operations
  saveJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  getUserJournalEntries(userId: string, limit?: number, tag?: string): Promise<JournalEntry[]>;
  getJournalEntry(id: string, userId: string): Promise<JournalEntry | undefined>;
  updateJournalEntry(id: string, userId: string, entry: Partial<InsertJournalEntry>): Promise<JournalEntry>;
  deleteJournalEntry(id: string, userId: string): Promise<boolean>;
  getUserJournalTags(userId: string): Promise<Array<{ tag: string; count: number }>>;
  
  // Onboarding operations
  getOnboardingSteps(userId: string): Promise<OnboardingStep[]>;
  initializeOnboardingSteps(userId: string): Promise<void>;
  markOnboardingStepComplete(userId: string, stepKey: string): Promise<void>;
  checkAndUpdateOnboardingProgress(userId: string): Promise<void>;
  
  // Zodiac Journey operations
  getZodiacJourneyProgress(userId: string): Promise<ZodiacJourneyProgress | undefined>;
  initializeZodiacJourney(userId: string): Promise<void>;
  getZodiacMilestones(userId: string, type?: string): Promise<ZodiacJourneyMilestone[]>;
  unlockZodiacMilestone(userId: string, milestoneKey: string): Promise<void>;
  completeZodiacMilestone(userId: string, milestoneKey: string): Promise<void>;
  updateZodiacProgress(userId: string, updates: Partial<InsertZodiacJourneyProgress>): Promise<ZodiacJourneyProgress>;
  getZodiacAchievements(userId: string): Promise<ZodiacJourneyAchievement[]>;
  unlockZodiacAchievement(userId: string, achievementKey: string, experienceReward: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Chat operations
  async updateUserProfile(userId: string, profileData: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...profileData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async saveChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    // Ensure ID is generated - InsertChatMessage should already have id as optional
    const dataToInsert: InsertChatMessage = {
      ...messageData,
      ...(!(messageData as any).id ? { id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` } : {})
    };
    
    const [message] = await db
      .insert(chatMessages)
      .values(dataToInsert)
      .returning();
    return message;
  }

  async getUserChatMessages(userId: string, limit = 50): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  // Horoscope operations
  async saveHoroscope(horoscopeData: InsertHoroscope): Promise<Horoscope> {
    const [horoscope] = await db
      .insert(horoscopes)
      .values(horoscopeData)
      .onConflictDoUpdate({
        target: [horoscopes.userId, horoscopes.date],
        set: horoscopeData,
      })
      .returning();
    return horoscope;
  }

  async getUserHoroscopeForDate(userId: string, date: string): Promise<Horoscope | undefined> {
    const [horoscope] = await db
      .select()
      .from(horoscopes)
      .where(and(
        eq(horoscopes.userId, userId),
        eq(horoscopes.date, date)
      ));
    return horoscope;
  }

  // Premium report operations
  async savePremiumReport(reportData: InsertPremiumReport): Promise<PremiumReport> {
    // Ensure ID is generated if not provided
    const dataWithId = {
      ...reportData,
      id: reportData.id || `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    const [report] = await db
      .insert(premiumReports)
      .values(dataWithId)
      .returning();
    return report;
  }

  async getUserPremiumReports(userId: string): Promise<PremiumReport[]> {
    return await db
      .select()
      .from(premiumReports)
      .where(eq(premiumReports.userId, userId))
      .orderBy(desc(premiumReports.createdAt));
  }

  async getPremiumReport(reportId: string, userId: string): Promise<PremiumReport | undefined> {
    const [report] = await db
      .select()
      .from(premiumReports)
      .where(and(
        eq(premiumReports.id, reportId),
        eq(premiumReports.userId, userId)
      ));
    return report;
  }

  // Subscription operations
  async getUserSubscription(userId: string): Promise<UserSubscription | undefined> {
    const [subscription] = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))
      .orderBy(desc(userSubscriptions.createdAt))
      .limit(1);
    return subscription;
  }

  async upsertSubscription(subscriptionData: InsertUserSubscription): Promise<UserSubscription> {
    const [subscription] = await db
      .insert(userSubscriptions)
      .values(subscriptionData)
      .onConflictDoUpdate({
        target: userSubscriptions.userId,
        set: {
          ...subscriptionData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return subscription;
  }

  // Cosmic Playlist operations
  async saveCosmicPlaylist(playlistData: InsertCosmicPlaylist): Promise<CosmicPlaylist> {
    const dataWithId = {
      ...playlistData,
      id: playlistData.id || `playlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    const [playlist] = await db
      .insert(cosmicPlaylists)
      .values(dataWithId)
      .returning();
    return playlist;
  }

  async getUserDailyPlaylist(userId: string): Promise<CosmicPlaylist | undefined> {
    const today = new Date().toISOString().split('T')[0];
    const startOfDay = new Date(today + 'T00:00:00Z');
    const endOfDay = new Date(today + 'T23:59:59Z');
    
    const [playlist] = await db
      .select()
      .from(cosmicPlaylists)
      .where(and(
        eq(cosmicPlaylists.userId, userId),
        and(
          gte(cosmicPlaylists.generatedAt, startOfDay),
          lte(cosmicPlaylists.generatedAt, endOfDay)
        )
      ))
      .orderBy(desc(cosmicPlaylists.generatedAt))
      .limit(1);
    return playlist;
  }

  async getUserPlaylists(userId: string): Promise<CosmicPlaylist[]> {
    return await db
      .select()
      .from(cosmicPlaylists)
      .where(eq(cosmicPlaylists.userId, userId))
      .orderBy(desc(cosmicPlaylists.generatedAt))
      .limit(10);
  }

  async getCosmicPlaylist(id: string): Promise<CosmicPlaylist | undefined> {
    const [playlist] = await db
      .select()
      .from(cosmicPlaylists)
      .where(eq(cosmicPlaylists.id, id));
    return playlist;
  }

  async updateCosmicPlaylistSpotifyUrl(id: string, spotifyUrl: string): Promise<void> {
    await db
      .update(cosmicPlaylists)
      .set({ spotifyUrl })
      .where(eq(cosmicPlaylists.id, id));
  }

  // Moon Calendar operations
  async saveMoonPhase(moonPhaseData: InsertMoonPhase): Promise<MoonPhase> {
    const dataWithId = {
      ...moonPhaseData,
      id: moonPhaseData.id || `moon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    const [moonPhase] = await db
      .insert(moonPhases)
      .values(dataWithId)
      .onConflictDoNothing()
      .returning();
    return moonPhase;
  }

  async getMoonPhase(date: string): Promise<MoonPhase | undefined> {
    const [moonPhase] = await db
      .select()
      .from(moonPhases)
      .where(eq(moonPhases.date, date));
    return moonPhase;
  }

  async saveMoonRitual(ritualData: InsertMoonRitual): Promise<MoonRitual> {
    const dataWithId = {
      ...ritualData,
      id: ritualData.id || `ritual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    const [ritual] = await db
      .insert(moonRituals)
      .values(dataWithId)
      .returning();
    return ritual;
  }

  async getMoonRituals(phase: string): Promise<MoonRitual[]> {
    // Get rituals that are either generic (no moonPhaseId) or for specific phases
    return await db
      .select()
      .from(moonRituals)
      .where(isNull(moonRituals.moonPhaseId)) // For now, just get generic rituals
      .limit(10);
  }

  async getPersonalizedMoonRituals(userId: string, phase: string): Promise<MoonRitual[]> {
    // Get personalized rituals for this user and phase
    return await db
      .select()
      .from(moonRituals)
      .where(and(
        eq(moonRituals.userId, userId),
        eq(moonRituals.isPersonalized, true)
      ))
      .limit(5);
  }

  async saveUserMoonTracking(trackingData: InsertUserMoonTracking): Promise<UserMoonTracking> {
    const dataWithId = {
      ...trackingData,
      id: trackingData.id || `tracking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    const [tracking] = await db
      .insert(userMoonTracking)
      .values(dataWithId)
      .onConflictDoUpdate({
        target: [userMoonTracking.userId, userMoonTracking.moonPhaseId],
        set: {
          journalEntry: dataWithId.journalEntry,
          mood: dataWithId.mood,
          energy: dataWithId.energy,
          intentions: dataWithId.intentions,
          dreams: dataWithId.dreams,
          synchronicities: dataWithId.synchronicities,
        }
      })
      .returning();
    return tracking;
  }

  async getUserMoonTracking(userId: string, date: string): Promise<UserMoonTracking | undefined> {
    const [tracking] = await db
      .select()
      .from(userMoonTracking)
      .innerJoin(moonPhases, eq(userMoonTracking.moonPhaseId, moonPhases.id))
      .where(and(
        eq(userMoonTracking.userId, userId),
        eq(moonPhases.date, date)
      ));
    return tracking;
  }

  async getUserMoonTrackingHistory(userId: string, limit: number = 10): Promise<UserMoonTracking[]> {
    return await db
      .select()
      .from(userMoonTracking)
      .where(eq(userMoonTracking.userId, userId))
      .orderBy(desc(userMoonTracking.createdAt))
      .limit(limit);
  }

  // Journal operations
  async saveJournalEntry(entryData: InsertJournalEntry): Promise<JournalEntry> {
    const dataWithId = {
      ...entryData,
      id: entryData.id || `journal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    const [entry] = await db
      .insert(journalEntries)
      .values(dataWithId)
      .returning();
    return entry;
  }

  async getUserJournalEntries(userId: string, limit: number = 50, tag?: string, mood?: string): Promise<JournalEntry[]> {
    let whereCondition = eq(journalEntries.userId, userId);
    
    if (tag) {
      // Filter by specific tag using PostgreSQL array contains operator (case-insensitive)
      whereCondition = and(
        whereCondition,
        sql`LOWER(${tag}) = ANY(ARRAY(SELECT LOWER(unnest(${journalEntries.tags}))))`
      ) as any;
    }

    if (mood) {
      // Filter by mood (case-insensitive)
      whereCondition = and(
        whereCondition,
        sql`LOWER(${journalEntries.mood}) = LOWER(${mood})`
      ) as any;
    }
    
    return await db
      .select()
      .from(journalEntries)
      .where(whereCondition)
      .orderBy(desc(journalEntries.createdAt))
      .limit(limit);
  }

  async getUserJournalTags(userId: string): Promise<Array<{ tag: string; count: number }>> {
    // Get all journal entries with tags for this user
    const entries = await db
      .select({ tags: journalEntries.tags })
      .from(journalEntries)
      .where(and(
        eq(journalEntries.userId, userId),
        sql`${journalEntries.tags} IS NOT NULL AND array_length(${journalEntries.tags}, 1) > 0`
      ));

    // Process tags and count frequencies
    const tagCounts: Record<string, number> = {};
    
    entries.forEach(entry => {
      if (entry.tags && Array.isArray(entry.tags) && entry.tags.length > 0) {
        entry.tags.forEach(tag => {
          if (typeof tag === 'string' && tag.trim()) {
            const normalizedTag = tag.trim().toLowerCase();
            tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1;
          }
        });
      }
    });

    // Convert to array and sort by frequency
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }

  async getJournalEntry(id: string, userId: string): Promise<JournalEntry | undefined> {
    const [entry] = await db
      .select()
      .from(journalEntries)
      .where(and(
        eq(journalEntries.id, id),
        eq(journalEntries.userId, userId)
      ));
    return entry;
  }

  async updateJournalEntry(id: string, userId: string, entryData: Partial<InsertJournalEntry>): Promise<JournalEntry> {
    const [entry] = await db
      .update(journalEntries)
      .set({
        ...entryData,
        updatedAt: new Date(),
      })
      .where(and(
        eq(journalEntries.id, id),
        eq(journalEntries.userId, userId)
      ))
      .returning();
    return entry;
  }

  async deleteJournalEntry(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(journalEntries)
      .where(and(
        eq(journalEntries.id, id),
        eq(journalEntries.userId, userId)
      ));
    return result.rowCount > 0;
  }
  // Timeline operations
  async getTimelineEvents(userId: string, filter?: string, startDate?: Date, endDate?: Date): Promise<any[]> {
    const events: any[] = [];
    
    // Get journal entries
    if (!filter || filter === 'all' || filter === 'journal') {
      try {
        const whereConditions = [eq(journalEntries.userId, userId)];
        if (startDate) whereConditions.push(gte(journalEntries.createdAt, startDate));
        if (endDate) whereConditions.push(lte(journalEntries.createdAt, endDate));
        
        const journalData = await db.select().from(journalEntries)
          .where(and(...whereConditions))
          .orderBy(desc(journalEntries.createdAt))
          .limit(100);

        events.push(...journalData.map(entry => ({
          id: entry.id,
          type: 'journal',
          title: entry.title || 'Journal Entry',
          content: entry.content,
          date: entry.createdAt.toISOString(),
          mood: entry.mood,
          energy: entry.energy,
          tags: entry.tags,
          metadata: {
            source: entry.source,
            astro_context: `Energy level: ${entry.energy || 'Unknown'}`
          }
        })));
      } catch (error) {
        console.log('Error fetching journal entries:', error);
      }
    }

    // Get cosmic playlists
    if (!filter || filter === 'all' || filter === 'cosmic_playlist') {
      try {
        const whereConditions = [eq(cosmicPlaylists.userId, userId)];
        if (startDate) whereConditions.push(gte(cosmicPlaylists.generatedAt, startDate));
        if (endDate) whereConditions.push(lte(cosmicPlaylists.generatedAt, endDate));
        
        const playlistData = await db.select().from(cosmicPlaylists)
          .where(and(...whereConditions))
          .orderBy(desc(cosmicPlaylists.generatedAt))
          .limit(50);

        events.push(...playlistData.map(playlist => ({
          id: playlist.id,
          type: 'cosmic_playlist',
          title: playlist.name || 'Cosmic Playlist',
          content: playlist.description,
          date: playlist.generatedAt.toISOString(),
          mood: playlist.energy_level,
          tags: playlist.genres,
          metadata: {
            astro_context: playlist.astrological_context,
            moon_phase: playlist.moon_phase
          }
        })));
      } catch (error) {
        console.log('Error fetching cosmic playlists:', error);
      }
    }

    // Get chat messages (group by session)
    if (!filter || filter === 'all' || filter === 'chat_session') {
      try {
        const whereConditions = [eq(chatMessages.userId, userId)];
        if (startDate) whereConditions.push(gte(chatMessages.createdAt, startDate));
        if (endDate) whereConditions.push(lte(chatMessages.createdAt, endDate));
        
        const chatData = await db.select()
          .from(chatMessages)
          .where(and(...whereConditions))
          .orderBy(desc(chatMessages.createdAt))
          .limit(100);

        // Group chat messages by date on the application side
        const chatByDate = new Map<string, any[]>();
        chatData.forEach(msg => {
          const dateKey = msg.createdAt.toISOString().split('T')[0];
          if (!chatByDate.has(dateKey)) {
            chatByDate.set(dateKey, []);
          }
          chatByDate.get(dateKey)!.push(msg);
        });

        // Convert to timeline events
        for (const [date, messages] of chatByDate.entries()) {
          if (messages.length > 0) {
            const lastMessage = messages[0]; // Already ordered by desc
            events.push({
              id: `chat_${date}`,
              type: 'chat_session',
              title: `AI Conversation Session`,
              content: `${messages.length} messages exchanged. Latest: ${lastMessage.content?.substring(0, 100)}...`,
              date: new Date(date + 'T12:00:00Z').toISOString(),
              metadata: {
                astro_context: `${messages.length} messages`
              }
            });
          }
        }
      } catch (error) {
        console.log('Error fetching chat sessions:', error);
      }
    }

    // Get lunar insights (from journal entries with lunar source)
    if (!filter || filter === 'all' || filter === 'lunar_insight') {
      try {
        const whereConditions = [
          eq(journalEntries.userId, userId), 
          or(
            eq(journalEntries.source, 'lunar_insights'),
            eq(journalEntries.source, 'lunar_energy'),
            eq(journalEntries.source, 'moon_calendar'),
            like(journalEntries.title, '%Lunar%'),
            like(journalEntries.title, '%Moon%'),
            like(journalEntries.content, '%lunar energy%')
          )
        ];
        if (startDate) whereConditions.push(gte(journalEntries.createdAt, startDate));
        if (endDate) whereConditions.push(lte(journalEntries.createdAt, endDate));
        
        const lunarData = await db.select().from(journalEntries)
          .where(and(...whereConditions))
          .orderBy(desc(journalEntries.createdAt))
          .limit(50);

        events.push(...lunarData.map(entry => ({
          id: entry.id,
          type: 'lunar_insight',
          title: entry.title || 'Lunar Energy Insight',
          content: entry.content,
          date: entry.createdAt.toISOString(),
          mood: entry.mood,
          energy: entry.energy,
          tags: entry.tags,
          metadata: {
            source: entry.source || 'lunar_insights',
            astro_context: 'Moon phase energy recommendations'
          }
        })));
      } catch (error) {
        console.log('Error fetching lunar insights:', error);
      }
    }

    // Get cosmic events (from cosmic memory events endpoint)
    if (!filter || filter === 'all' || filter === 'cosmic_event') {
      try {
        // Generate cosmic events for the date range
        const cosmicEvents = [
          {
            id: 'moon_2025-07-20',
            type: 'cosmic_event',
            title: 'Last Quarter Moon',
            content: 'Last Quarter Moon in Aries - Time for release and letting go. This powerful lunar phase encourages breaking free from what no longer serves your highest good.',
            date: new Date('2025-07-20T12:00:00Z').toISOString(),
            metadata: {
              moon_phase: 'Last Quarter',
              astro_context: '50% illuminated',
              significance: 'Release and transformation energy'
            }
          },
          {
            id: 'moon_2025-07-21',
            type: 'cosmic_event',
            title: 'Waning Crescent Moon',
            content: 'Waning Crescent Moon - The moon continues to decrease, perfect for reflection and planning your next lunar cycle.',
            date: new Date('2025-07-21T12:00:00Z').toISOString(),
            metadata: {
              moon_phase: 'Waning Crescent',
              astro_context: '40% illuminated',
              significance: 'Reflection and preparation'
            }
          }
        ];

        // Filter cosmic events by date range
        const filteredEvents = cosmicEvents.filter(event => {
          const eventDate = new Date(event.date);
          const inRange = (!startDate || eventDate >= startDate) && (!endDate || eventDate <= endDate);
          return inRange;
        });

        events.push(...filteredEvents);
      } catch (error) {
        console.log('Error generating cosmic events:', error);
      }
    }

    // Get moon rituals (recommended rituals for current moon phase)
    if (!filter || filter === 'all' || filter === 'recommended_ritual') {
      try {
        const whereConditions = [];
        if (startDate) whereConditions.push(gte(moonRituals.createdAt, startDate));
        if (endDate) whereConditions.push(lte(moonRituals.createdAt, endDate));
        
        const ritualData = await db.select().from(moonRituals)
          .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
          .orderBy(desc(moonRituals.createdAt))
          .limit(30);

        events.push(...ritualData.map(ritual => ({
          id: ritual.id,
          type: 'recommended_ritual',
          title: ritual.title || `${ritual.moonPhase} Moon Ritual`,
          content: ritual.description,
          date: ritual.createdAt.toISOString(),
          metadata: {
            moon_phase: ritual.moonPhase,
            astro_context: `Ritual for ${ritual.moonPhase} moon`,
            type: ritual.type,
            duration: ritual.duration
          }
        })));
      } catch (error) {
        console.log('Error fetching moon rituals:', error);
      }
    }

    // Get personalized lunar energy from user moon tracking
    if (!filter || filter === 'all' || filter === 'personalized_lunar_energy') {
      try {
        const whereConditions = [eq(userMoonTracking.userId, userId)];
        if (startDate) whereConditions.push(gte(userMoonTracking.date, startDate.toISOString().split('T')[0]));
        if (endDate) whereConditions.push(lte(userMoonTracking.date, endDate.toISOString().split('T')[0]));
        
        const trackingData = await db.select().from(userMoonTracking)
          .where(and(...whereConditions))
          .orderBy(desc(userMoonTracking.date))
          .limit(30);

        events.push(...trackingData.map(tracking => ({
          id: tracking.id,
          type: 'personalized_lunar_energy',
          title: `Personal Lunar Energy - ${tracking.moonPhase}`,
          content: `Energy level: ${tracking.energyLevel}/10. Mood: ${tracking.mood || 'Not recorded'}. ${tracking.notes ? 'Notes: ' + tracking.notes : ''}`,
          date: new Date(tracking.date + 'T12:00:00Z').toISOString(),
          mood: tracking.mood,
          energy: tracking.energyLevel,
          metadata: {
            moon_phase: tracking.moonPhase,
            astro_context: `Personal energy tracking for ${tracking.moonPhase}`,
            energy_level: tracking.energyLevel,
            notes: tracking.notes
          }
        })));
      } catch (error) {
        console.log('Error fetching personalized lunar energy:', error);
      }
    }

    // Sort all events by date
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Onboarding Operations
  async getOnboardingSteps(userId: string): Promise<OnboardingStep[]> {
    return await db.select().from(onboardingSteps)
      .where(eq(onboardingSteps.userId, userId))
      .orderBy(asc(onboardingSteps.order));
  }

  async initializeOnboardingSteps(userId: string): Promise<void> {
    const defaultSteps = [
      { stepKey: "profile_setup", title: "Complete Your Astrological Profile", description: "Set up your birth chart with date, time, and location", category: "setup", order: 1 },
      { stepKey: "first_chat", title: "Have Your First AI Conversation", description: "Chat with our AI astrologer for personalized insights", category: "setup", order: 2 },
      { stepKey: "first_journal", title: "Write Your First Journal Entry", description: "Start documenting your cosmic journey", category: "exploration", order: 3 },
      { stepKey: "first_playlist", title: "Generate Your First Cosmic Playlist", description: "Create music that matches your astrological energy", category: "exploration", order: 4 },
      { stepKey: "moon_tracking", title: "Track a Moon Phase", description: "Record your energy and mood with lunar cycles", category: "exploration", order: 5 },
      { stepKey: "cosmic_memory", title: "Explore Your Cosmic Memory Lane", description: "View your timeline of astrological experiences", category: "mastery", order: 6 },
    ];

    for (const step of defaultSteps) {
      const stepId = `onboarding_${userId}_${step.stepKey}`;
      await db.insert(onboardingSteps).values({
        id: stepId,
        userId,
        stepKey: step.stepKey,
        stepTitle: step.title,
        stepDescription: step.description,
        category: step.category as "setup" | "exploration" | "mastery",
        order: step.order,
        isCompleted: false,
      }).onConflictDoNothing();
    }
  }

  async markOnboardingStepComplete(userId: string, stepKey: string): Promise<void> {
    await db.update(onboardingSteps)
      .set({ 
        isCompleted: true, 
        completedAt: new Date() 
      })
      .where(and(
        eq(onboardingSteps.userId, userId),
        eq(onboardingSteps.stepKey, stepKey)
      ));
  }

  async checkAndUpdateOnboardingProgress(userId: string): Promise<void> {
    // Check if user has completed profile setup
    const user = await this.getUser(userId);
    if (user?.sunSign && user?.moonSign && user?.risingSign) {
      await this.markOnboardingStepComplete(userId, "profile_setup");
    }

    // Check if user has chat messages
    const chatMessages = await db.select().from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .limit(1);
    if (chatMessages.length > 0) {
      await this.markOnboardingStepComplete(userId, "first_chat");
    }

    // Check if user has journal entries
    const journalEntries = await db.select().from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .limit(1);
    if (journalEntries.length > 0) {
      await this.markOnboardingStepComplete(userId, "first_journal");
    }

    // Check if user has cosmic playlists
    const playlists = await db.select().from(cosmicPlaylists)
      .where(eq(cosmicPlaylists.userId, userId))
      .limit(1);
    if (playlists.length > 0) {
      await this.markOnboardingStepComplete(userId, "first_playlist");
    }

    // Check if user has moon tracking data
    const moonTracking = await db.select().from(userMoonTracking)
      .where(eq(userMoonTracking.userId, userId))
      .limit(1);
    if (moonTracking.length > 0) {
      await this.markOnboardingStepComplete(userId, "moon_tracking");
    }
  }

  // Zodiac Journey Operations
  async getZodiacJourneyProgress(userId: string): Promise<ZodiacJourneyProgress | undefined> {
    const [progress] = await db.select().from(zodiacJourneyProgress)
      .where(eq(zodiacJourneyProgress.userId, userId));
    return progress;
  }

  async initializeZodiacJourney(userId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;

    // Create initial progress record
    const progressId = `progress_${userId}`;
    await db.insert(zodiacJourneyProgress).values({
      id: progressId,
      userId,
      totalExperiencePoints: 0,
      currentLevel: 1,
      currentTitle: "Cosmic Novice",
      sunSignMastery: 0,
      moonSignMastery: 0,
      risingSignMastery: 0,
      planetaryAwareness: 0,
      lunarConnection: 0,
      seasonalAlignment: 0,
    }).onConflictDoNothing();

    // Initialize milestones based on user's signs
    const milestones = [
      // Sun Sign Milestones
      { key: "sun_sign_discovery", title: `Discover Your ${user.sunSign} Sun Sign`, description: `Learn about your ${user.sunSign} solar identity and core traits`, type: "sun_sign", zodiacSign: user.sunSign, difficulty: 1, xp: 50 },
      { key: "sun_sign_strengths", title: `Master ${user.sunSign} Strengths`, description: `Understand and harness your natural ${user.sunSign} abilities`, type: "sun_sign", zodiacSign: user.sunSign, difficulty: 2, xp: 100 },
      { key: "sun_sign_challenges", title: `Navigate ${user.sunSign} Challenges`, description: `Learn to work with your ${user.sunSign} shadow aspects`, type: "sun_sign", zodiacSign: user.sunSign, difficulty: 3, xp: 150 },
      
      // Moon Sign Milestones
      { key: "moon_sign_discovery", title: `Explore Your ${user.moonSign} Moon Sign`, description: `Understand your ${user.moonSign} emotional nature and needs`, type: "moon_sign", zodiacSign: user.moonSign, difficulty: 1, xp: 50 },
      { key: "moon_sign_emotions", title: `Master ${user.moonSign} Emotions`, description: `Learn to work with your ${user.moonSign} emotional patterns`, type: "moon_sign", zodiacSign: user.moonSign, difficulty: 2, xp: 100 },
      { key: "moon_cycle_connection", title: "Connect with Lunar Cycles", description: "Track your energy with moon phases for 30 days", type: "lunar", difficulty: 3, xp: 200 },
      
      // Rising Sign Milestones
      { key: "rising_sign_discovery", title: `Understand Your ${user.risingSign} Rising Sign`, description: `Learn about your ${user.risingSign} outer personality and first impressions`, type: "rising_sign", zodiacSign: user.risingSign, difficulty: 1, xp: 50 },
      { key: "rising_sign_expression", title: `Express Your ${user.risingSign} Ascendant`, description: `Align your outer expression with your ${user.risingSign} rising sign`, type: "rising_sign", zodiacSign: user.risingSign, difficulty: 2, xp: 100 },
      
      // Planetary Milestones
      { key: "mercury_communication", title: "Master Mercury Communication", description: "Understand your communication style and thinking patterns", type: "planetary", planetaryBody: "mercury", difficulty: 2, xp: 75 },
      { key: "venus_relationships", title: "Explore Venus in Love", description: "Learn about your relationship and aesthetic preferences", type: "planetary", planetaryBody: "venus", difficulty: 2, xp: 75 },
      { key: "mars_action", title: "Channel Mars Energy", description: "Understand your drive, passion, and action style", type: "planetary", planetaryBody: "mars", difficulty: 2, xp: 75 },
      
      // Seasonal Milestones
      { key: "spring_equinox", title: "Spring Awakening", description: "Align with the energy of new beginnings", type: "seasonal", difficulty: 1, xp: 25 },
      { key: "summer_solstice", title: "Summer Radiance", description: "Embrace peak energy and manifestation", type: "seasonal", difficulty: 1, xp: 25 },
      { key: "autumn_equinox", title: "Autumn Reflection", description: "Practice gratitude and release", type: "seasonal", difficulty: 1, xp: 25 },
      { key: "winter_solstice", title: "Winter Wisdom", description: "Embrace introspection and planning", type: "seasonal", difficulty: 1, xp: 25 },
    ];

    for (const milestone of milestones) {
      const milestoneId = `milestone_${userId}_${milestone.key}`;
      await db.insert(zodiacJourneyMilestones).values({
        id: milestoneId,
        userId,
        milestoneKey: milestone.key,
        milestoneTitle: milestone.title,
        milestoneDescription: milestone.description,
        milestoneType: milestone.type,
        zodiacSign: milestone.zodiacSign || null,
        planetaryBody: milestone.planetaryBody || null,
        difficultyLevel: milestone.difficulty,
        experiencePoints: milestone.xp,
        isUnlocked: milestone.difficulty === 1, // Auto-unlock difficulty 1 milestones
        isCompleted: false,
      }).onConflictDoNothing();
    }
  }

  async getZodiacMilestones(userId: string, type?: string): Promise<ZodiacJourneyMilestone[]> {
    let query = db.select().from(zodiacJourneyMilestones)
      .where(eq(zodiacJourneyMilestones.userId, userId));
    
    if (type && type !== "all") {
      query = query.where(and(
        eq(zodiacJourneyMilestones.userId, userId),
        eq(zodiacJourneyMilestones.milestoneType, type)
      ));
    }
    
    return await query.orderBy(asc(zodiacJourneyMilestones.difficultyLevel));
  }

  async unlockZodiacMilestone(userId: string, milestoneKey: string): Promise<void> {
    await db.update(zodiacJourneyMilestones)
      .set({ isUnlocked: true })
      .where(and(
        eq(zodiacJourneyMilestones.userId, userId),
        eq(zodiacJourneyMilestones.milestoneKey, milestoneKey)
      ));
  }

  async completeZodiacMilestone(userId: string, milestoneKey: string): Promise<void> {
    // Mark milestone complete
    await db.update(zodiacJourneyMilestones)
      .set({ 
        isCompleted: true, 
        completedAt: new Date() 
      })
      .where(and(
        eq(zodiacJourneyMilestones.userId, userId),
        eq(zodiacJourneyMilestones.milestoneKey, milestoneKey)
      ));

    // Get milestone details for XP calculation
    const [milestone] = await db.select().from(zodiacJourneyMilestones)
      .where(and(
        eq(zodiacJourneyMilestones.userId, userId),
        eq(zodiacJourneyMilestones.milestoneKey, milestoneKey)
      ));

    if (milestone) {
      // Update progress
      const currentProgress = await this.getZodiacJourneyProgress(userId);
      if (currentProgress) {
        const newXP = currentProgress.totalExperiencePoints + milestone.experiencePoints;
        const newLevel = Math.floor(newXP / 500) + 1; // 500 XP per level
        
        let newTitle = "Cosmic Novice";
        if (newLevel >= 10) newTitle = "Zodiac Master";
        else if (newLevel >= 7) newTitle = "Stellar Navigator";
        else if (newLevel >= 5) newTitle = "Planetary Apprentice";
        else if (newLevel >= 3) newTitle = "Lunar Initiate";
        else if (newLevel >= 2) newTitle = "Star Seeker";

        await this.updateZodiacProgress(userId, {
          totalExperiencePoints: newXP,
          currentLevel: newLevel,
          currentTitle: newTitle,
        });
      }
    }
  }

  async updateZodiacProgress(userId: string, updates: Partial<InsertZodiacJourneyProgress>): Promise<ZodiacJourneyProgress> {
    const [progress] = await db.update(zodiacJourneyProgress)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(zodiacJourneyProgress.userId, userId))
      .returning();
    return progress;
  }

  async getZodiacAchievements(userId: string): Promise<ZodiacJourneyAchievement[]> {
    return await db.select().from(zodiacJourneyAchievements)
      .where(eq(zodiacJourneyAchievements.userId, userId))
      .orderBy(desc(zodiacJourneyAchievements.unlockedAt));
  }

  async unlockZodiacAchievement(userId: string, achievementKey: string, experienceReward: number): Promise<void> {
    const achievementId = `achievement_${userId}_${achievementKey}`;
    await db.insert(zodiacJourneyAchievements).values({
      id: achievementId,
      userId,
      achievementKey,
      achievementTitle: this.getAchievementTitle(achievementKey),
      achievementDescription: this.getAchievementDescription(achievementKey),
      achievementIcon: this.getAchievementIcon(achievementKey),
      rarity: this.getAchievementRarity(achievementKey),
      experienceReward,
    }).onConflictDoNothing();

    // Add XP reward
    const currentProgress = await this.getZodiacJourneyProgress(userId);
    if (currentProgress) {
      await this.updateZodiacProgress(userId, {
        totalExperiencePoints: currentProgress.totalExperiencePoints + experienceReward,
      });
    }
  }

  private getAchievementTitle(key: string): string {
    const titles: Record<string, string> = {
      first_milestone: "First Steps",
      sun_master: "Solar Champion",
      moon_master: "Lunar Guardian",
      rising_master: "Ascendant Sage",
      planetary_explorer: "Planetary Explorer",
      seasonal_harmonist: "Seasonal Harmonist",
      milestone_collector: "Milestone Collector",
      experience_seeker: "Experience Seeker",
    };
    return titles[key] || "Cosmic Achievement";
  }

  private getAchievementDescription(key: string): string {
    const descriptions: Record<string, string> = {
      first_milestone: "Completed your first zodiac milestone",
      sun_master: "Mastered all sun sign milestones",
      moon_master: "Completed all moon-related journeys",
      rising_master: "Perfected your rising sign expression",
      planetary_explorer: "Explored all planetary influences",
      seasonal_harmonist: "Aligned with all seasonal energies",
      milestone_collector: "Completed 10 milestones",
      experience_seeker: "Earned 1000 experience points",
    };
    return descriptions[key] || "A special cosmic achievement";
  }

  private getAchievementIcon(key: string): string {
    const icons: Record<string, string> = {
      first_milestone: "star",
      sun_master: "sun",
      moon_master: "moon",
      rising_master: "sunrise",
      planetary_explorer: "planet",
      seasonal_harmonist: "leaf",
      milestone_collector: "trophy",
      experience_seeker: "zap",
    };
    return icons[key] || "star";
  }

  private getAchievementRarity(key: string): string {
    const rarities: Record<string, string> = {
      first_milestone: "common",
      sun_master: "rare",
      moon_master: "rare",
      rising_master: "rare",
      planetary_explorer: "epic",
      seasonal_harmonist: "epic",
      milestone_collector: "legendary",
      experience_seeker: "legendary",
    };
    return rarities[key] || "common";
  }

  async getCosmicEvents(range: string): Promise<any[]> {
    // Calculate moon phases and significant astrological events
    const now = new Date();
    let startDate: Date;
    
    switch (range) {
      case '1month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case '1year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(2020, 0, 1);
    }

    const events: any[] = [];
    
    // Generate significant moon phases within the range
    const current = new Date(startDate);
    while (current <= now) {
      const { calculateMoonPhase } = await import('./services/moonCalendar');
      const moonPhase = calculateMoonPhase(current);
      
      // Add new moon and full moon events
      if (moonPhase.illumination < 0.05 || moonPhase.illumination > 0.95) {
        events.push({
          id: `moon_${current.toISOString().split('T')[0]}`,
          type: moonPhase.illumination < 0.05 ? 'new_moon' : 'full_moon',
          title: moonPhase.illumination < 0.05 ? 'New Moon' : 'Full Moon',
          date: current.toISOString(),
          description: `${moonPhase.phase} - ${Math.round(moonPhase.illumination * 100)}% illuminated`,
          significance: moonPhase.illumination < 0.05 ? 
            'Perfect time for new beginnings and setting intentions' : 
            'Peak lunar energy for manifestation and completion'
        });
      }
      
      current.setDate(current.getDate() + 1);
    }
    
    return events.slice(0, 20); // Limit to most recent events
  }
}

export const storage = new DatabaseStorage();