import { 
  learningLessons,
  learningProgress, 
  learningBadges,
  learningUserBadges,
  learningStats,
  learningQuizResults,
  users,
  type LearningLesson,
  type LearningProgress,
  type LearningBadge,
  type LearningStats,
  type InsertLearningProgress,
  type InsertLearningStats,
  type InsertLearningUserBadge,
  type InsertLearningQuizResult
} from "@shared/schema";
import { db } from "../db";
import { eq, and, sql, desc } from "drizzle-orm";
import { astrologyService } from "./astrology";

export interface LessonContent {
  type: 'text' | 'interactive' | 'chart-highlight' | 'quiz';
  data: any;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  chartElement?: string; // For highlighting specific chart elements
}

export interface PersonalizedLesson {
  lesson: LearningLesson;
  personalizedContent: LessonContent[];
  userChartData?: any;
}

class LearningService {
  
  // Initialize default lessons and badges
  async initializeLearningContent(): Promise<void> {
    console.log('Initializing learning content...');
    
    // Check if content already exists
    const existingLessons = await db.select().from(learningLessons).limit(1);
    if (existingLessons.length > 0) {
      console.log('Learning content already exists, skipping initialization');
      return;
    }

    // Create default lessons
    await this.createDefaultLessons();
    await this.createDefaultBadges();
    
    console.log('Learning content initialized successfully');
  }

  private async createDefaultLessons(): Promise<void> {
    const lessons = [
      // BASICS TRACK
      {
        track: 'basics',
        lessonNumber: 1,
        title: 'Your Sun Sign: The Core of Who You Are',
        description: 'Discover what your sun sign reveals about your essential nature and identity.',
        content: {
          sections: [
            {
              type: 'introduction',
              content: 'Your sun sign represents your core identity, ego, and the essence of who you are becoming.'
            },
            {
              type: 'personal-insight',
              content: 'Based on your birth chart, we\'ll explore your unique sun sign traits.'
            },
            {
              type: 'interactive-element',
              element: 'sun-traits-explorer'
            }
          ]
        },
        requiredLessons: [],
        xpReward: 15,
        estimatedMinutes: 8
      },
      {
        track: 'basics',
        lessonNumber: 2, 
        title: 'Your Moon Sign: Your Inner Emotional World',
        description: 'Understand how your moon sign influences your emotions, instincts, and needs.',
        content: {
          sections: [
            {
              type: 'introduction',
              content: 'Your moon sign governs your emotional responses, subconscious patterns, and inner needs.'
            },
            {
              type: 'personal-insight',
              content: 'Explore how your moon sign shapes your emotional landscape.'
            },
            {
              type: 'interactive-element',
              element: 'moon-emotion-explorer'
            }
          ]
        },
        requiredLessons: ['basics-1'],
        xpReward: 15,
        estimatedMinutes: 8
      },
      {
        track: 'basics',
        lessonNumber: 3,
        title: 'Your Rising Sign: Your Outer Expression',
        description: 'Learn how your rising sign shapes first impressions and your approach to the world.',
        content: {
          sections: [
            {
              type: 'introduction',
              content: 'Your rising sign is your social mask, affecting how others see you and how you navigate the world.'
            },
            {
              type: 'personal-insight', 
              content: 'Discover how your rising sign influences your personality and behavior.'
            },
            {
              type: 'interactive-element',
              element: 'rising-expression-explorer'
            }
          ]
        },
        requiredLessons: ['basics-2'],
        xpReward: 15,
        estimatedMinutes: 8
      },
      {
        track: 'basics',
        lessonNumber: 4,
        title: 'The Big Three Integration',
        description: 'See how your sun, moon, and rising signs work together to create your unique personality.',
        content: {
          sections: [
            {
              type: 'introduction',
              content: 'Your Big Three create a complex interplay that forms your complete astrological identity.'
            },
            {
              type: 'synthesis',
              content: 'Learn how your three core signs complement and sometimes conflict with each other.'
            },
            {
              type: 'interactive-element',
              element: 'big-three-integration'
            }
          ]
        },
        requiredLessons: ['basics-3'],
        xpReward: 20,
        estimatedMinutes: 10
      },

      // PLANETS TRACK
      {
        track: 'planets',
        lessonNumber: 1,
        title: 'Mercury: Your Communication Style',
        description: 'Understand how Mercury influences the way you think, learn, and communicate.',
        content: {
          sections: [
            {
              type: 'introduction',
              content: 'Mercury governs communication, learning style, and mental processes.'
            },
            {
              type: 'personal-insight',
              content: 'Discover your unique Mercury traits and communication patterns.'
            }
          ]
        },
        requiredLessons: ['basics-4'],
        xpReward: 15,
        estimatedMinutes: 8
      },
      {
        track: 'planets',
        lessonNumber: 2,
        title: 'Venus: Your Relationships and Values',
        description: 'Explore how Venus shapes your approach to love, relationships, and what you value.',
        content: {
          sections: [
            {
              type: 'introduction',
              content: 'Venus reveals your approach to love, beauty, and what brings you pleasure.'
            },
            {
              type: 'personal-insight',
              content: 'Understand your Venus sign\'s influence on relationships and aesthetics.'
            }
          ]
        },
        requiredLessons: ['planets-1'],
        xpReward: 15,
        estimatedMinutes: 8
      },
      {
        track: 'planets',
        lessonNumber: 3,
        title: 'Mars: Your Drive and Ambition',
        description: 'Learn how Mars influences your energy, motivation, and how you pursue your goals.',
        content: {
          sections: [
            {
              type: 'introduction',
              content: 'Mars represents your drive, ambition, and how you assert yourself in the world.'
            },
            {
              type: 'personal-insight',
              content: 'Explore your Mars sign\'s impact on your motivation and action style.'
            }
          ]
        },
        requiredLessons: ['planets-2'],
        xpReward: 15,
        estimatedMinutes: 8
      },

      // HOUSES TRACK  
      {
        track: 'houses',
        lessonNumber: 1,
        title: 'The 12 Houses: Life\'s Different Areas',
        description: 'Introduction to the 12 houses and what areas of life they represent.',
        content: {
          sections: [
            {
              type: 'introduction',
              content: 'The 12 houses represent different life themes and areas of experience.'
            },
            {
              type: 'house-overview',
              content: 'Learn the fundamental meaning of each house in astrology.'
            }
          ]
        },
        requiredLessons: ['planets-3'],
        xpReward: 20,
        estimatedMinutes: 12
      },
      {
        track: 'houses',
        lessonNumber: 2,
        title: 'Your Personal Houses',
        description: 'Discover what signs rule your houses and what this means for your life.',
        content: {
          sections: [
            {
              type: 'introduction',
              content: 'Each house in your chart is ruled by a specific sign, coloring that area of life.'
            },
            {
              type: 'personal-houses',
              content: 'Explore your unique house rulers and their meanings.'
            }
          ]
        },
        requiredLessons: ['houses-1'],
        xpReward: 20,
        estimatedMinutes: 12
      }
    ];

    for (const lesson of lessons) {
      await db.insert(learningLessons).values(lesson);
    }
  }

