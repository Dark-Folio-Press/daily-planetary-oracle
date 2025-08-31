import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  date,
  time,
  decimal,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username").unique(),
  bio: text("bio"),
  
  // Birth data for astrology calculations
  dateOfBirth: date("date_of_birth"),
  timeOfBirth: time("time_of_birth"),
  locationOfBirth: varchar("location_of_birth"),
  latitude: decimal("latitude", { precision: 10, scale: 6 }),
  longitude: decimal("longitude", { precision: 10, scale: 6 }),
  timezone: varchar("timezone"),
  
  // Calculated astrology data
  sunSign: varchar("sun_sign"),
  moonSign: varchar("moon_sign"),
  risingSign: varchar("rising_sign"),
  birthChartData: jsonb("birth_chart_data"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().notNull().$defaultFn(() => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`),
  userId: varchar("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  response: text("response"),
  isFromUser: varchar("is_from_user").notNull(), // 'true' or 'false'
  createdAt: timestamp("created_at").defaultNow(),
});

export const horoscopes = pgTable("horoscopes", {
  id: varchar("id").primaryKey().notNull().$defaultFn(() => `horoscope_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  content: text("content").notNull(),
  loveRating: varchar("love_rating"),
  careerRating: varchar("career_rating"),
  luckRating: varchar("luck_rating"),
  moonPhase: varchar("moon_phase"),
  moonSign: varchar("moon_sign"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Social sharing and posts
export const socialPosts = pgTable("social_posts", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // 'horoscope', 'chart', 'insight', 'compatibility'
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata"), // Store chart data, compatibility results, etc.
  isPublic: boolean("is_public").default(true),
  likes: integer("likes").default(0),
  shares: integer("shares").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const socialLikes = pgTable("social_likes", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  postId: varchar("post_id").notNull().references(() => socialPosts.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const socialComments = pgTable("social_comments", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  postId: varchar("post_id").notNull().references(() => socialPosts.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const socialFollows = pgTable("social_follows", {
  id: varchar("id").primaryKey().notNull(),
  followerId: varchar("follower_id").notNull().references(() => users.id),
  followingId: varchar("following_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Premium reports and analysis
export const premiumReports = pgTable("premium_reports", {
  id: varchar("id").primaryKey().notNull().$defaultFn(() => `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // 'natal_chart', 'yearly_forecast', 'compatibility', 'transit_analysis', 'solar_return'
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  reportData: jsonb("report_data"), // Detailed analysis data, charts, aspects, etc.
  generatedAt: timestamp("generated_at").defaultNow(),
  isAccessible: boolean("is_accessible").default(true),
  accessExpiresAt: timestamp("access_expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userSubscriptions = pgTable("user_subscriptions", {
  id: varchar("id").primaryKey().notNull().$defaultFn(() => `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`),
  userId: varchar("user_id").notNull().references(() => users.id),
  plan: varchar("plan").notNull(), // 'basic', 'premium', 'professional'
  status: varchar("status").notNull(), // 'active', 'cancelled', 'expired'
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  stripeCustomerId: varchar("stripe_customer_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reportTemplates = pgTable("report_templates", {
  id: varchar("id").primaryKey().notNull(),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(),
  template: text("template").notNull(), // AI prompt template
  requiredFields: jsonb("required_fields"), // List of required user data fields
  isPremium: boolean("is_premium").default(false),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Cosmic Playlist System
export const cosmicPlaylists = pgTable("cosmic_playlists", {
  id: varchar("id").primaryKey().notNull().$defaultFn(() => `playlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description"),
  astrologyContext: text("astrology_context").notNull(), // Astrological reasoning for playlist
  mood: varchar("mood").notNull(), // energetic, calming, romantic, introspective, etc.
  genres: jsonb("genres"), // Array of recommended genres
  tracks: jsonb("tracks"), // Array of track recommendations with artist, title, reasoning
  planetaryInfluence: varchar("planetary_influence"), // Primary planetary influence
  spotifyUrl: varchar("spotify_url"), // Spotify playlist URL when exported
  generatedAt: timestamp("generated_at").defaultNow(),
  validUntil: timestamp("valid_until"), // Playlists can be time-bound
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Onboarding Journey Tracking
export const onboardingSteps = pgTable("onboarding_steps", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  stepKey: varchar("step_key").notNull(), // profile_setup, first_chat, first_journal, etc.
  stepTitle: varchar("step_title").notNull(),
  stepDescription: text("step_description"),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  order: integer("order").notNull(),
  category: varchar("category").notNull(), // setup, exploration, mastery
  createdAt: timestamp("created_at").defaultNow(),
});

export type OnboardingStep = typeof onboardingSteps.$inferSelect;
export type InsertOnboardingStep = typeof onboardingSteps.$inferInsert;

// Zodiac Journey Tracker Schema
export const zodiacJourneyMilestones = pgTable("zodiac_journey_milestones", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  milestoneKey: varchar("milestone_key").notNull(), // e.g., "first_sun_reading", "moon_phase_tracking", "retrograde_experience"
  milestoneTitle: varchar("milestone_title").notNull(),
  milestoneDescription: text("milestone_description"),
  milestoneType: varchar("milestone_type").notNull(), // "sun_sign", "moon_sign", "rising_sign", "planetary", "lunar", "seasonal"
  zodiacSign: varchar("zodiac_sign"), // Associated zodiac sign if applicable
  planetaryBody: varchar("planetary_body"), // e.g., "mercury", "venus", "mars"
  difficultyLevel: integer("difficulty_level").default(1), // 1-5 scale
  experiencePoints: integer("experience_points").default(0),
  isUnlocked: boolean("is_unlocked").default(false),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const zodiacJourneyProgress = pgTable("zodiac_journey_progress", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  totalExperiencePoints: integer("total_experience_points").default(0),
  currentLevel: integer("current_level").default(1),
  currentTitle: varchar("current_title").default("Cosmic Novice"),
  sunSignMastery: integer("sun_sign_mastery").default(0), // 0-100%
  moonSignMastery: integer("moon_sign_mastery").default(0),
  risingSignMastery: integer("rising_sign_mastery").default(0),
  planetaryAwareness: integer("planetary_awareness").default(0),
  lunarConnection: integer("lunar_connection").default(0),
  seasonalAlignment: integer("seasonal_alignment").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const zodiacJourneyAchievements = pgTable("zodiac_journey_achievements", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  achievementKey: varchar("achievement_key").notNull(),
  achievementTitle: varchar("achievement_title").notNull(),
  achievementDescription: text("achievement_description"),
  achievementIcon: varchar("achievement_icon"), // Icon identifier
  rarity: varchar("rarity").default("common"), // "common", "rare", "epic", "legendary"
  experienceReward: integer("experience_reward").default(0),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type ZodiacJourneyMilestone = typeof zodiacJourneyMilestones.$inferSelect;
export type InsertZodiacJourneyMilestone = typeof zodiacJourneyMilestones.$inferInsert;
export type ZodiacJourneyProgress = typeof zodiacJourneyProgress.$inferSelect;
export type InsertZodiacJourneyProgress = typeof zodiacJourneyProgress.$inferInsert;
export type ZodiacJourneyAchievement = typeof zodiacJourneyAchievements.$inferSelect;
export type InsertZodiacJourneyAchievement = typeof zodiacJourneyAchievements.$inferInsert;

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateProfileSchema = createInsertSchema(users).pick({
  username: true,
  bio: true,
  dateOfBirth: true,
  timeOfBirth: true,
  locationOfBirth: true,
  latitude: true,
  longitude: true,
  timezone: true,
}).extend({
  username: z.string().min(3).max(50),
  bio: z.string().max(500).optional(),
  dateOfBirth: z.string(),
  timeOfBirth: z.string().optional(),
  locationOfBirth: z.string().optional(),
});

export type UpdateProfile = z.infer<typeof updateProfileSchema>;

// Social post types
export type SocialPost = typeof socialPosts.$inferSelect;
export type InsertSocialPost = typeof socialPosts.$inferInsert;
export type SocialComment = typeof socialComments.$inferSelect;
export type InsertSocialComment = typeof socialComments.$inferInsert;
export type SocialLike = typeof socialLikes.$inferSelect;
export type SocialFollow = typeof socialFollows.$inferSelect;

// Cosmic Playlist types
export type CosmicPlaylist = typeof cosmicPlaylists.$inferSelect;
export type InsertCosmicPlaylist = typeof cosmicPlaylists.$inferInsert;

export const insertCosmicPlaylistSchema = createInsertSchema(cosmicPlaylists).omit({
  id: true,
  generatedAt: true,
  createdAt: true,
});

export const insertSocialPostSchema = createInsertSchema(socialPosts).omit({
  id: true,
  likes: true,
  shares: true,
  createdAt: true,
});

export const insertSocialCommentSchema = createInsertSchema(socialComments).omit({
  id: true,
  createdAt: true,
});

export type InsertSocialPostData = z.infer<typeof insertSocialPostSchema>;
export type InsertSocialCommentData = z.infer<typeof insertSocialCommentSchema>;

// Premium report types
export type PremiumReport = typeof premiumReports.$inferSelect;
export type InsertPremiumReport = typeof premiumReports.$inferInsert;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = typeof userSubscriptions.$inferInsert;
export type ReportTemplate = typeof reportTemplates.$inferSelect;

export const insertPremiumReportSchema = createInsertSchema(premiumReports).omit({
  id: true,
  generatedAt: true,
  createdAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(userSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPremiumReportData = z.infer<typeof insertPremiumReportSchema>;
export type InsertSubscriptionData = z.infer<typeof insertSubscriptionSchema>;

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type Horoscope = typeof horoscopes.$inferSelect;
export type InsertHoroscope = typeof horoscopes.$inferInsert;

// Moon Phase Calendar System
export const moonPhases = pgTable("moon_phases", {
  id: varchar("id").primaryKey().notNull().$defaultFn(() => `moon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`),
  date: date("date").notNull(),
  phase: varchar("phase").notNull(), // New Moon, Waxing Crescent, First Quarter, etc.
  illumination: decimal("illumination", { precision: 5, scale: 2 }), // Percentage
  moonSign: varchar("moon_sign"), // Astrological sign the moon is in
  element: varchar("element"), // Fire, Earth, Air, Water
  energy: varchar("energy"), // High, Medium, Low
  createdAt: timestamp("created_at").defaultNow(),
});

export const moonRituals = pgTable("moon_rituals", {
  id: varchar("id").primaryKey().notNull().$defaultFn(() => `ritual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`),
  moonPhaseId: varchar("moon_phase_id").references(() => moonPhases.id),
  userId: varchar("user_id").references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(), // manifestation, release, gratitude, protection, etc.
  duration: varchar("duration"), // 5 minutes, 15 minutes, 30 minutes
  materials: text("materials").array(), // candles, crystals, herbs, etc.
  steps: jsonb("steps").notNull(), // Array of ritual steps
  intention: text("intention"),
  isPersonalized: boolean("is_personalized").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userMoonTracking = pgTable("user_moon_tracking", {
  id: varchar("id").primaryKey().notNull().$defaultFn(() => `tracking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`),
  userId: varchar("user_id").notNull().references(() => users.id),
  moonPhaseId: varchar("moon_phase_id").notNull().references(() => moonPhases.id),
  journalEntry: text("journal_entry"),
  mood: varchar("mood"), // reflective, energetic, peaceful, etc.
  energy: integer("energy"), // 1-10 scale
  intentions: text("intentions").array(),
  ritualCompleted: varchar("ritual_completed"), // ritual ID if completed
  dreams: text("dreams"),
  synchronicities: text("synchronicities"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Moon Calendar types
export type MoonPhase = typeof moonPhases.$inferSelect;
export type InsertMoonPhase = typeof moonPhases.$inferInsert;
export type MoonRitual = typeof moonRituals.$inferSelect;
export type InsertMoonRitual = typeof moonRituals.$inferInsert;
export type UserMoonTracking = typeof userMoonTracking.$inferSelect;
export type InsertUserMoonTracking = typeof userMoonTracking.$inferInsert;

export const insertMoonPhaseSchema = createInsertSchema(moonPhases).omit({
  id: true,
  createdAt: true,
});

export const insertMoonRitualSchema = createInsertSchema(moonRituals).omit({
  id: true,
  createdAt: true,
});

export const insertUserMoonTrackingSchema = createInsertSchema(userMoonTracking).omit({
  id: true,
  createdAt: true,
});

export type InsertMoonPhaseData = z.infer<typeof insertMoonPhaseSchema>;
export type InsertMoonRitualData = z.infer<typeof insertMoonRitualSchema>;
export type InsertUserMoonTrackingData = z.infer<typeof insertUserMoonTrackingSchema>;

// Journal entries table
export const journalEntries = pgTable("journal_entries", {
  id: varchar("id").primaryKey().notNull().$defaultFn(() => `journal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title"), // Optional title for the entry
  content: text("content").notNull(), // Main journal content
  mood: varchar("mood"), // reflective, energetic, peaceful, anxious, inspired, emotional
  energy: integer("energy"), // 1-10 scale
  dreams: text("dreams"), // Dream content
  synchronicities: text("synchronicities"), // Meaningful coincidences
  tags: text("tags").array(), // Custom tags for categorization
  source: varchar("source"), // chat, cosmic-playlist, moon-calendar, premium-reports, manual
  sourceId: varchar("source_id"), // Reference to the source item if applicable
  isPrivate: boolean("is_private").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Journal types
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = typeof journalEntries.$inferInsert;

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertJournalEntryData = z.infer<typeof insertJournalEntrySchema>;
