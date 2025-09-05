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
  userProgress?: any;
  nextLessonId?: number | null;
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
        lessonNumber: 2,
        title: 'The Four Elements: Fire, Earth, Air & Water',
        description: 'Learn about the elemental foundation of astrology and how your sun sign expresses its element.',
        content: {
          sections: [
            {
              type: 'introduction',
              content: 'The four elements (fire, earth, air, water) are the building blocks of astrology, each bringing distinct qualities and approaches to life.'
            },
            {
              type: 'elemental-overview',
              content: 'Understand how each element influences personality, behavior, and life approach.'
            },
            {
              type: 'personal-insight',
              content: 'Discover how your sun sign expresses its elemental nature and what this means for your personality.'
            }
          ]
        },
        requiredLessons: ['basics-1'],
        xpReward: 15,
        estimatedMinutes: 10
      },
      {
        track: 'basics',
        lessonNumber: 3,
        title: 'The Three Modalities: Cardinal, Fixed & Mutable',
        description: 'Explore how the three modalities describe different approaches to action and change.',
        content: {
          sections: [
            {
              type: 'introduction',
              content: 'The three modalities (cardinal, fixed, mutable) describe how signs initiate, sustain, and adapt to change.'
            },
            {
              type: 'modality-overview',
              content: 'Learn the unique characteristics and strengths of each modality.'
            },
            {
              type: 'personal-insight',
              content: 'Understand how your sun sign\'s modality influences your approach to goals, challenges, and life changes.'
            }
          ]
        },
        requiredLessons: ['basics-2'],
        xpReward: 15,
        estimatedMinutes: 10
      },
      {
        track: 'basics',
        lessonNumber: 4,
        title: 'Your Moon Sign: Emotional Nature',
        description: 'Discover your inner emotional world and what makes you feel secure and nurtured.',
        content: {
          sections: [
            {
              type: 'introduction',
              content: 'Your moon sign represents your emotional nature, instinctive reactions, and deepest needs.'
            },
            {
              type: 'personal-insight',
              content: 'Explore how your moon sign influences your emotional responses and what nurtures your soul.'
            }
          ]
        },
        requiredLessons: ['basics-3'],
        xpReward: 15,
        estimatedMinutes: 8
      },
      {
        track: 'basics',
        lessonNumber: 5,
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
        requiredLessons: ['basics-4'],
        xpReward: 15,
        estimatedMinutes: 8
      },
      {
        track: 'basics',
        lessonNumber: 6,
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
        requiredLessons: ['basics-5'],
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
        requiredLessons: ['basics-6'],
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
      {
        track: 'planets',
        lessonNumber: 4,
        title: 'Jupiter: Your Growth and Expansion',
        description: 'Discover how Jupiter brings luck, wisdom, and opportunities for growth into your life.',
        content: {
          sections: [
            {
              type: 'introduction',
              content: 'Jupiter is the planet of expansion, luck, wisdom, and higher learning, showing where you naturally grow and find abundance.'
            },
            {
              type: 'personal-insight',
              content: 'Learn how your Jupiter sign influences your philosophical outlook, teaching style, and where life brings you the most growth.'
            }
          ]
        },
        requiredLessons: ['planets-3'],
        xpReward: 18,
        estimatedMinutes: 10
      },
      {
        track: 'planets',
        lessonNumber: 5,
        title: 'Saturn: Your Discipline and Life Lessons',
        description: 'Understand how Saturn teaches you responsibility, structure, and your most important life lessons.',
        content: {
          sections: [
            {
              type: 'introduction',
              content: 'Saturn represents discipline, responsibility, and the life lessons that help you build lasting foundations and achieve mastery.'
            },
            {
              type: 'personal-insight',
              content: 'Explore how your Saturn sign reveals your relationship with authority, your work ethic, and the challenges that ultimately make you stronger.'
            }
          ]
        },
        requiredLessons: ['planets-4'],
        xpReward: 18,
        estimatedMinutes: 10
      },
      {
        track: 'planets',
        lessonNumber: 6,
        title: 'Uranus: Your Innovation and Rebellion',
        description: 'Learn how Uranus brings sudden changes, innovation, and your unique genius into your life.',
        content: {
          sections: [
            {
              type: 'introduction',
              content: 'Uranus represents innovation, rebellion, sudden changes, and your unique genius that sets you apart from others.'
            },
            {
              type: 'personal-insight',
              content: 'Discover how your Uranus sign influences your need for freedom, your innovative ideas, and where you break from tradition.'
            }
          ]
        },
        requiredLessons: ['planets-5'],
        xpReward: 20,
        estimatedMinutes: 12
      },
      {
        track: 'planets',
        lessonNumber: 7,
        title: 'Neptune: Your Dreams and Spirituality',
        description: 'Explore how Neptune connects you to dreams, intuition, and spiritual realms.',
        content: {
          sections: [
            {
              type: 'introduction',
              content: 'Neptune governs dreams, intuition, spirituality, and imagination, showing where you connect with the mystical and transcendent.'
            },
            {
              type: 'personal-insight',
              content: 'Learn how your Neptune sign influences your spiritual path, creative inspiration, and areas where you may experience illusion or confusion.'
            }
          ]
        },
        requiredLessons: ['planets-6'],
        xpReward: 20,
        estimatedMinutes: 12
      },
      {
        track: 'planets',
        lessonNumber: 8,
        title: 'Pluto: Your Transformation and Power',
        description: 'Understand how Pluto brings deep transformation, power, and rebirth into your life.',
        content: {
          sections: [
            {
              type: 'introduction',
              content: 'Pluto represents transformation, power, death and rebirth, revealing where you experience the most profound changes and access your deepest strength.'
            },
            {
              type: 'personal-insight',
              content: 'Discover how your Pluto sign influences your relationship with power, your capacity for transformation, and your ability to regenerate after challenges.'
            }
          ]
        },
        requiredLessons: ['planets-7'],
        xpReward: 22,
        estimatedMinutes: 15
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
      },

      // LUNAR NODES TRACK
      {
        track: 'nodes',
        lessonNumber: 1,
        title: 'Understanding the Lunar Nodes: Your Soul\'s Journey',
        description: 'Introduction to the North and South Nodes and their role in your karmic path.',
        content: {
          sections: [
            {
              type: 'introduction',
              content: 'The Lunar Nodes represent your soul\'s journey - where you\'re coming from (South Node) and where you\'re going (North Node).'
            },
            {
              type: 'karmic-overview',
              content: 'Learn how the nodes reveal your past life patterns and current life purpose.'
            }
          ]
        },
        requiredLessons: ['planets-8'],
        xpReward: 25,
        estimatedMinutes: 15
      },
      {
        track: 'nodes',
        lessonNumber: 2,
        title: 'North Node Deep Dive: Your Life Purpose & Growth Edge',
        description: 'Explore your North Node sign and house to understand your soul\'s growth direction.',
        content: {
          sections: [
            {
              type: 'introduction',
              content: 'Your North Node represents your soul\'s growth edge - the qualities you\'re developing in this lifetime.'
            },
            {
              type: 'purpose-insight',
              content: 'Discover how to embrace your North Node energy for spiritual evolution and life fulfillment.'
            }
          ]
        },
        requiredLessons: ['nodes-1'],
        xpReward: 25,
        estimatedMinutes: 15
      },
      {
        track: 'nodes',
        lessonNumber: 3,
        title: 'South Node Mastery: Your Past Life Gifts & Patterns',
        description: 'Understand your South Node talents while learning to release limiting patterns.',
        content: {
          sections: [
            {
              type: 'introduction',
              content: 'Your South Node represents your past life mastery - talents to use and patterns to transcend.'
            },
            {
              type: 'balance-insight',
              content: 'Learn how to honor your South Node gifts while avoiding over-reliance that blocks growth.'
            }
          ]
        },
        requiredLessons: ['nodes-2'],
        xpReward: 25,
        estimatedMinutes: 15
      },
      {
        track: 'nodes',
        lessonNumber: 4,
        title: 'Nodes in Houses: Where Your Karma Plays Out',
        description: 'Discover how the house positions of your nodes reveal specific life areas for growth.',
        content: {
          sections: [
            {
              type: 'introduction',
              content: 'The houses containing your nodes show exactly where your karmic lessons and growth opportunities appear in daily life.'
            },
            {
              type: 'house-analysis',
              content: 'Explore how your nodal house positions influence career, relationships, and life experiences.'
            }
          ]
        },
        requiredLessons: ['nodes-3'],
        xpReward: 25,
        estimatedMinutes: 15
      },
      {
        track: 'nodes',
        lessonNumber: 5,
        title: 'Nodal Aspects: How Other Planets Support Your Path',
        description: 'Learn how planets aspecting your nodes either support or challenge your soul\'s journey.',
        content: {
          sections: [
            {
              type: 'introduction',
              content: 'Planets making aspects to your nodes provide additional tools, challenges, or support for your karmic evolution.'
            },
            {
              type: 'aspect-integration',
              content: 'Understand how to work with nodal aspects for accelerated spiritual growth and life purpose alignment.'
            }
          ]
        },
        requiredLessons: ['nodes-4'],
        xpReward: 30,
        estimatedMinutes: 18
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

  // Get the next lesson in the same track
  async getNextLessonInTrack(currentTrack: string, currentLessonNumber: number): Promise<LearningLesson | null> {
    const [nextLesson] = await db.select().from(learningLessons)
      .where(and(
        eq(learningLessons.track, currentTrack),
        eq(learningLessons.lessonNumber, currentLessonNumber + 1),
        eq(learningLessons.isActive, true)
      ));
    
    return nextLesson || null;
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
    const personalizedContent = await this.personalizeContent(lesson, userChartData);

    return {
      lesson,
      personalizedContent,
      userChartData,
      userProgress: userProgress || null
    };
  }

  private async personalizeContent(lesson: LearningLesson, chartData: any): Promise<LessonContent[]> {
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
          } else if (lesson.lessonNumber === 2) { // Elements
            const sunElement = this.getSignElement(chartData.sunSign);
            content.push({
              type: 'text',
              data: {
                title: `The Four Elements in Astrology`,
                content: this.getElementsOverview()
              }
            });
            content.push({
              type: 'text',
              data: {
                title: `Your ${chartData.sunSign} Sun: ${sunElement.charAt(0).toUpperCase() + sunElement.slice(1)} Element Expression`,
                content: this.getElementExpression(chartData.sunSign, sunElement)
              }
            });
            content.push({
              type: 'interactive',
              data: {
                type: 'element-explorer',
                sign: chartData.sunSign,
                element: sunElement
              }
            });
          } else if (lesson.lessonNumber === 3) { // Modalities
            const sunModality = this.getSignModality(chartData.sunSign);
            content.push({
              type: 'text',
              data: {
                title: `The Three Modalities in Astrology`,
                content: this.getModalitiesOverview()
              }
            });
            content.push({
              type: 'text',
              data: {
                title: `Your ${chartData.sunSign} Sun: ${sunModality.charAt(0).toUpperCase() + sunModality.slice(1)} Modality Expression`,
                content: this.getModalityExpression(chartData.sunSign, sunModality)
              }
            });
            content.push({
              type: 'interactive',
              data: {
                type: 'modality-explorer',
                sign: chartData.sunSign,
                modality: sunModality
              }
            });
          } else if (lesson.lessonNumber === 5) { // Rising
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
          } else if (lesson.lessonNumber === 4 || lesson.lessonNumber === 6) { // Big Three Integration (handle both old and new numbering)
            content.push({
              type: 'text',
              data: {
                title: `Your Complete Astrological Identity`,
                content: `Your Big Three create a complex interplay that forms your complete astrological identity. Understanding how your ${chartData.sunSign} Sun, ${chartData.moonSign} Moon, and ${chartData.risingSign} Rising work together reveals the full depth of your personality.`
              }
            });
            content.push({
              type: 'text',
              data: {
                title: `Your ${chartData.sunSign}-${chartData.moonSign}-${chartData.risingSign} Synthesis`,
                content: this.getBigThreeIntegration(chartData.sunSign, chartData.moonSign, chartData.risingSign)
              }
            });
            content.push({
              type: 'interactive',
              data: {
                type: 'big-three-synthesis',
                sun: chartData.sunSign,
                moon: chartData.moonSign,
                rising: chartData.risingSign,
                element: 'big-three'
              }
            });
            content.push({
              type: 'chart-highlight',
              data: {
                element: `Your Complete Big Three`,
                description: 'See how your Sun, Moon, and Rising signs are positioned in your birth chart and how they work together to create your unique astrological blueprint'
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
          } else if (lesson.lessonNumber === 4) { // Jupiter
            const jupiterData = chartData.detailedChart?.planets?.find((p: any) => p.planet === 'Jupiter');
            const jupiterSign = jupiterData?.sign || chartData.sunSign; // Fallback to sun sign
            
            content.push({
              type: 'text',
              data: {
                title: `Your Jupiter in ${jupiterSign}`,
                content: this.getJupiterSignInsights(jupiterSign)
              }
            });
            content.push({
              type: 'interactive',
              data: {
                type: 'expansion-explorer',
                sign: jupiterSign,
                element: 'jupiter'
              }
            });
            content.push({
              type: 'chart-highlight',
              data: {
                element: `Jupiter in ${jupiterSign}`,
                description: 'Discover where Jupiter brings luck and expansion to your life through its chart placement'
              }
            });
          } else if (lesson.lessonNumber === 5) { // Saturn
            const saturnData = chartData.detailedChart?.planets?.find((p: any) => p.planet === 'Saturn');
            const saturnSign = saturnData?.sign || chartData.sunSign; // Fallback to sun sign
            
            content.push({
              type: 'text',
              data: {
                title: `Your Saturn in ${saturnSign}`,
                content: this.getSaturnSignInsights(saturnSign)
              }
            });
            content.push({
              type: 'interactive',
              data: {
                type: 'discipline-explorer',
                sign: saturnSign,
                element: 'saturn'
              }
            });
            content.push({
              type: 'chart-highlight',
              data: {
                element: `Saturn in ${saturnSign}`,
                description: 'See where Saturn teaches your most important life lessons through its chart position'
              }
            });
          } else if (lesson.lessonNumber === 6) { // Uranus
            const uranusData = chartData.detailedChart?.planets?.find((p: any) => p.planet === 'Uranus');
            const uranusSign = uranusData?.sign || chartData.sunSign; // Fallback to sun sign
            
            content.push({
              type: 'text',
              data: {
                title: `Your Uranus in ${uranusSign}`,
                content: this.getUranusSignInsights(uranusSign)
              }
            });
            content.push({
              type: 'interactive',
              data: {
                type: 'innovation-explorer',
                sign: uranusSign,
                element: 'uranus'
              }
            });
            content.push({
              type: 'chart-highlight',
              data: {
                element: `Uranus in ${uranusSign}`,
                description: 'Explore where Uranus brings sudden changes and innovation to your life path'
              }
            });
          } else if (lesson.lessonNumber === 7) { // Neptune
            const neptuneData = chartData.detailedChart?.planets?.find((p: any) => p.planet === 'Neptune');
            const neptuneSign = neptuneData?.sign || chartData.sunSign; // Fallback to sun sign
            
            content.push({
              type: 'text',
              data: {
                title: `Your Neptune in ${neptuneSign}`,
                content: this.getNeptuneSignInsights(neptuneSign)
              }
            });
            content.push({
              type: 'interactive',
              data: {
                type: 'spirituality-explorer',
                sign: neptuneSign,
                element: 'neptune'
              }
            });
            content.push({
              type: 'chart-highlight',
              data: {
                element: `Neptune in ${neptuneSign}`,
                description: 'Discover where Neptune connects you to dreams and spirituality in your chart'
              }
            });
          } else if (lesson.lessonNumber === 8) { // Pluto
            const plutoData = chartData.detailedChart?.planets?.find((p: any) => p.planet === 'Pluto');
            const plutoSign = plutoData?.sign || chartData.sunSign; // Fallback to sun sign
            
            content.push({
              type: 'text',
              data: {
                title: `Your Pluto in ${plutoSign}`,
                content: this.getPlutoSignInsights(plutoSign)
              }
            });
            content.push({
              type: 'interactive',
              data: {
                type: 'transformation-explorer',
                sign: plutoSign,
                element: 'pluto'
              }
            });
            content.push({
              type: 'chart-highlight',
              data: {
                element: `Pluto in ${plutoSign}`,
                description: 'See where Pluto brings deep transformation and power to your life journey'
              }
            });
          }
          break;

        case 'houses':
          if (lesson.lessonNumber === 1) { // The 12 Houses: Life's Different Areas
            content.push({
              type: 'text',
              data: {
                title: `The 12 Houses of Astrology`,
                content: this.getHousesOverview()
              }
            });
            content.push({
              type: 'text',
              data: {
                title: `House Themes and Life Areas`,
                content: this.getHouseThemesExplanation()
              }
            });
            content.push({
              type: 'interactive',
              data: {
                type: 'house-overview',
                element: 'houses-general'
              }
            });
          } else if (lesson.lessonNumber === 2) { // Your Personal Houses
            // Get personalized house data
            const houseData = chartData.birthData?.date && chartData.birthData?.time && chartData.birthData?.location 
              ? await this.getPersonalizedHouses(chartData.birthData.date, chartData.birthData.time, chartData.birthData.location)
              : null;
            
            
            content.push({
              type: 'text',
              data: {
                title: `Your Personal House System`,
                content: `Your ${chartData.risingSign} Rising sets your entire house system. Each house cusp is ruled by a different sign, creating a unique blueprint for how life areas unfold for you.`
              }
            });
            
            if (houseData && houseData.houses) {
              // Add detailed house-by-house breakdown
              const housesArray = Object.entries(houseData.houses).slice(0, 4); // Show first 4 houses as examples
              const houseDescriptions = housesArray.map(([houseKey, houseInfo]: [string, any]) => {
                const houseNumber = parseInt(houseKey.replace('house_', ''));
                const houseTheme = this.getHouseTheme(houseNumber);
                return `**${this.getOrdinal(houseNumber)} House (${houseTheme}):** ${houseInfo.sign} rules this area, ${this.getHouseSignMeaning(houseInfo.sign, houseNumber)}`;
              }).join('\n\n');
              
              content.push({
                type: 'text',
                data: {
                  title: `Your Key House Rulers`,
                  content: houseDescriptions + `\n\n*Note: This lesson introduces your house system with the first 4 houses. The interactive section below shows all 12 houses organized into 3 logical groups for easier learning.*`
                }
              });
              
              content.push({
                type: 'interactive',
                data: {
                  type: 'personal-houses',
                  houseData: houseData.houses,
                  element: 'personal-houses'
                }
              });
            } else {
              content.push({
                type: 'text',
                data: {
                  title: `Complete Birth Information Needed`,
                  content: `To show your personalized house system, we need your complete birth date, time, and location. This lesson will show general house meanings until you complete your profile.`
                }
              });
            }
          }
          break;

        case 'nodes':
          if (lesson.lessonNumber === 1) { // Understanding the Lunar Nodes
            const northNodeData = chartData.detailedChart?.planets?.find((p: any) => p.planet === 'North Node');
            const southNodeData = chartData.detailedChart?.planets?.find((p: any) => p.planet === 'South Node');
            const northNodeSign = northNodeData?.sign || 'Aries';
            const southNodeSign = southNodeData?.sign || 'Libra';
            
            content.push({
              type: 'text',
              data: {
                title: `Your Karmic Axis: ${northNodeSign} North Node - ${southNodeSign} South Node`,
                content: this.getNodalAxisInsights(northNodeSign, southNodeSign)
              }
            });
            content.push({
              type: 'interactive',
              data: {
                type: 'karmic-journey',
                northNode: northNodeSign,
                southNode: southNodeSign,
                element: 'nodes'
              }
            });
          } else if (lesson.lessonNumber === 2) { // North Node Deep Dive
            const northNodeData = chartData.detailedChart?.planets?.find((p: any) => p.planet === 'North Node');
            const northNodeSign = northNodeData?.sign || 'Aries';
            
            content.push({
              type: 'text',
              data: {
                title: `Your North Node in ${northNodeSign}`,
                content: this.getNorthNodeInsights(northNodeSign)
              }
            });
            content.push({
              type: 'interactive',
              data: {
                type: 'purpose-explorer',
                sign: northNodeSign,
                element: 'north-node'
              }
            });
          } else if (lesson.lessonNumber === 3) { // South Node Mastery
            const southNodeData = chartData.detailedChart?.planets?.find((p: any) => p.planet === 'South Node');
            const southNodeSign = southNodeData?.sign || 'Libra';
            
            content.push({
              type: 'text',
              data: {
                title: `Your South Node in ${southNodeSign}`,
                content: this.getSouthNodeInsights(southNodeSign)
              }
            });
            content.push({
              type: 'interactive',
              data: {
                type: 'past-life-explorer',
                sign: southNodeSign,
                element: 'south-node'
              }
            });
          } else if (lesson.lessonNumber === 4) { // Nodes in Houses
            const northNodeData = chartData.detailedChart?.planets?.find((p: any) => p.planet === 'North Node');
            const southNodeData = chartData.detailedChart?.planets?.find((p: any) => p.planet === 'South Node');
            const northNodeHouse = northNodeData?.house || 1;
            const southNodeHouse = southNodeData?.house || 7;
            
            content.push({
              type: 'text',
              data: {
                title: `Nodes in Houses: ${northNodeHouse}th House Growth - ${southNodeHouse}th House Release`,
                content: this.getNodalHouseInsights(northNodeHouse, southNodeHouse)
              }
            });
            content.push({
              type: 'interactive',
              data: {
                type: 'house-karma',
                northHouse: northNodeHouse,
                southHouse: southNodeHouse,
                element: 'nodal-houses'
              }
            });
          } else if (lesson.lessonNumber === 5) { // Nodal Aspects
            const northNodeData = chartData.detailedChart?.planets?.find((p: any) => p.planet === 'North Node');
            const aspects = chartData.detailedChart?.aspects?.filter((asp: any) => 
              asp.planet1 === 'North Node' || asp.planet2 === 'North Node'
            ) || [];
            
            content.push({
              type: 'text',
              data: {
                title: `Your Nodal Aspects: Planetary Support for Your Path`,
                content: this.getNodalAspectsInsights(aspects)
              }
            });
            content.push({
              type: 'interactive',
              data: {
                type: 'aspect-support',
                aspects: aspects,
                element: 'nodal-aspects'
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

  private getBigThreeIntegration(sunSign: string, moonSign: string, risingSign: string): string {
    // Create a comprehensive integration based on the combination
    const sunElement = this.getSignElement(sunSign);
    const moonElement = this.getSignElement(moonSign);
    const risingElement = this.getSignElement(risingSign);
    
    const sunModality = this.getSignModality(sunSign);
    const moonModality = this.getSignModality(moonSign);
    const risingModality = this.getSignModality(risingSign);

    let integration = `Your ${sunSign} Sun, ${moonSign} Moon, and ${risingSign} Rising create a unique astrological signature. `;
    
    // Analyze element balance
    const elements = [sunElement, moonElement, risingElement];
    const elementCounts = elements.reduce((acc, el) => {
      acc[el] = (acc[el] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const dominantElement = Object.keys(elementCounts).reduce((a, b) => 
      elementCounts[a] > elementCounts[b] ? a : b
    );
    
    if (elementCounts[dominantElement] >= 2) {
      integration += `With ${elementCounts[dominantElement]} of your Big Three in ${dominantElement} signs, you have a strong ${dominantElement} emphasis, bringing ${this.getElementQualities(dominantElement)} to your core personality. `;
    } else {
      integration += `Your Big Three span different elements, creating a balanced but complex personality that draws from ${sunElement}, ${moonElement}, and ${risingElement} energies. `;
    }

    // Analyze potential conflicts and harmonies
    if (sunSign === moonSign) {
      integration += `Your Sun and Moon in the same sign create powerful internal alignment - your conscious goals and emotional needs work in harmony. `;
    } else if (sunElement === moonElement) {
      integration += `Though in different signs, your Sun and Moon share the ${sunElement} element, creating natural compatibility between your identity and emotions. `;
    }

    if (sunSign === risingSign) {
      integration += `With your Sun and Rising in the same sign, your inner self and outer expression are perfectly aligned - what you see is what you get. `;
    } else if (sunElement === risingElement) {
      integration += `Your Sun and Rising share the ${sunElement} element, making it easier for you to express your true self authentically. `;
    }

    integration += `This combination makes you someone who ${this.getSynthesisDescription(sunSign, moonSign, risingSign)}.`;

    return integration;
  }

  private getSignElement(sign: string): string {
    const fireElements = ['Aries', 'Leo', 'Sagittarius'];
    const earthElements = ['Taurus', 'Virgo', 'Capricorn'];
    const airElements = ['Gemini', 'Libra', 'Aquarius'];
    const waterElements = ['Cancer', 'Scorpio', 'Pisces'];
    
    if (fireElements.includes(sign)) return 'fire';
    if (earthElements.includes(sign)) return 'earth';
    if (airElements.includes(sign)) return 'air';
    if (waterElements.includes(sign)) return 'water';
    return 'fire'; // fallback
  }

  private getSignModality(sign: string): string {
    const cardinalSigns = ['Aries', 'Cancer', 'Libra', 'Capricorn'];
    const fixedSigns = ['Taurus', 'Leo', 'Scorpio', 'Aquarius'];
    const mutableSigns = ['Gemini', 'Virgo', 'Sagittarius', 'Pisces'];
    
    if (cardinalSigns.includes(sign)) return 'cardinal';
    if (fixedSigns.includes(sign)) return 'fixed';
    if (mutableSigns.includes(sign)) return 'mutable';
    return 'cardinal'; // fallback
  }

  private getElementQualities(element: string): string {
    const qualities: Record<string, string> = {
      'fire': 'enthusiasm, passion, and dynamic action',
      'earth': 'stability, practicality, and grounded wisdom',
      'air': 'intellectual curiosity, communication, and social connection',
      'water': 'emotional depth, intuition, and empathetic understanding'
    };
    return qualities[element] || 'unique qualities';
  }

  private getSynthesisDescription(sunSign: string, moonSign: string, risingSign: string): string {
    // This would be a complex function that considers many combinations
    // For now, provide a general synthesis
    return `outwardly appears as ${risingSign} energy while being driven by ${sunSign} core motivations and emotionally nurtured by ${moonSign} needs - a fascinating blend that creates your distinctive personality and approach to life`;
  }

  private getElementsOverview(): string {
    return `The four elements form the foundation of astrology, each representing a fundamental energy type that influences how signs express themselves:

**Fire Signs (Aries, Leo, Sagittarius):** Passionate, energetic, and dynamic. Fire element brings enthusiasm, creativity, and the drive to initiate and inspire. Fire signs are natural leaders who act on instinct and radiate warmth and confidence.

**Earth Signs (Taurus, Virgo, Capricorn):** Practical, stable, and grounded. Earth element brings reliability, patience, and the ability to build lasting foundations. Earth signs value security, work steadily toward goals, and have a natural connection to the physical world.

**Air Signs (Gemini, Libra, Aquarius):** Intellectual, communicative, and social. Air element brings curiosity, mental agility, and the ability to connect ideas and people. Air signs think before they act, value relationships and ideas, and excel at communication.

**Water Signs (Cancer, Scorpio, Pisces):** Emotional, intuitive, and empathetic. Water element brings deep feeling, psychic sensitivity, and the ability to flow and adapt. Water signs lead with their hearts, possess strong intuition, and connect deeply with others' emotions.

Each element has its own gifts and challenges, and understanding your elemental nature helps you work with your natural strengths while developing areas that don't come as easily.`;
  }

  private getElementExpression(sunSign: string, element: string): string {
    const expressions: Record<string, Record<string, string>> = {
      fire: {
        'Aries': 'As an Aries, you express fire element through pioneering leadership and direct action. You\'re the spark that ignites new ventures, approaching life with courage, independence, and a "first to try" mentality. Your fire burns bright and fast, making you a natural initiator.',
        'Leo': 'Your Leo fire shines through creative self-expression and generous leadership. You express fire element through drama, warmth, and the desire to inspire others. Your fire is steady and radiant, like the sun, drawing others to your natural magnetism and creative spirit.',
        'Sagittarius': 'As a Sagittarius, you express fire element through exploration and philosophical enthusiasm. Your fire burns for truth, freedom, and adventure. You\'re the eternal student and teacher, expressing fire through your quest for meaning and your ability to inspire others with your optimism.'
      },
      earth: {
        'Taurus': 'Your Taurus nature expresses earth element through stability and sensual appreciation. You approach life methodically, building security through patience and persistence. Your earth energy values quality, beauty, and lasting results, making you a master of creating comfort and abundance.',
        'Virgo': 'As a Virgo, you express earth element through service and practical perfection. Your earth energy manifests as attention to detail, analytical thinking, and the desire to help and improve. You find satisfaction in making things work better and serving others through your skills.',
        'Capricorn': 'Your Capricorn nature channels earth element through ambition and structured achievement. You express earth energy through discipline, responsibility, and the ability to climb any mountain. Your earth is like granite - strong, enduring, and capable of supporting great structures.'
      },
      air: {
        'Gemini': 'As a Gemini, you express air element through curiosity and versatile communication. Your air energy manifests as mental agility, social connection, and the ability to gather and share information. You\'re like a breeze that carries ideas from one place to another, connecting people and concepts.',
        'Libra': 'Your Libra nature expresses air element through harmony and diplomatic communication. You approach life seeking balance, beauty, and fair relationships. Your air energy flows through your ability to see all sides, mediate conflicts, and create peaceful, aesthetically pleasing environments.',
        'Aquarius': 'As an Aquarius, you express air element through innovation and humanitarian ideals. Your air energy manifests as original thinking, group consciousness, and the vision to see possibilities others miss. You\'re like the wind of change, bringing fresh perspectives and progressive ideas.'
      },
      water: {
        'Cancer': 'Your Cancer nature expresses water element through nurturing and emotional protection. You approach life through feelings, intuition, and the desire to care for others. Your water energy flows like a protective tide, creating safe harbors and emotional security for yourself and loved ones.',
        'Scorpio': 'As a Scorpio, you express water element through emotional depth and transformative power. Your water energy is like an underground river - deep, powerful, and capable of reshaping landscapes. You feel everything intensely and have the ability to regenerate and transform through emotional experiences.',
        'Pisces': 'Your Pisces nature channels water element through compassion and spiritual connection. You express water energy through empathy, imagination, and the ability to dissolve boundaries. Your water flows like the ocean - vast, intuitive, and connected to all life, making you naturally compassionate and spiritually aware.'
      }
    };

    return expressions[element]?.[sunSign] || `Your ${sunSign} sun expresses the ${element} element in unique ways that influence your core personality and approach to life.`;
  }

  private getModalitiesOverview(): string {
    return `The three modalities describe how signs handle energy and approach change, creating different styles of action and adaptation:

**Cardinal Signs (Aries, Cancer, Libra, Capricorn):** The initiators and leaders. Cardinal modality brings the energy to start new projects, lead initiatives, and pioneer change. Cardinal signs are naturally motivated to begin things, take charge, and move forward. They excel at getting things started but may struggle with follow-through.

**Fixed Signs (Taurus, Leo, Scorpio, Aquarius):** The sustainers and stabilizers. Fixed modality brings the energy to maintain, preserve, and see things through to completion. Fixed signs provide stability, determination, and the power to resist change when necessary. They excel at persistence and loyalty but may struggle with adaptability.

**Mutable Signs (Gemini, Virgo, Sagittarius, Pisces):** The adapters and synthesizers. Mutable modality brings the energy to adjust, modify, and find flexible solutions. Mutable signs are naturally adaptable, able to see multiple perspectives, and skilled at bringing things to completion. They excel at change and versatility but may struggle with commitment.

Each modality has its season and purpose in the natural cycle - cardinal begins, fixed maintains, and mutable completes and transforms. Understanding your modality helps you recognize your natural approach to goals, challenges, and life changes.`;
  }

  private getModalityExpression(sunSign: string, modality: string): string {
    const expressions: Record<string, Record<string, string>> = {
      cardinal: {
        'Aries': 'As a Cardinal Fire sign, you\'re the ultimate initiator - impulsive, direct, and always ready to start something new. You lead through action and example, preferring to forge ahead rather than wait for permission. Your cardinal nature makes you a natural pioneer who thrives on beginnings and first attempts.',
        'Cancer': 'Your Cardinal Water nature makes you an emotional leader who initiates through caring and protection. You start new ventures to create security for yourself and others. Your cardinal energy manifests as taking charge of emotional situations and pioneering new ways to nurture and support.',
        'Libra': 'As a Cardinal Air sign, you initiate through relationships and social harmony. You\'re motivated to start projects that bring people together and create balance. Your cardinal nature expresses as taking the lead in partnerships and being the first to extend the olive branch or suggest compromise.',
        'Capricorn': 'Your Cardinal Earth energy makes you an ambitious initiator who starts projects with long-term success in mind. You naturally take on leadership roles and responsibility, preferring to be in charge of your destiny. Your cardinal nature manifests as the drive to climb higher and achieve lasting accomplishments.'
      },
      fixed: {
        'Taurus': 'As a Fixed Earth sign, you provide stability through consistency and determination. Once you commit to something, you see it through with remarkable persistence. Your fixed nature makes you reliable, loyal, and resistant to change - you\'d rather perfect what exists than start over.',
        'Leo': 'Your Fixed Fire nature gives you the power to sustain creativity and maintain leadership over time. You have remarkable staying power in your creative endeavors and relationships. Your fixed energy manifests as loyalty, consistency in self-expression, and the ability to shine steadily rather than in brief bursts.',
        'Scorpio': 'As a Fixed Water sign, you possess incredible emotional depth and transformative staying power. You don\'t just experience change - you sustain it until complete metamorphosis occurs. Your fixed nature gives you the ability to dive deep and stay committed to emotional or psychological transformation.',
        'Aquarius': 'Your Fixed Air energy sustains innovative ideas and progressive ideals over time. You have the determination to stick with humanitarian causes and unique perspectives, even when others don\'t understand. Your fixed nature manifests as unwavering commitment to your principles and vision of the future.'
      },
      mutable: {
        'Gemini': 'As a Mutable Air sign, you adapt through mental flexibility and communication skills. You easily adjust your thinking, gather new information, and find multiple solutions to problems. Your mutable nature makes you versatile, curious, and able to see situations from many angles.',
        'Virgo': 'Your Mutable Earth energy expresses as practical adaptability and problem-solving skills. You can adjust systems, improve processes, and find workable solutions to everyday challenges. Your mutable nature manifests as the ability to refine, perfect, and adapt practical approaches until they work perfectly.',
        'Sagittarius': 'As a Mutable Fire sign, you adapt through expanding your horizons and embracing new philosophies. You\'re flexible in your beliefs, always ready to learn something new that might change your perspective. Your mutable nature gives you the ability to synthesize different ideas into a broader understanding.',
        'Pisces': 'Your Mutable Water nature provides emotional adaptability and intuitive flexibility. You can flow with changing circumstances and adapt your emotional responses to what\'s needed. Your mutable energy manifests as empathy, spiritual flexibility, and the ability to dissolve boundaries when connection is needed.'
      }
    };

    return expressions[modality]?.[sunSign] || `Your ${sunSign} sun expresses the ${modality} modality in ways that influence how you approach goals, handle change, and interact with the world.`;
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

  private getJupiterSignInsights(jupiterSign: string): string {
    const insights: Record<string, string> = {
      'Aries': 'Jupiter in Aries brings luck through leadership and pioneering ventures. You grow by taking bold initiatives, starting new projects, and inspiring others with your courage and enthusiasm.',
      'Taurus': 'Jupiter in Taurus brings abundance through patience and practical wisdom. You grow by building stable foundations, appreciating beauty, and sharing your natural talents for creating lasting value.',
      'Gemini': 'Jupiter in Gemini expands through communication and learning. You grow by connecting diverse ideas, teaching others, and exploring multiple interests with curiosity and adaptability.',
      'Cancer': 'Jupiter in Cancer brings growth through nurturing and emotional wisdom. You expand by caring for others, honoring traditions, and creating secure, supportive environments.',
      'Leo': 'Jupiter in Leo brings luck through creative expression and generous leadership. You grow by sharing your talents, inspiring others, and pursuing dramatic, heart-centered goals.',
      'Virgo': 'Jupiter in Virgo expands through service and practical improvement. You grow by helping others, perfecting skills, and finding meaning in detailed, methodical work.',
      'Libra': 'Jupiter in Libra brings abundance through relationships and justice. You grow by creating harmony, advocating for fairness, and building beautiful, balanced partnerships.',
      'Scorpio': 'Jupiter in Scorpio expands through transformation and deep investigation. You grow by exploring hidden truths, embracing change, and developing psychological insight.',
      'Sagittarius': 'Jupiter in Sagittarius brings natural luck through exploration and philosophy. You grow by seeking truth, traveling, teaching, and expanding your worldview.',
      'Capricorn': 'Jupiter in Capricorn brings growth through disciplined achievement. You expand by setting ambitious goals, working systematically, and building respected authority.',
      'Aquarius': 'Jupiter in Aquarius expands through innovation and humanitarian ideals. You grow by embracing unique perspectives, working for social progress, and connecting with diverse groups.',
      'Pisces': 'Jupiter in Pisces brings spiritual growth and compassionate wisdom. You expand through intuition, artistic expression, and serving others with empathy and understanding.'
    };
    
    return insights[jupiterSign] || 'Your Jupiter sign shows where you naturally find growth, luck, and expansion in life.';
  }

  private getSaturnSignInsights(saturnSign: string): string {
    const insights: Record<string, string> = {
      'Aries': 'Saturn in Aries teaches patience and thoughtful action. Your lessons involve learning to plan before acting, developing self-discipline, and balancing independence with responsibility.',
      'Taurus': 'Saturn in Taurus teaches flexibility and security balance. Your lessons involve overcoming stubbornness, building practical resources, and finding stability without becoming rigid.',
      'Gemini': 'Saturn in Gemini teaches focused communication and deep learning. Your lessons involve concentrating on fewer subjects, speaking with authority, and developing structured thinking.',
      'Cancer': 'Saturn in Cancer teaches emotional boundaries and mature nurturing. Your lessons involve balancing care for others with self-care, and developing emotional resilience.',
      'Leo': 'Saturn in Leo teaches humble leadership and authentic expression. Your lessons involve earning recognition through merit, expressing creativity responsibly, and leading through service.',
      'Virgo': 'Saturn in Virgo teaches perfect imperfection and practical wisdom. Your lessons involve accepting good enough, developing systematic approaches, and serving others effectively.',
      'Libra': 'Saturn in Libra teaches authentic relationships and decision-making. Your lessons involve making difficult choices, building genuine partnerships, and finding inner balance.',
      'Scorpio': 'Saturn in Scorpio teaches emotional mastery and transformation. Your lessons involve facing fears, developing psychological strength, and using power responsibly.',
      'Sagittarius': 'Saturn in Sagittarius teaches focused wisdom and practical philosophy. Your lessons involve applying beliefs practically, developing expertise, and teaching with authority.',
      'Capricorn': 'Saturn in Capricorn teaches authentic achievement and leadership. Your lessons involve building lasting success, taking responsibility, and creating meaningful structure.',
      'Aquarius': 'Saturn in Aquarius teaches disciplined innovation and group responsibility. Your lessons involve balancing individuality with social duty, and manifesting progressive ideals.',
      'Pisces': 'Saturn in Pisces teaches structured spirituality and grounded compassion. Your lessons involve developing practical mysticism, setting healthy boundaries, and serving others wisely.'
    };
    
    return insights[saturnSign] || 'Your Saturn sign reveals your most important life lessons and areas for developing maturity.';
  }

  private getUranusSignInsights(uranusSign: string): string {
    const insights: Record<string, string> = {
      'Aries': 'Uranus in Aries brings revolutionary leadership and pioneering innovation. You\'re part of a generation that breaks new ground in individual expression and personal freedom.',
      'Taurus': 'Uranus in Taurus brings innovation to values and resources. You\'re part of a generation that revolutionizes money, earth connection, and what society considers valuable.',
      'Gemini': 'Uranus in Gemini revolutionizes communication and learning. You\'re part of a generation that transforms how information spreads and how people connect intellectually.',
      'Cancer': 'Uranus in Cancer brings innovation to home and family. You\'re part of a generation that revolutionizes domestic life, emotional expression, and nurturing approaches.',
      'Leo': 'Uranus in Leo revolutionizes creativity and self-expression. You\'re part of a generation that transforms entertainment, leadership styles, and artistic innovation.',
      'Virgo': 'Uranus in Virgo brings innovation to work and health. You\'re part of a generation that revolutionizes service, daily routines, and approaches to wellness and efficiency.',
      'Libra': 'Uranus in Libra revolutionizes relationships and justice. You\'re part of a generation that transforms partnerships, legal systems, and concepts of fairness and beauty.',
      'Scorpio': 'Uranus in Scorpio brings transformation to power and sexuality. You\'re part of a generation that revolutionizes psychology, hidden knowledge, and approaches to transformation.',
      'Sagittarius': 'Uranus in Sagittarius revolutionizes philosophy and education. You\'re part of a generation that transforms belief systems, higher learning, and global perspectives.',
      'Capricorn': 'Uranus in Capricorn brings innovation to structure and authority. You\'re part of a generation that revolutionizes government, business, and traditional hierarchies.',
      'Aquarius': 'Uranus in Aquarius revolutionizes technology and humanity. You\'re part of a generation that transforms social systems, friendship, and technological advancement.',
      'Pisces': 'Uranus in Pisces brings innovation to spirituality and compassion. You\'re part of a generation that revolutionizes mysticism, art, and approaches to universal love.'
    };
    
    return insights[uranusSign] || 'Your Uranus sign reveals your generational role in bringing innovation and change to the world.';
  }

  private getNeptuneSignInsights(neptuneSign: string): string {
    const insights: Record<string, string> = {
      'Aries': 'Neptune in Aries brings spiritual pioneering and mystical action. You\'re part of a generation that seeks new forms of spiritual expression and active compassion.',
      'Taurus': 'Neptune in Taurus brings earthly spirituality and practical mysticism. You\'re part of a generation that finds the divine in nature and material beauty.',
      'Gemini': 'Neptune in Gemini brings intuitive communication and psychic awareness. You\'re part of a generation that develops telepathic abilities and spiritual learning.',
      'Cancer': 'Neptune in Cancer brings emotional spirituality and psychic sensitivity. You\'re part of a generation that connects deeply with ancestral wisdom and emotional healing.',
      'Leo': 'Neptune in Leo brings creative spirituality and dramatic inspiration. You\'re part of a generation that expresses the divine through art, performance, and heart-centered leadership.',
      'Virgo': 'Neptune in Virgo brings practical spirituality and healing service. You\'re part of a generation that finds the sacred in daily work and devoted service to others.',
      'Libra': 'Neptune in Libra brings harmony-seeking spirituality and relationship mysticism. You\'re part of a generation that seeks the divine through partnership and artistic beauty.',
      'Scorpio': 'Neptune in Scorpio brings transformative spirituality and psychic depth. You\'re part of a generation that explores the mysteries of death, rebirth, and hidden knowledge.',
      'Sagittarius': 'Neptune in Sagittarius brings philosophical spirituality and global consciousness. You\'re part of a generation that seeks universal truth and worldwide spiritual connection.',
      'Capricorn': 'Neptune in Capricorn brings structured spirituality and practical mysticism. You\'re part of a generation that builds lasting spiritual institutions and grounded wisdom.',
      'Aquarius': 'Neptune in Aquarius brings humanitarian spirituality and technological mysticism. You\'re part of a generation that combines spiritual ideals with progressive innovation.',
      'Pisces': 'Neptune in Pisces brings pure spirituality and universal compassion. You\'re part of a generation with heightened psychic abilities and deep connection to collective consciousness.'
    };
    
    return insights[neptuneSign] || 'Your Neptune sign reveals your generational spiritual gifts and connection to universal consciousness.';
  }

  private getPlutoSignInsights(plutoSign: string): string {
    const insights: Record<string, string> = {
      'Aries': 'Pluto in Aries brings transformative leadership and revolutionary power. You\'re part of a generation that transforms through direct action and pioneering change.',
      'Taurus': 'Pluto in Taurus brings transformation through values and resources. You\'re part of a generation that revolutionizes money, possessions, and earth connection.',
      'Gemini': 'Pluto in Gemini transforms communication and mental patterns. You\'re part of a generation that revolutionizes thinking, learning, and information exchange.',
      'Cancer': 'Pluto in Cancer transforms family and emotional patterns. You\'re part of a generation that revolutionizes home life, nurturing, and emotional expression.',
      'Leo': 'Pluto in Leo transforms creativity and self-expression. You\'re part of a generation that revolutionizes entertainment, leadership, and individual power.',
      'Virgo': 'Pluto in Virgo transforms work and health systems. You\'re part of a generation that revolutionizes service, daily routines, and approaches to wellness.',
      'Libra': 'Pluto in Libra transforms relationships and justice. You\'re part of a generation that revolutionizes partnerships, legal systems, and concepts of fairness.',
      'Scorpio': 'Pluto in Scorpio brings deep personal transformation and power. You\'re part of a generation that revolutionizes psychology, sexuality, and hidden knowledge.',
      'Sagittarius': 'Pluto in Sagittarius transforms belief systems and global perspectives. You\'re part of a generation that revolutionizes philosophy, education, and worldwide consciousness.',
      'Capricorn': 'Pluto in Capricorn transforms structures and authority. You\'re part of a generation that revolutionizes government, business, and traditional power systems.',
      'Aquarius': 'Pluto in Aquarius transforms technology and humanity. You\'re part of a generation that revolutionizes social systems, friendship, and collective consciousness.',
      'Pisces': 'Pluto in Pisces transforms spirituality and compassion. You\'re part of a generation that revolutionizes mysticism, art, and universal love.'
    };
    
    return insights[plutoSign] || 'Your Pluto sign reveals your generational role in deep transformation and evolutionary change.';
  }

  private getNodalAxisInsights(northNodeSign: string, southNodeSign: string): string {
    const axisInsights: Record<string, string> = {
      'Aries-Libra': 'Your karmic journey involves moving from excessive people-pleasing and relationship dependency (Libra South) toward developing independence, courage, and authentic self-assertion (Aries North). Learn to balance cooperation with healthy self-focus.',
      'Taurus-Scorpio': 'Your soul path leads from intensity and emotional extremes (Scorpio South) toward stability, simplicity, and grounded values (Taurus North). Embrace practical wisdom and peaceful contentment over constant transformation.',
      'Gemini-Sagittarius': 'Your evolution involves moving from dogmatic beliefs and philosophical preaching (Sagittarius South) toward curious learning, open dialogue, and gathering diverse perspectives (Gemini North). Value questions over absolute answers.',
      'Cancer-Capricorn': 'Your growth path leads from rigid authority and cold ambition (Capricorn South) toward emotional intelligence, nurturing, and creating secure foundations (Cancer North). Balance achievement with heart-centered wisdom.',
      'Leo-Aquarius': 'Your karmic journey moves from detached intellectualism and group-think (Aquarius South) toward creative self-expression, heart-centered leadership, and personal authenticity (Leo North). Embrace your unique spark.',
      'Virgo-Pisces': 'Your soul evolution leads from vague idealism and martyrdom (Pisces South) toward practical service, organized healing, and grounded spirituality (Virgo North). Channel compassion through tangible help.'
    };
    
    const reverseAxisInsights: Record<string, string> = {
      'Libra-Aries': 'Your karmic journey involves moving from selfish independence and aggressive impulses (Aries South) toward cooperation, diplomacy, and relationship harmony (Libra North). Learn to balance personal needs with partnership.',
      'Scorpio-Taurus': 'Your soul path leads from material obsession and stubborn resistance (Taurus South) toward emotional depth, transformation, and psychological insight (Scorpio North). Embrace change and explore life\'s mysteries.',
      'Sagittarius-Gemini': 'Your evolution involves moving from scattered thinking and superficial knowledge (Gemini South) toward focused wisdom, teaching, and philosophical depth (Sagittarius North). Seek truth through experience.',
      'Capricorn-Cancer': 'Your growth path leads from emotional neediness and clinging behavior (Cancer South) toward mature responsibility, structured achievement, and earned authority (Capricorn North). Build lasting foundations.',
      'Aquarius-Leo': 'Your karmic journey moves from ego-driven drama and attention-seeking (Leo South) toward humanitarian service, progressive ideals, and group consciousness (Aquarius North). Serve the collective good.',
      'Pisces-Virgo': 'Your soul evolution leads from perfectionist criticism and practical obsession (Virgo South) toward spiritual surrender, compassionate service, and intuitive wisdom (Pisces North). Trust your inner knowing.'
    };
    
    const axis = `${northNodeSign}-${southNodeSign}`;
    const reverseAxis = `${southNodeSign}-${northNodeSign}`;
    
    return axisInsights[axis] || reverseAxisInsights[reverseAxis] || 'Your nodal axis reveals the balance between past life mastery and current life growth.';
  }

  private getNorthNodeInsights(northNodeSign: string): string {
    const insights: Record<string, string> = {
      'Aries': 'Your North Node in Aries calls you to develop courage, independence, and pioneering spirit. Embrace leadership, take initiative, and trust your instincts. Your growth comes through bold action and authentic self-assertion.',
      'Taurus': 'Your North Node in Taurus guides you toward stability, patience, and grounded values. Develop practical skills, appreciate beauty, and build lasting security. Your growth comes through steady progress and sensual awareness.',
      'Gemini': 'Your North Node in Gemini calls for curiosity, communication, and adaptability. Embrace learning, ask questions, and connect diverse ideas. Your growth comes through gathering information and sharing knowledge.',
      'Cancer': 'Your North Node in Cancer guides you toward emotional intelligence, nurturing, and creating security. Develop intuition, care for others, and honor feelings. Your growth comes through heart-centered compassion.',
      'Leo': 'Your North Node in Leo calls you to embrace creativity, leadership, and authentic self-expression. Develop confidence, share your gifts, and inspire others. Your growth comes through heart-centered generosity.',
      'Virgo': 'Your North Node in Virgo guides you toward service, organization, and practical healing. Develop skills, help others, and perfect your craft. Your growth comes through humble service and attention to detail.',
      'Libra': 'Your North Node in Libra calls for cooperation, diplomacy, and relationship harmony. Develop partnership skills, seek balance, and create beauty. Your growth comes through collaboration and consideration.',
      'Scorpio': 'Your North Node in Scorpio guides you toward emotional depth, transformation, and psychological insight. Embrace intensity, explore mysteries, and face fears. Your growth comes through profound change.',
      'Sagittarius': 'Your North Node in Sagittarius calls for wisdom, exploration, and philosophical understanding. Develop broad perspectives, teach others, and seek truth. Your growth comes through expanding horizons.',
      'Capricorn': 'Your North Node in Capricorn guides you toward responsibility, achievement, and building lasting structures. Develop discipline, earn authority, and create stability. Your growth comes through mature leadership.',
      'Aquarius': 'Your North Node in Aquarius calls for innovation, humanitarian service, and progressive ideals. Develop unique perspectives, serve groups, and embrace change. Your growth comes through collective consciousness.',
      'Pisces': 'Your North Node in Pisces guides you toward spirituality, compassion, and intuitive wisdom. Develop faith, serve others, and trust the flow. Your growth comes through surrendering and connecting to the divine.'
    };
    
    return insights[northNodeSign] || 'Your North Node reveals the qualities you\'re developing for spiritual growth and life fulfillment.';
  }

  private getSouthNodeInsights(southNodeSign: string): string {
    const insights: Record<string, string> = {
      'Aries': 'Your South Node in Aries represents mastery of independence, courage, and leadership from past lives. While these are gifts, avoid over-relying on impulsive action, selfishness, or aggressive behavior that blocks growth.',
      'Taurus': 'Your South Node in Taurus shows past life mastery of stability, practical skills, and material abundance. Honor these gifts but avoid stubbornness, material obsession, or resistance to change that limits evolution.',
      'Gemini': 'Your South Node in Gemini represents expertise in communication, learning, and adaptability from previous incarnations. Use these talents but avoid scattered thinking, superficiality, or endless information gathering without depth.',
      'Cancer': 'Your South Node in Cancer shows mastery of nurturing, emotional intelligence, and family bonds. These are valuable gifts, but avoid excessive emotionalism, clinging behavior, or letting feelings override reason.',
      'Leo': 'Your South Node in Leo represents past life expertise in creativity, leadership, and self-expression. Honor your natural talents but avoid ego-driven behavior, attention-seeking, or dramatic manipulation.',
      'Virgo': 'Your South Node in Virgo shows mastery of service, organization, and practical skills. Use these abilities wisely but avoid perfectionism, criticism, or getting lost in details that miss the bigger picture.',
      'Libra': 'Your South Node in Libra represents expertise in relationships, diplomacy, and creating harmony. These are gifts to honor while avoiding people-pleasing, indecision, or losing yourself in others\' needs.',
      'Scorpio': 'Your South Node in Scorpio shows past life mastery of transformation, psychology, and hidden knowledge. Use this wisdom carefully while avoiding manipulation, obsession, or dwelling in emotional intensity.',
      'Sagittarius': 'Your South Node in Sagittarius represents expertise in wisdom, teaching, and philosophical understanding. Honor this knowledge but avoid dogmatism, preaching, or believing you have all the answers.',
      'Capricorn': 'Your South Node in Capricorn shows mastery of leadership, structure, and achievement. These are valuable talents, but avoid rigid authority, emotional coldness, or sacrificing everything for status.',
      'Aquarius': 'Your South Node in Aquarius represents past life expertise in innovation, group consciousness, and progressive ideals. Use these gifts while avoiding emotional detachment, rebelliousness, or intellectual superiority.',
      'Pisces': 'Your South Node in Pisces shows mastery of spirituality, compassion, and intuitive wisdom. Honor these gifts but avoid escapism, victim mentality, or losing yourself in fantasy and illusion.'
    };
    
    return insights[southNodeSign] || 'Your South Node represents past life mastery - gifts to honor while avoiding over-reliance that blocks growth.';
  }

  private getNodalHouseInsights(northHouse: number, southHouse: number): string {
    const houseInsights: Record<string, string> = {
      '1-7': 'Your growth involves moving from over-focus on relationships and others\' needs (7th house South) toward developing personal identity, independence, and self-reliance (1st house North). Balance partnership with authentic self-expression.',
      '2-8': 'Your karmic path leads from intensity around shared resources and others\' values (8th house South) toward building personal security, developing your own talents, and creating stable abundance (2nd house North).',
      '3-9': 'Your evolution involves moving from dogmatic beliefs and distant philosophies (9th house South) toward practical learning, local connections, and everyday communication (3rd house North). Embrace curious questioning.',
      '4-10': 'Your growth path leads from excessive career focus and public achievement (10th house South) toward emotional security, family connections, and creating a nurturing foundation (4th house North).',
      '5-11': 'Your karmic journey moves from group conformity and future worries (11th house South) toward creative self-expression, joy, and heart-centered authenticity (5th house North). Embrace your unique creative spark.',
      '6-12': 'Your soul evolution leads from vague spirituality and escapist tendencies (12th house South) toward practical service, health awareness, and organized daily routines (6th house North). Ground your spiritual insights.',
      '7-1': 'Your growth involves moving from excessive self-focus and independence (1st house South) toward cooperation, partnership, and considering others\' perspectives (7th house North). Learn the art of relationship.',
      '8-2': 'Your karmic path leads from material stubbornness and possessiveness (2nd house South) toward transformation, shared resources, and psychological depth (8th house North). Embrace change and mystery.',
      '9-3': 'Your evolution involves moving from scattered communication and superficial learning (3rd house South) toward wisdom, teaching, and philosophical understanding (9th house North). Seek deeper truth.',
      '10-4': 'Your growth path leads from emotional dependency and family clinging (4th house South) toward professional achievement, public recognition, and earned authority (10th house North). Build your reputation.',
      '11-5': 'Your karmic journey moves from ego-driven creativity and attention-seeking (5th house South) toward group service, friendship, and humanitarian ideals (11th house North). Serve the collective.',
      '12-6': 'Your soul evolution leads from perfectionist criticism and practical obsession (6th house South) toward spiritual surrender, compassion, and intuitive service (12th house North). Trust divine guidance.'
    };
    
    const axis = `${northHouse}-${southHouse}`;
    
    return houseInsights[axis] || `Your nodal houses show growth from ${southHouse}th house patterns toward ${northHouse}th house development.`;
  }

  private getOrdinal(num: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const value = num % 100;
    return num + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
  }

  private getHousesOverview(): string {
    return `The 12 houses are like the stage where your planets perform. Each house represents a different area of life experience - from your identity and resources to your relationships and spirituality. While the signs describe *how* you express energy, the houses show *where* that energy manifests in your actual life circumstances.

Think of the houses as the departments of your life: the 1st house is your personal brand, the 2nd is your resources and values, the 7th is partnerships, the 10th is your career reputation, and so on. Understanding your house system reveals where you'll encounter your greatest challenges, opportunities, and life lessons.`;
  }

  private getHouseThemesExplanation(): string {
    return `**1st House:** Your identity, appearance, first impressions
**2nd House:** Money, possessions, self-worth, values  
**3rd House:** Communication, siblings, local travel, learning
**4th House:** Home, family, roots, emotional foundation
**5th House:** Creativity, romance, children, self-expression
**6th House:** Work, health, daily routines, service
**7th House:** Marriage, partnerships, one-on-one relationships
**8th House:** Shared resources, transformation, deep psychology
**9th House:** Higher education, philosophy, long-distance travel
**10th House:** Career, reputation, public image, achievements
**11th House:** Friends, groups, hopes, social networks
**12th House:** Spirituality, hidden enemies, subconscious, sacrifice

Each house has specific themes, but how these play out depends on which signs rule your house cusps and which planets reside there.`;
  }

  private getHouseTheme(houseNumber: number): string {
    const themes = {
      1: 'Identity & Appearance',
      2: 'Resources & Values', 
      3: 'Communication & Learning',
      4: 'Home & Family',
      5: 'Creativity & Romance',
      6: 'Work & Health',
      7: 'Partnerships & Marriage',
      8: 'Transformation & Shared Resources',
      9: 'Philosophy & Higher Learning',
      10: 'Career & Reputation',
      11: 'Friends & Social Networks',
      12: 'Spirituality & Subconscious'
    };
    return themes[houseNumber as keyof typeof themes] || `House ${houseNumber}`;
  }

  private getHouseSignMeaning(sign: string, houseNumber: number): string {
    const meanings = {
      'Aries': 'bringing bold, pioneering energy to this life area',
      'Taurus': 'creating stability and building lasting value here',
      'Gemini': 'adding curiosity, variety, and communication skills',
      'Cancer': 'bringing nurturing, intuition, and emotional depth',
      'Leo': 'adding creativity, drama, and self-expression',
      'Virgo': 'bringing organization, service, and attention to detail',
      'Libra': 'seeking balance, harmony, and partnership',
      'Scorpio': 'bringing intensity, transformation, and depth',
      'Sagittarius': 'adding adventure, wisdom, and philosophical growth',
      'Capricorn': 'bringing structure, ambition, and long-term planning',
      'Aquarius': 'adding innovation, independence, and humanitarian ideals',
      'Pisces': 'bringing intuition, compassion, and spiritual connection'
    };
    return meanings[sign as keyof typeof meanings] || `coloring this area with ${sign} energy`;
  }

  private async getPersonalizedHouses(date?: string, time?: string, location?: string) {
    if (!date || !time || !location) {
      return null;
    }
    
    try {
      // Use the same astrology service that the API endpoint uses
      const chartData = await astrologyService.calculateBigThreeAccurate({
        date,
        time, 
        location
      });
      
      // Extract houses data similar to the API endpoint
      const housesData: Record<string, any> = {};
      
      if (chartData && (chartData as any).planets) {
        const planetsData = (chartData as any).planets || {};
        
        // Extract house information for each house (1-12)  
        for (let i = 1; i <= 12; i++) {
          const houseKey = `house_${i}`;
          const planetsInHouse = [];
          let houseSign = '';
          
          // Find planets in this house from planets data
          for (const [planetName, planetData] of Object.entries(planetsData)) {
            if (typeof planetData === 'object' && planetData && (planetData as any).house === i) {
              planetsInHouse.push(planetName);
            }
          }
          
          // Try to get house cusp sign - for now use a simplified approach
          // The astrology service should be enhanced to return house cusps
          if (i === 1) {
            houseSign = (chartData as any).risingSign || 'Aries';
          } else {
            // Simplified: each house advances by one sign typically
            const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
            const risingIndex = signs.indexOf((chartData as any).risingSign || 'Aries');
            const houseSignIndex = (risingIndex + i - 1) % 12;
            houseSign = signs[houseSignIndex];
          }
          
          housesData[houseKey] = {
            sign: houseSign,
            planets: planetsInHouse
          };
        }
      }
      
      return { houses: housesData };
    } catch (error) {
      console.error('Error getting personalized houses:', error);
      return null;
    }
  }

  private getNodalAspectsInsights(aspects: any[]): string {
    if (!aspects || aspects.length === 0) {
      return 'Your North Node stands free from major planetary aspects, giving you clear, unobstructed access to your soul\'s growth path. This is a blessing of direct karmic evolution.';
    }

    const aspectInsights = aspects.map(aspect => {
      const planet = aspect.planet1 === 'North Node' ? aspect.planet2 : aspect.planet1;
      const aspectType = aspect.aspect;
      
      const planetSupport: Record<string, string> = {
        'Sun': 'illuminates your life purpose and gives confidence to follow your path',
        'Moon': 'provides emotional support and intuitive guidance for your growth',
        'Mercury': 'assists communication and learning aligned with your soul mission',
        'Venus': 'brings harmony and attractive energy to support your evolution',
        'Mars': 'energizes action and courage needed for your karmic development',
        'Jupiter': 'expands opportunities and brings wisdom to your spiritual journey',
        'Saturn': 'provides structure and discipline needed for mastering your path',
        'Uranus': 'brings innovative insights and sudden awakenings to accelerate growth',
        'Neptune': 'offers spiritual inspiration and intuitive guidance for your mission',
        'Pluto': 'provides transformative power to break through karmic patterns'
      };

      const supportType = planetSupport[planet] || 'influences your karmic path';
      
      if (aspectType === 'conjunction') {
        return `${planet} ${supportType} with direct, powerful energy.`;
      } else if (aspectType === 'trine' || aspectType === 'sextile') {
        return `${planet} ${supportType} with harmonious, flowing assistance.`;
      } else if (aspectType === 'square' || aspectType === 'opposition') {
        return `${planet} challenges you to integrate its energy constructively with your soul path.`;
      } else {
        return `${planet} ${supportType} in a unique way that supports your evolution.`;
      }
    });

    return `Your North Node receives planetary support: ${aspectInsights.join(' ')} These aspects provide the cosmic tools needed for your spiritual evolution.`;
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