  private async createDefaultBadges(): Promise<void> {
    const badges = [
      {
        name: 'First Steps',
        description: 'Complete your first astrology lesson',
        icon: '🌟',
        track: 'basics',
        requirements: { completedLessons: 1 },
        xpReward: 25
      },
      {
        name: 'Sun Explorer', 
        description: 'Master your sun sign knowledge',
        icon: '☀️',
        track: 'basics',
        requirements: { masteredLessons: ['basics-1'] },
        xpReward: 50
      },
      {
        name: 'Moon Whisperer',
        description: 'Understand your lunar nature',
        icon: '🌙',
        track: 'basics', 
        requirements: { masteredLessons: ['basics-2'] },
        xpReward: 50
      },
      {
        name: 'Rising Star',
        description: 'Master your ascendant knowledge',
        icon: '🌅',
        track: 'basics',
        requirements: { masteredLessons: ['basics-3'] },
        xpReward: 50
      },
      {
        name: 'Big Three Master',
        description: 'Complete the entire basics track',
        icon: '🏆',
        track: 'basics',
        requirements: { completedTrack: 'basics' },
        xpReward: 100
      },
      {
        name: 'Planetary Student',
        description: 'Begin exploring planetary influences',
        icon: '🪐',
        track: 'planets',
        requirements: { completedLessons: 1, track: 'planets' },
        xpReward: 50
      },
      {
        name: 'Communication Expert',
        description: 'Master Mercury\'s influence in your chart',
        icon: '💬',
        track: 'planets',
        requirements: { masteredLessons: ['planets-1'] },
        xpReward: 75
      },
      {
        name: 'Love & Values Guide',
        description: 'Understand Venus in your chart',
        icon: '💖',
        track: 'planets',
        requirements: { masteredLessons: ['planets-2'] },
        xpReward: 75
      },
      {
        name: 'Ambitious Achiever',
        description: 'Master Mars energy in your chart',
        icon: '⚡',
        track: 'planets',
        requirements: { masteredLessons: ['planets-3'] },
        xpReward: 75
      },
      {
        name: 'House Hunter',
        description: 'Begin exploring the houses',
        icon: '🏠',
        track: 'houses',
        requirements: { completedLessons: 1, track: 'houses' },
        xpReward: 50
      },
      {
        name: 'Chart Interpreter',
        description: 'Complete all foundational learning tracks',
        icon: '🔮',
        track: null,
        requirements: { completedTracks: ['basics', 'planets', 'houses'] },
        xpReward: 200
      }
    ];

    for (const badge of badges) {
      await db.insert(learningBadges).values(badge);
    }
  }

  // Get user's learning stats
  async getUserStats(userId: string): Promise<LearningStats> {
    let [stats] = await db.select().from(learningStats).where(eq(learningStats.userId, userId));
    
    if (!stats) {
      // Create initial stats for new user
      [stats] = await db.insert(learningStats).values({
        userId,
        totalXp: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        completedLessons: 0,
        masteredLessons: 0,
        totalTimeSpent: 0
      }).returning();
    }
    
    return stats;
  }

  // Get available lessons for a user based on their progress
  async getAvailableLessons(userId: string): Promise<LearningLesson[]> {
    const userProgress = await db.select()
      .from(learningProgress)
      .where(eq(learningProgress.userId, userId));
    
    // Get all lessons to build completion map
    const allLessons = await db.select()
      .from(learningLessons)
      .where(eq(learningLessons.isActive, true))
      .orderBy(learningLessons.track, learningLessons.lessonNumber);
    
    const lessonMap = new Map(allLessons.map(l => [l.id, l]));
    
    const completedLessonIds = userProgress
      .filter(p => p.status === 'completed' || p.status === 'mastered')
      .map(p => p.lessonId);
    
    return allLessons.filter(lesson => {
      // If no prerequisites, it's available
      if (!lesson.requiredLessons || lesson.requiredLessons.length === 0) {
        return true;
      }
      
      // Check if all prerequisites are completed
      // Convert string prerequisites to numbers if needed
      return lesson.requiredLessons.every(req => {
        const reqId = typeof req === 'string' ? parseInt(req) : req;
        return completedLessonIds.includes(reqId);
      });
    });
  }

  // Get personalized lesson content using user's birth chart
  async getPersonalizedLesson(lessonId: number, userId: string): Promise<PersonalizedLesson> {
    const [lesson] = await db.select().from(learningLessons).where(eq(learningLessons.id, lessonId));
    
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // Get user's birth data for personalization
    const user = await db.select().from(users).where(eq(users.id, userId));
    let userChartData = null;
    
    if (user[0]?.birthDate && user[0]?.birthTime && user[0]?.birthLocation) {
      // Calculate personalized astrological data including planetary positions
      const sunSign = astrologyService.calculateSunSign(user[0].birthDate);
      const moonSign = astrologyService.calculateMoonSign(user[0].birthDate, user[0].birthTime);
      const risingSign = astrologyService.calculateRising(user[0].birthDate, user[0].birthTime, user[0].birthLocation);
      
      // Get detailed chart data for planetary positions
      let detailedChart = null;
      try {
        detailedChart = await astrologyService.generateDetailedChartAccurate({
          date: user[0].birthDate,
          time: user[0].birthTime,
          location: user[0].birthLocation
        });
      } catch (error) {
        console.error('Failed to get detailed chart data:', error);
      }
      
      userChartData = {
        sunSign,
        moonSign,
        risingSign,
        detailedChart,
        birthData: {
          date: user[0].birthDate,
          time: user[0].birthTime,
          location: user[0].birthLocation
        }
      };
    }

    // Get user progress for this lesson
    const [userProgress] = await db.select().from(learningProgress)
      .where(and(
        eq(learningProgress.userId, userId),
        eq(learningProgress.lessonId, lessonId)
      ));

    // Personalize lesson content based on user's chart
    const personalizedContent = this.personalizeContent(lesson, userChartData);

    return {
      lesson: lesson as any, // Type assertion for now
      personalizedContent,
      userChartData,
      userProgress: userProgress || null
    };
  }

  private personalizeContent(lesson: LearningLesson, chartData: any): LessonContent[] {
    const content: LessonContent[] = [];
    
    if (!chartData) {
      // Generic content for users without birth data
      content.push({
        type: 'text',
        data: {
          content: 'To get personalized insights, please complete your birth information in your profile.'
        }
      });
    } else {
      // Personalized content based on chart data
      switch (lesson.track) {
        case 'basics':
          if (lesson.lessonNumber === 1) {
            content.push({
              type: 'text',
              data: {
                title: `Your ${chartData.sunSign} Sun`,
                content: this.getSunSignInsights(chartData.sunSign)
              }
            });
            content.push({
              type: 'interactive',
              data: {
                type: 'trait-explorer',
                sign: chartData.sunSign,
                element: 'sun'
              }
            });
          } else if (lesson.lessonNumber === 2) {
            content.push({
              type: 'text',
              data: {
                title: `Your ${chartData.moonSign} Moon`,
                content: this.getMoonSignInsights(chartData.moonSign)
              }
            });
            content.push({
              type: 'interactive',
              data: {
                type: 'emotion-explorer',
                sign: chartData.moonSign,
                element: 'moon'
              }
            });
            content.push({
              type: 'chart-highlight',
              data: {
                element: `Moon in ${chartData.moonSign}`,
                description: 'See how your Moon sign appears in your birth chart and its house placement for additional insight'
              }
            });
          } else if (lesson.lessonNumber === 3) {
            content.push({
              type: 'text',
              data: {
                title: `Your ${chartData.risingSign} Rising`,
                content: this.getRisingSignInsights(chartData.risingSign)
              }
            });
            content.push({
              type: 'interactive',
              data: {
                type: 'first-impression',
                sign: chartData.risingSign,
                element: 'rising'
              }
            });
            content.push({
              type: 'chart-highlight',
              data: {
                element: `${chartData.risingSign} Rising`,
                description: 'Your Rising sign determines your entire house system and sets the stage for your life themes'
              }
            });
          }
          break;
        
        case 'planets':
          if (lesson.lessonNumber === 1) { // Mercury
            const mercuryData = chartData.detailedChart?.planets?.find((p: any) => p.planet === 'Mercury');
            const mercurySign = mercuryData?.sign || chartData.sunSign; // Fallback to sun sign
            
            content.push({
              type: 'text',
              data: {
                title: `Your Mercury in ${mercurySign}`,
                content: this.getMercurySignInsights(mercurySign)
              }
            });
            content.push({
              type: 'text',
              data: {
                title: 'Communication Style Analysis',
                content: this.getMercuryCommunicationStyle(mercurySign)
              }
            });
            content.push({
              type: 'interactive',
              data: {
                type: 'communication-explorer',
                sign: mercurySign,
                element: 'mercury'
              }
            });
            content.push({
              type: 'chart-highlight',
              data: {
                element: `Mercury in ${mercurySign}`,
                description: 'See where Mercury sits in your birth chart and which house governs your communication style'
              }
            });
          } else if (lesson.lessonNumber === 2) { // Venus
            const venusData = chartData.detailedChart?.planets?.find((p: any) => p.planet === 'Venus');
            const venusSign = venusData?.sign || chartData.sunSign; // Fallback to sun sign
            
            content.push({
              type: 'text',
              data: {
                title: `Your Venus in ${venusSign}`,
                content: this.getVenusSignInsights(venusSign)
              }
            });
            content.push({
              type: 'text',
              data: {
                title: 'Love & Values Analysis',
                content: this.getVenusLoveStyle(venusSign)
              }
            });
            content.push({
              type: 'interactive',
              data: {
                type: 'relationship-explorer',
                sign: venusSign,
                element: 'venus'
              }
            });
            content.push({
              type: 'chart-highlight',
              data: {
                element: `Venus in ${venusSign}`,
                description: 'Discover where Venus sits in your chart and which life area influences your relationships and values'
              }
            });
          } else if (lesson.lessonNumber === 3) { // Mars
            const marsData = chartData.detailedChart?.planets?.find((p: any) => p.planet === 'Mars');
            const marsSign = marsData?.sign || chartData.sunSign; // Fallback to sun sign
            
            content.push({
              type: 'text',
              data: {
                title: `Your Mars in ${marsSign}`,
                content: this.getMarsSignInsights(marsSign)
              }
            });
            content.push({
              type: 'text',
              data: {
                title: 'Drive & Action Analysis',
                content: this.getMarsActionStyle(marsSign)
              }
            });
            content.push({
              type: 'interactive',
              data: {
                type: 'motivation-explorer',
                sign: marsSign,
                element: 'mars'
              }
            });
            content.push({
              type: 'chart-highlight',
              data: {
                element: `Mars in ${marsSign}`,
                description: 'See where Mars is positioned in your chart and which life area drives your ambition and energy'
              }
            });
          }
          break;
      }
    }

    return content;
  }

  private getSunSignInsights(sunSign: string): string {
    const insights: Record<string, string> = {
      'Aries': 'As an Aries Sun, you\'re naturally a pioneer and leader. Your core identity is tied to taking initiative, being first, and blazing new trails.',
      'Taurus': 'Your Taurus Sun gives you a steady, grounded nature. You find your identity through creating stability, enjoying life\'s pleasures, and building lasting value.',
      'Gemini': 'With a Gemini Sun, your identity is multifaceted and curious. You thrive on communication, learning, and connecting diverse ideas and people.',
      'Cancer': 'Your Cancer Sun makes you naturally nurturing and intuitive. Your core self is tied to caring for others, creating emotional security, and honoring traditions.',
      'Leo': 'As a Leo Sun, you shine brightest when expressing your creativity and leadership. Your identity is linked to being generous, dramatic, and inspiring others.',
      'Virgo': 'Your Virgo Sun drives you to perfect and serve. You find your identity through helping others, attention to detail, and creating practical improvements.',
      'Libra': 'With a Libra Sun, harmony and beauty are central to your identity. You excel at creating balance, fostering relationships, and appreciating aesthetics.',
      'Scorpio': 'Your Scorpio Sun gives you intense depth and transformative power. Your identity is tied to uncovering truth, emotional intimacy, and personal metamorphosis.',
      'Sagittarius': 'As a Sagittarius Sun, you\'re naturally philosophical and adventurous. Your core self seeks meaning, freedom, and expansion through exploration and learning.',
      'Capricorn': 'Your Capricorn Sun drives ambition and responsibility. You find your identity through achievement, building lasting structures, and earned authority.',
      'Aquarius': 'With an Aquarius Sun, you\'re innovatively humanitarian. Your identity is tied to progressive ideals, group dynamics, and bringing unique perspectives.',
      'Pisces': 'Your Pisces Sun makes you compassionate and imaginative. Your core identity flows through empathy, creativity, and spiritual connection to all life.'
    };
    
    return insights[sunSign] || 'Your sun sign shapes your core identity and life purpose in unique ways.';
  }

  private getMoonSignInsights(moonSign: string): string {
    const insights: Record<string, string> = {
      'Aries': 'Your Aries Moon needs excitement and independence. You process emotions quickly and directly, requiring freedom to act on your instincts.',
      'Taurus': 'With a Taurus Moon, you need stability and comfort. You process emotions slowly and thoroughly, finding security through routine and sensual pleasures.',
      'Gemini': 'Your Gemini Moon needs variety and communication. You process emotions mentally, requiring intellectual stimulation and social connection to feel secure.',
      'Cancer': 'Your Cancer Moon needs emotional safety and nurturing. You process feelings deeply and intuitively, requiring a secure home base and family connections.',
      'Leo': 'With a Leo Moon, you need appreciation and creative expression. You process emotions dramatically, requiring recognition and outlets for your artistic nature.',
      'Virgo': 'Your Virgo Moon needs order and usefulness. You process emotions analytically, finding comfort in helping others and creating practical solutions.',
      'Libra': 'Your Libra Moon needs harmony and partnership. You process emotions through relationships, requiring balance and beauty in your environment.',
      'Scorpio': 'With a Scorpio Moon, you need emotional depth and transformation. You process feelings intensely, requiring authentic connections and psychological understanding.',
      'Sagittarius': 'Your Sagittarius Moon needs freedom and meaning. You process emotions philosophically, requiring adventure and spiritual exploration for emotional fulfillment.',
      'Capricorn': 'Your Capricorn Moon needs achievement and structure. You process emotions practically, finding security through accomplishment and long-term goals.',
      'Aquarius': 'With an Aquarius Moon, you need independence and innovation. You process emotions objectively, requiring intellectual freedom and humanitarian causes.',
      'Pisces': 'Your Pisces Moon needs compassion and creativity. You process emotions intuitively and absorb others\' feelings, requiring artistic expression and spiritual connection.'
    };
    
    return insights[moonSign] || 'Your moon sign shapes your emotional needs and instinctive responses in unique ways.';
  }

  private getRisingSignInsights(risingSign: string): string {
    const insights: Record<string, string> = {
      'Aries': 'Your Aries Rising gives you a bold, energetic first impression. You approach new situations with confidence and directness, appearing as a natural leader.',
      'Taurus': 'With Taurus Rising, you project stability and reliability. You approach new situations calmly and methodically, appearing grounded and trustworthy.',
      'Gemini': 'Your Gemini Rising makes you appear curious and communicative. You approach new situations with questions and adaptability, seeming witty and intellectually engaged.',
      'Cancer': 'Your Cancer Rising gives you a nurturing, protective first impression. You approach new situations with emotional sensitivity, appearing caring and intuitive.',
      'Leo': 'With Leo Rising, you project confidence and warmth. You approach new situations with enthusiasm and creativity, appearing generous and naturally magnetic.',
      'Virgo': 'Your Virgo Rising makes you appear helpful and organized. You approach new situations with practical analysis, seeming reliable and detail-oriented.',
      'Libra': 'Your Libra Rising gives you a charming, diplomatic first impression. You approach new situations seeking harmony, appearing graceful and socially aware.',
      'Scorpio': 'With Scorpio Rising, you project intensity and mystery. You approach new situations with keen observation, appearing powerful and psychologically perceptive.',
      'Sagittarius': 'Your Sagittarius Rising makes you appear adventurous and optimistic. You approach new situations with enthusiasm for learning, seeming philosophical and open-minded.',
      'Capricorn': 'Your Capricorn Rising gives you a serious, competent first impression. You approach new situations with realistic assessment, appearing responsible and ambitious.',
      'Aquarius': 'With Aquarius Rising, you project uniqueness and innovation. You approach new situations with detached observation, appearing progressive and intellectually independent.',
      'Pisces': 'Your Pisces Rising gives you a gentle, intuitive first impression. You approach new situations with empathy and adaptability, appearing compassionate and spiritually aware.'
    };
    
    return insights[risingSign] || 'Your rising sign shapes how you present yourself to the world and approach new experiences.';
  }

  private getMercurySignInsights(mercurySign: string): string {
    const insights: Record<string, string> = {
      'Aries': 'Your Mercury in Aries gives you quick, direct communication. You think fast, speak boldly, and prefer getting straight to the point. You learn best through action and competitive environments.',
      'Taurus': 'With Mercury in Taurus, you communicate thoughtfully and practically. You think methodically, value concrete information, and learn best through hands-on experience and repetition.',
      'Gemini': 'Your Mercury in Gemini makes you naturally curious and versatile in communication. You think quickly, enjoy wordplay, and learn best through variety and social interaction.',
      'Cancer': 'Mercury in Cancer gives you intuitive, emotionally-aware communication. You think with your heart, remember personal details, and learn best in nurturing, supportive environments.',
      'Leo': 'With Mercury in Leo, you communicate with flair and creativity. You think dramatically, enjoy storytelling, and learn best when you can express yourself and receive appreciation.',
      'Virgo': 'Your Mercury in Virgo makes you precise and analytical in communication. You think systematically, pay attention to details, and learn best through organized, step-by-step methods.',
      'Libra': 'Mercury in Libra gives you diplomatic, balanced communication. You think through different perspectives, seek harmony in discussions, and learn best in peaceful, aesthetic environments.',
      'Scorpio': 'With Mercury in Scorpio, you communicate with depth and intensity. You think psychologically, uncover hidden meanings, and learn best through research and investigation.',
      'Sagittarius': 'Your Mercury in Sagittarius makes you philosophical and enthusiastic in communication. You think big-picture, enjoy debates, and learn best through exploration and diverse experiences.',
      'Capricorn': 'Mercury in Capricorn gives you structured, goal-oriented communication. You think strategically, value practical information, and learn best through traditional, authoritative sources.',
      'Aquarius': 'With Mercury in Aquarius, you communicate in unique, innovative ways. You think independently, enjoy unconventional ideas, and learn best through experimentation and group discussions.',
      'Pisces': 'Your Mercury in Pisces makes you intuitive and imaginative in communication. You think creatively, absorb subtle cues, and learn best through artistic and spiritual approaches.'
    };
    
    return insights[mercurySign] || 'Your Mercury sign shapes how you think, learn, and communicate with the world.';
  }

  private getMercuryCommunicationStyle(mercurySign: string): string {
    const styles: Record<string, string> = {
      'Aries': 'You communicate with directness and urgency. In conversations, you jump quickly to conclusions and prefer active, dynamic exchanges. You excel at motivating others but may need to slow down for deeper discussions.',
      'Taurus': 'You communicate slowly and deliberately, preferring to think before speaking. You excel at explaining practical matters and building consensus, but may resist changing your mind once decided.',
      'Gemini': 'You communicate with wit and versatility, easily adapting your style to different audiences. You excel at gathering and sharing information but may struggle with in-depth focus on one topic.',
      'Cancer': 'You communicate with emotional sensitivity, reading between the lines and remembering personal details. You excel at supportive conversations but may take criticism too personally.',
      'Leo': 'You communicate with warmth and dramatic flair, naturally drawing attention in groups. You excel at inspiring and entertaining others but may dominate conversations.',
      'Virgo': 'You communicate with precision and helpfulness, offering practical solutions and detailed explanations. You excel at teaching and problem-solving but may over-criticize or get lost in details.',
      'Libra': 'You communicate with charm and diplomacy, seeking to please and maintain harmony. You excel at mediation and seeing all sides but may avoid difficult conversations.',
      'Scorpio': 'You communicate with intensity and psychological insight, preferring meaningful over superficial exchanges. You excel at deep conversations but may be too probing or secretive.',
      'Sagittarius': 'You communicate with enthusiasm and philosophical depth, sharing ideas and seeking truth. You excel at teaching and inspiring but may be too blunt or preachy.',
      'Capricorn': 'You communicate with authority and structure, preferring formal, organized exchanges. You excel at leadership discussions but may seem too serious or rigid.',
      'Aquarius': 'You communicate with originality and detachment, offering unique perspectives and innovative ideas. You excel at group discussions but may seem emotionally distant.',
      'Pisces': 'You communicate with empathy and intuition, picking up on unspoken emotions and meanings. You excel at compassionate listening but may be unclear or overly indirect.'
    };
    
    return styles[mercurySign] || 'Your Mercury sign influences your unique communication style and learning preferences.';
  }

  private getVenusSignInsights(venusSign: string): string {
    const insights: Record<string, string> = {
      'Aries': 'Your Venus in Aries loves excitement and independence in relationships. You\'re attracted to confident, dynamic partners and value spontaneity, freedom, and passionate connections.',
      'Taurus': 'With Venus in Taurus, you love stability and sensual pleasures. You\'re attracted to reliable, affectionate partners and value loyalty, comfort, and physical expressions of love.',
      'Gemini': 'Your Venus in Gemini loves variety and intellectual connection. You\'re attracted to witty, communicative partners and value mental stimulation, friendship, and playful interactions.',
      'Cancer': 'Venus in Cancer makes you love emotional security and nurturing. You\'re attracted to caring, family-oriented partners and value emotional intimacy, protection, and traditional romance.',
      'Leo': 'With Venus in Leo, you love drama and appreciation in relationships. You\'re attracted to confident, creative partners and value admiration, generosity, and grand romantic gestures.',
      'Virgo': 'Your Venus in Virgo loves practical care and improvement. You\'re attracted to helpful, reliable partners and value acts of service, health consciousness, and steady devotion.',
      'Libra': 'Venus in Libra makes you love harmony and beauty. You\'re attracted to charming, balanced partners and value fairness, aesthetic appreciation, and peaceful relationships.',
      'Scorpio': 'With Venus in Scorpio, you love depth and transformation. You\'re attracted to intense, mysterious partners and value emotional honesty, loyalty, and transformative connections.',
      'Sagittarius': 'Your Venus in Sagittarius loves adventure and growth. You\'re attracted to optimistic, philosophical partners and value freedom, shared ideals, and expanding horizons together.',
      'Capricorn': 'Venus in Capricorn makes you love structure and achievement. You\'re attracted to ambitious, responsible partners and value stability, long-term commitment, and building together.',
      'Aquarius': 'With Venus in Aquarius, you love uniqueness and friendship. You\'re attracted to independent, innovative partners and value intellectual connection, freedom, and humanitarian values.',
      'Pisces': 'Your Venus in Pisces loves compassion and spiritual connection. You\'re attracted to sensitive, artistic partners and value empathy, romance, and transcendent love experiences.'
    };
    
    return insights[venusSign] || 'Your Venus sign shapes what you find attractive and how you express love and appreciation.';
  }

  private getVenusLoveStyle(venusSign: string): string {
    const styles: Record<string, string> = {
      'Aries': 'In love, you\'re direct and passionate, preferring to pursue rather than be pursued. You show affection through exciting adventures, competitive play, and bold gestures. You need partners who can match your energy and independence.',
      'Taurus': 'In love, you\'re steady and devoted, preferring to build relationships slowly and securely. You show affection through physical touch, gifts, and creating comfort. You need partners who appreciate consistency and sensual experiences.',
      'Gemini': 'In love, you\'re playful and communicative, preferring intellectual connections and variety. You show affection through words, humor, and shared interests. You need partners who can engage your mind and adapt to change.',
      'Cancer': 'In love, you\'re nurturing and protective, preferring emotional depth and security. You show affection through caring gestures, cooking, and creating home together. You need partners who value family and emotional intimacy.',
      'Leo': 'In love, you\'re generous and dramatic, preferring to be adored and appreciated. You show affection through grand gestures, gifts, and creative expressions. You need partners who celebrate and admire you.',
      'Virgo': 'In love, you\'re helpful and devoted, preferring to serve and improve your partner\'s life. You show affection through practical care, remembering details, and solving problems. You need partners who appreciate your thoughtfulness.',
      'Libra': 'In love, you\'re romantic and harmonious, preferring partnership and balance. You show affection through beauty, compromise, and creating peace. You need partners who value fairness and aesthetic experiences.',
      'Scorpio': 'In love, you\'re intense and transformative, preferring deep emotional and physical bonds. You show affection through loyalty, depth, and complete devotion. You need partners who can handle intensity and commit fully.',
      'Sagittarius': 'In love, you\'re adventurous and optimistic, preferring growth and exploration together. You show affection through shared adventures, philosophical discussions, and giving freedom. You need partners who love learning and traveling.',
      'Capricorn': 'In love, you\'re committed and traditional, preferring long-term stability and building together. You show affection through responsibility, providing security, and achieving goals together. You need partners who share your ambitions.',
      'Aquarius': 'In love, you\'re friendly and independent, preferring intellectual connection and personal freedom. You show affection through shared causes, unique experiences, and respecting independence. You need partners who understand your need for space.',
      'Pisces': 'In love, you\'re romantic and intuitive, preferring spiritual and emotional connection. You show affection through empathy, creativity, and selfless devotion. You need partners who appreciate your sensitivity and imagination.'
    };
    
    return styles[venusSign] || 'Your Venus sign influences how you give and receive love in relationships.';
  }

  private getMarsSignInsights(marsSign: string): string {
    const insights: Record<string, string> = {
      'Aries': 'Your Mars in Aries gives you direct, impulsive energy. You act quickly on instincts, prefer to lead, and tackle challenges head-on with courage and competitive spirit.',
      'Taurus': 'With Mars in Taurus, you have steady, persistent energy. You act deliberately, prefer practical goals, and tackle challenges with patience, determination, and methodical approaches.',
      'Gemini': 'Your Mars in Gemini gives you versatile, intellectual energy. You act on multiple interests, prefer variety, and tackle challenges through communication, wit, and mental agility.',
      'Cancer': 'Mars in Cancer gives you protective, emotional energy. You act when family or security is threatened, prefer defensive strategies, and tackle challenges with intuition and tenacity.',
      'Leo': 'With Mars in Leo, you have dramatic, creative energy. You act with pride and flair, prefer leadership roles, and tackle challenges with confidence, generosity, and theatrical approaches.',
      'Virgo': 'Your Mars in Virgo gives you precise, service-oriented energy. You act systematically, prefer helping others, and tackle challenges through careful analysis and practical solutions.',
      'Libra': 'Mars in Libra gives you diplomatic, balanced energy. You act through cooperation, prefer win-win solutions, and tackle challenges by seeking harmony and considering all perspectives.',
      'Scorpio': 'With Mars in Scorpio, you have intense, transformative energy. You act with focus and determination, prefer all-or-nothing approaches, and tackle challenges through depth and psychological insight.',
      'Sagittarius': 'Your Mars in Sagittarius gives you adventurous, philosophical energy. You act on ideals and beliefs, prefer exploration, and tackle challenges with optimism and broad perspectives.',
      'Capricorn': 'Mars in Capricorn gives you ambitious, structured energy. You act strategically, prefer traditional methods, and tackle challenges through discipline, planning, and long-term commitment.',
      'Aquarius': 'With Mars in Aquarius, you have innovative, independent energy. You act on humanitarian ideals, prefer unique approaches, and tackle challenges through originality and group cooperation.',
      'Pisces': 'Your Mars in Pisces gives you intuitive, compassionate energy. You act on feelings and inspiration, prefer indirect approaches, and tackle challenges through creativity and spiritual connection.'
    };
    
    return insights[marsSign] || 'Your Mars sign shapes how you take action and pursue your goals in life.';
  }

  private getMarsActionStyle(marsSign: string): string {
    const styles: Record<string, string> = {
      'Aries': 'You take action impulsively and directly, jumping into challenges without extensive planning. Your motivation comes from competition, new beginnings, and the thrill of conquest. You work best in fast-paced, independent environments.',
      'Taurus': 'You take action slowly and steadily, preferring to plan thoroughly before moving. Your motivation comes from building security, creating beauty, and achieving tangible results. You work best in stable, comfortable environments.',
      'Gemini': 'You take action through communication and networking, tackling multiple projects simultaneously. Your motivation comes from learning, connecting ideas, and intellectual challenges. You work best in varied, social environments.',
      'Cancer': 'You take action to protect and nurture, responding strongly when emotions are involved. Your motivation comes from family, security, and helping others. You work best in supportive, emotionally safe environments.',
      'Leo': 'You take action with confidence and creativity, preferring to lead and inspire others. Your motivation comes from recognition, creative expression, and making a dramatic impact. You work best when appreciated and in the spotlight.',
      'Virgo': 'You take action through careful analysis and practical service, preferring organized, systematic approaches. Your motivation comes from helping others, perfecting skills, and solving problems. You work best in orderly, purpose-driven environments.',
      'Libra': 'You take action through cooperation and diplomacy, preferring to work with others toward balanced solutions. Your motivation comes from justice, beauty, and harmonious relationships. You work best in peaceful, collaborative environments.',
      'Scorpio': 'You take action with intensity and focus, preferring to transform situations completely. Your motivation comes from depth, control, and uncovering truth. You work best in private, research-oriented environments.',
      'Sagittarius': 'You take action through exploration and teaching, preferring big-picture goals and philosophical pursuits. Your motivation comes from freedom, truth, and expanding horizons. You work best in diverse, educational environments.',
      'Capricorn': 'You take action through structure and ambition, preferring traditional methods and long-term goals. Your motivation comes from achievement, status, and building lasting structures. You work best in hierarchical, goal-oriented environments.',
      'Aquarius': 'You take action through innovation and group work, preferring unique approaches and humanitarian goals. Your motivation comes from progress, friendship, and making the world better. You work best in progressive, collaborative environments.',
      'Pisces': 'You take action through intuition and compassion, preferring to flow with circumstances and help others. Your motivation comes from spiritual connection, creativity, and serving a higher purpose. You work best in artistic, supportive environments.'
    };
    
    return styles[marsSign] || 'Your Mars sign influences your unique approach to taking action and pursuing goals.';
  }

  // Record lesson progress
  async recordProgress(
    userId: string, 
    lessonId: number, 
    status: 'started' | 'completed' | 'mastered',
    score?: number,
    timeSpent?: number
  ): Promise<void> {
    // Check if progress already exists
    const [existing] = await db.select()
      .from(learningProgress)
      .where(and(
        eq(learningProgress.userId, userId),
        eq(learningProgress.lessonId, lessonId)
      ));

    const progressData: InsertLearningProgress = {
      userId,
      lessonId,
      status,
      score: score || null,
      timeSpent: timeSpent || null,
      completedAt: status === 'completed' || status === 'mastered' ? new Date() : null
    };

    if (existing) {
      await db.update(learningProgress)
        .set(progressData)
        .where(eq(learningProgress.id, existing.id));
    } else {
      await db.insert(learningProgress).values(progressData);
    }

    // Update user stats
    await this.updateUserStats(userId, status, timeSpent);
    
    // Check for new badges
    await this.checkAndAwardBadges(userId);
  }

  private async updateUserStats(userId: string, status: string, timeSpent?: number): Promise<void> {
    const stats = await this.getUserStats(userId);
    const today = new Date().toISOString().split('T')[0];
    
    const updates: Partial<InsertLearningStats> = {
      lastActivityDate: today
    };

    if (status === 'completed' || status === 'mastered') {
      updates.completedLessons = (stats.completedLessons || 0) + 1;
      updates.totalXp = (stats.totalXp || 0) + 15; // Base XP for completion
    }

    if (status === 'mastered') {
      updates.masteredLessons = (stats.masteredLessons || 0) + 1;
      updates.totalXp = (stats.totalXp || 0) + 10; // Bonus XP for mastery
    }

    if (timeSpent) {
      updates.totalTimeSpent = (stats.totalTimeSpent || 0) + timeSpent;
    }

    // Update streak
    if (stats.lastActivityDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (stats.lastActivityDate === yesterdayStr) {
        // Continue streak
        updates.currentStreak = (stats.currentStreak || 0) + 1;
        updates.longestStreak = Math.max(updates.currentStreak, stats.longestStreak || 0);
      } else {
        // Start new streak
        updates.currentStreak = 1;
      }
    }

    await db.update(learningStats)
      .set(updates)
      .where(eq(learningStats.userId, userId));
  }

  // Check and award badges
  private async checkAndAwardBadges(userId: string): Promise<void> {
    const stats = await this.getUserStats(userId);
    const userProgress = await db.select().from(learningProgress).where(eq(learningProgress.userId, userId));
    const userBadges = await db.select().from(learningUserBadges).where(eq(learningUserBadges.userId, userId));
    const earnedBadgeIds = userBadges.map(ub => ub.badgeId);
    
    const allBadges = await db.select().from(learningBadges).where(eq(learningBadges.isActive, true));
    
    for (const badge of allBadges) {
      if (earnedBadgeIds.includes(badge.id)) continue; // Already earned
      
      const requirements = badge.requirements as any;
      let canEarn = false;
      
      if (requirements.completedLessons) {
        canEarn = (stats.completedLessons || 0) >= requirements.completedLessons;
      }
      
      if (requirements.masteredLessons) {
        const masteredCount = userProgress.filter(p => p.status === 'mastered').length;
        canEarn = masteredCount >= requirements.masteredLessons.length;
      }
      
      if (requirements.completedTrack) {
        // Check if entire track is completed
        const trackLessons = await db.select()
          .from(learningLessons)
          .where(eq(learningLessons.track, requirements.completedTrack));
        
        const completedInTrack = userProgress.filter(p => 
          p.status === 'completed' || p.status === 'mastered'
        ).length;
        
        canEarn = completedInTrack >= trackLessons.length;
      }
      
      if (canEarn) {
        await this.awardBadge(userId, badge.id, badge.xpReward || 0);
      }
    }
  }

  private async awardBadge(userId: string, badgeId: number, xpReward: number): Promise<void> {
    // Award badge
    await db.insert(learningUserBadges).values({
      userId,
      badgeId
    });
    
    // Add XP reward
    const stats = await this.getUserStats(userId);
    await db.update(learningStats)
      .set({
        totalXp: (stats.totalXp || 0) + xpReward
      })
      .where(eq(learningStats.userId, userId));
  }

  // Get user badges
  async getUserBadges(userId: string): Promise<Array<LearningBadge & { earnedAt: Date }>> {
    const result = await db.select({
      badge: learningBadges,
      earnedAt: learningUserBadges.earnedAt
    })
    .from(learningUserBadges)
    .innerJoin(learningBadges, eq(learningUserBadges.badgeId, learningBadges.id))
    .where(eq(learningUserBadges.userId, userId))
    .orderBy(desc(learningUserBadges.earnedAt));

    return result.map(r => ({ ...r.badge, earnedAt: r.earnedAt }));
  }

  // Get learning dashboard data
  async getDashboardData(userId: string) {
    const stats = await this.getUserStats(userId);
    const badges = await this.getUserBadges(userId);
    const availableLessons = await this.getAvailableLessons(userId);
    const recentProgress = await db.select()
      .from(learningProgress)
      .where(eq(learningProgress.userId, userId))
      .orderBy(desc(learningProgress.createdAt))
      .limit(5);

    // Get user progress to include completion status
    const userProgress = await db.select()
      .from(learningProgress)
      .where(eq(learningProgress.userId, userId));
    
    const progressMap = new Map(userProgress.map(p => [p.lessonId, p]));

    // Add completion status to available lessons
    const lessonsWithStatus = availableLessons.map(lesson => ({
      ...lesson,
      userProgress: progressMap.get(lesson.id) || null
    }));

    return {
      stats,
      badges,
      availableLessons: lessonsWithStatus,
      recentProgress,
      canAccessSynastry: await this.canAccessSynastry(userId)
    };
  }

  // Check if user has completed enough to unlock synastry
  private async canAccessSynastry(userId: string): Promise<boolean> {
    const userBadges = await this.getUserBadges(userId);
    return userBadges.some(badge => badge.name === 'Chart Interpreter');
  }
}

export const learningService = new LearningService();