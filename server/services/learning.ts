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
        lessonNumber: 3,
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
        lessonNumber: 4,
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
        requiredLessons: ['basics-3'],
        xpReward: 15,
        estimatedMinutes: 10
      },
      {
        track: 'basics',
        lessonNumber: 5,
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
        requiredLessons: ['basics-4'],
        xpReward: 15,
        estimatedMinutes: 8
      },
      {
        track: 'basics',
        lessonNumber: 6,
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
        requiredLessons: ['basics-5'],
        xpReward: 15,
        estimatedMinutes: 8
      },
      {
        track: 'basics',
        lessonNumber: 7,
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
        requiredLessons: ['basics-6'],
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
        requiredLessons: ['basics-7'],
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
        title: 'Personal Foundation: Houses 1-4',
        description: 'Explore your identity, resources, communication, and emotional foundation through houses 1-4.',
        content: {
          sections: [
            {
              type: 'introduction',
              content: 'The first four houses form your personal foundation - your inner circle of identity, values, communication, and roots.'
            },
            {
              type: 'personal-foundation',
              content: 'Discover how houses 1-4 shape your core self and personal experiences.'
            }
          ]
        },
        requiredLessons: ['houses-1'],
        xpReward: 25,
        estimatedMinutes: 15
      },
      {
        track: 'houses',
        lessonNumber: 3,
        title: 'Creative Expression: Houses 5-8',
        description: 'Discover your creativity, work, relationships, and transformation through houses 5-8.',
        content: {
          sections: [
            {
              type: 'introduction',
              content: 'Houses 5-8 govern your creative and relational power - how you express yourself and connect with others.'
            },
            {
              type: 'creative-expression',
              content: 'Explore how houses 5-8 shape your self-expression and relationships.'
            }
          ]
        },
        requiredLessons: ['houses-2'],
        xpReward: 25,
        estimatedMinutes: 15
      },
      {
        track: 'houses',
        lessonNumber: 4,
        title: 'Higher Purpose: Houses 9-12',
        description: 'Understand your beliefs, career, community, and spirituality through houses 9-12.',
        content: {
          sections: [
            {
              type: 'introduction',
              content: 'Houses 9-12 connect you to the world - your philosophy, public image, community, and spiritual path.'
            },
            {
              type: 'higher-purpose',
              content: 'Discover how houses 9-12 reveal your connection to the greater cosmos.'
            }
          ]
        },
        requiredLessons: ['houses-3'],
        xpReward: 25,
        estimatedMinutes: 15
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
          if (lesson.title.includes('Elements') || lesson.title.includes('Fire, Earth, Air')) { // Elements lesson - check title FIRST
            const sunElement = this.getSignElement(chartData.sunSign);
            content.push({
              type: 'text',
              data: {
                title: `Your ${sunElement.charAt(0).toUpperCase() + sunElement.slice(1)} Element`,
                content: this.getPersonalizedElementIntro(chartData.sunSign, sunElement)
              }
            });
            content.push({
              type: 'text',
              data: {
                title: `The Four Elements in Astrology`,
                content: this.getElementsOverview()
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
          } else if (lesson.title.includes('Modalities') || lesson.title.includes('Cardinal, Fixed')) { // Modalities lesson
            const sunModality = this.getSignModality(chartData.sunSign);
            content.push({
              type: 'text',
              data: {
                title: `Your ${sunModality.charAt(0).toUpperCase() + sunModality.slice(1)} Modality`,
                content: this.getPersonalizedModalityIntro(chartData.sunSign, sunModality)
              }
            });
            content.push({
              type: 'text',
              data: {
                title: `The Three Modalities in Astrology`,
                content: this.getModalitiesOverview()
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
          } else if (lesson.title.includes('Sun Sign') || lesson.title.includes('Core of Who You Are')) { // Sun Sign lesson
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
          } else if (lesson.title.includes('Moon') && lesson.title.includes('Inner Emotional')) { // First Moon lesson (lesson 4)
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
          } else if (lesson.title.includes('Rising')) { // Rising lesson (lesson 5)
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
                type: 'rising-explorer',
                sign: chartData.risingSign,
                element: 'rising'
              }
            });
          } else if (lesson.title.includes('Big Three') || lesson.title.includes('Integration')) { // Big Three Integration lesson
            content.push({
              type: 'text',
              data: {
                title: `Your ${chartData.sunSign}-${chartData.moonSign}-${chartData.risingSign} Combination`,
                content: this.getBigThreeIntegration(chartData.sunSign, chartData.moonSign, chartData.risingSign)
              }
            });
            content.push({
              type: 'text',
              data: {
                title: `How Your Big Three Work Together`,
                content: this.getBigThreeInterplay(chartData.sunSign, chartData.moonSign, chartData.risingSign)
              }
            });
            content.push({
              type: 'interactive',
              data: {
                type: 'big-three-integration',
                sun: chartData.sunSign,
                moon: chartData.moonSign,
                rising: chartData.risingSign,
                element: 'big-three'
              }
            });
          } else {
            // Fallback for any other basics lessons that don't have specific handling
            content.push({
              type: 'text',
              data: {
                title: lesson.title,
                content: `This lesson provides insights about ${lesson.title.toLowerCase()} based on your birth chart.`
              }
            });
          }
          break;
        case 'planets':
          // Handle other lesson types
          break;
        default:
          // Default case for unhandled lesson tracks
          content.push({
            type: 'text',
            data: {
              title: lesson.title,
              content: `This ${lesson.track} lesson provides personalized insights based on your astrological chart.`
            }
          });
      }
    }
    
    return content;
  }

  // Additional helper methods
  private getSignElement(sign: string): string {
    const fireElement = ['Aries', 'Leo', 'Sagittarius'];
    const earthElement = ['Taurus', 'Virgo', 'Capricorn'];
    const airElement = ['Gemini', 'Libra', 'Aquarius'];
    const waterElement = ['Cancer', 'Scorpio', 'Pisces'];
    
    if (fireElement.includes(sign)) return 'fire';
    if (earthElement.includes(sign)) return 'earth';
    if (airElement.includes(sign)) return 'air';
    if (waterElement.includes(sign)) return 'water';
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

  private getPersonalizedElementIntro(sunSign: string, element: string): string {
    const elementDescriptions: Record<string, string> = {
      'fire': 'passionate, energetic, and dynamic energy to your core personality. Fire signs are natural leaders who act on instinct and radiate warmth and confidence.',
      'earth': 'practical, stable, and grounded energy to your core personality. Earth signs value security, work steadily toward goals, and have a natural connection to building lasting foundations.',
      'air': 'intellectual, communicative, and social energy to your core personality. Air signs think before they act, value relationships and ideas, and excel at connecting people and concepts.',
      'water': 'emotional, intuitive, and empathetic energy to your core personality. Water signs lead with their hearts, possess strong intuition, and connect deeply with others\' emotions.'
    };

    return `Elements are the fundamental building blocks of astrology - Fire, Earth, Air, and Water. Your ${sunSign} sun means you're a ${element.charAt(0).toUpperCase() + element.slice(1)} sign, which brings ${elementDescriptions[element]} This ${element.charAt(0).toUpperCase() + element.slice(1)} element shapes how you approach life and express your essential nature.`;
  }

  private getPersonalizedModalityIntro(sunSign: string, modality: string): string {
    const modalityDescriptions: Record<string, string> = {
      'cardinal': 'you naturally initiate, lead, and pioneer change. Cardinal signs are motivated to begin things, take charge, and move forward with confidence.',
      'fixed': 'you naturally sustain, preserve, and see things through to completion. Fixed signs provide stability, determination, and the power to maintain focus over time.',
      'mutable': 'you naturally adapt, adjust, and find flexible solutions. Mutable signs are versatile, able to see multiple perspectives, and skilled at refining and perfecting.'
    };

    return `Modalities describe how zodiac signs approach action and change - Cardinal (initiators), Fixed (sustainers), and Mutable (adapters). Your ${sunSign} sun is a ${modality.charAt(0).toUpperCase() + modality.slice(1)} sign, which means ${modalityDescriptions[modality]} This ${modality.charAt(0).toUpperCase() + modality.slice(1)} modality influences how you handle goals, challenges, and life changes.`;
  }

  private getBigThreeIntegration(sunSign: string, moonSign: string, risingSign: string): string {
    return `Your ${sunSign} Sun represents your core identity and conscious will - your essential self that seeks growth and self-expression. Your ${moonSign} Moon governs your emotional nature, instinctive reactions, and what makes you feel safe and nurtured. Your ${risingSign} Rising is your social mask and the energy you project to the world - how others first perceive you and how you navigate new situations. Together, these three form your unique astrological fingerprint, creating a complex interplay between your inner self (Moon), outer self (Rising), and core identity (Sun).`;
  }

  private getBigThreeInterplay(sunSign: string, moonSign: string, risingSign: string): string {
    // Get elements for analysis
    const sunElement = this.getSignElement(sunSign);
    const moonElement = this.getSignElement(moonSign);
    const risingElement = this.getSignElement(risingSign);
    
    // Check for element harmony
    const elements = [sunElement, moonElement, risingElement];
    const uniqueElements = Array.from(new Set(elements));
    
    if (uniqueElements.length === 1) {
      return `Your Big Three all share the ${sunElement} element, creating a harmonious and focused energy. This gives you a strong, consistent approach to life where your emotions (${moonSign} Moon), identity (${sunSign} Sun), and outer expression (${risingSign} Rising) all work in sync. You have a clear, unified energy that others can easily understand and relate to.`;
    } else if (uniqueElements.length === 2) {
      return `Your Big Three blend two elements (${uniqueElements.join(' and ')}), creating an interesting dynamic between different approaches to life. Your ${sunSign} Sun brings ${sunElement} energy to your core identity, while your ${moonSign} Moon adds ${moonElement} emotional patterns, and your ${risingSign} Rising projects ${risingElement} energy to the world. This combination gives you versatility and the ability to adapt your energy to different situations.`;
    } else {
      return `Your Big Three span three different elements (${sunElement}, ${moonElement}, and ${risingElement}), making you incredibly versatile and multi-faceted. Your ${sunSign} Sun brings ${sunElement} energy to your identity, your ${moonSign} Moon adds ${moonElement} emotional depth, and your ${risingSign} Rising projects ${risingElement} energy outwardly. This rich elemental blend means you can understand and connect with many different types of people and situations.`;
    }
  }


  private async updateUserStats(userId: string, status: string): Promise<void> {
    const stats = await this.getUserStats(userId);
    
    if (status === 'completed' || status === 'mastered') {
      await db.update(learningStats)
        .set({
          completedLessons: (stats.completedLessons || 0) + 1,
          masteredLessons: status === 'mastered' ? (stats.masteredLessons || 0) + 1 : (stats.masteredLessons || 0),
          totalXp: (stats.totalXp || 0) + 15, // Base XP for lesson completion
          lastActivityDate: new Date().toISOString()
        })
        .where(eq(learningStats.userId, userId));
    }
  }

  async getUserBadges(userId: string): Promise<LearningBadge[]> {
    const userBadges = await db.select({
      badge: learningBadges,
      earnedAt: learningUserBadges.earnedAt
    })
    .from(learningUserBadges)
    .innerJoin(learningBadges, eq(learningUserBadges.badgeId, learningBadges.id))
    .where(eq(learningUserBadges.userId, userId));
    
    return userBadges.map(ub => ({
      ...ub.badge,
      earnedAt: ub.earnedAt
    }));
  }

  async recordProgress(userId: string, lessonId: number, status: string, score?: number, timeSpent?: number): Promise<void> {
    // Check if progress record exists
    const existingProgress = await db.select().from(learningProgress)
      .where(and(
        eq(learningProgress.userId, userId),
        eq(learningProgress.lessonId, lessonId)
      ));

    if (existingProgress.length > 0) {
      // Update existing progress
      await db.update(learningProgress)
        .set({
          status,
          score,
          timeSpent,
          completedAt: status === 'completed' || status === 'mastered' ? new Date() : null
        })
        .where(and(
          eq(learningProgress.userId, userId),
          eq(learningProgress.lessonId, lessonId)
        ));
    } else {
      // Create new progress record
      await db.insert(learningProgress).values({
        userId,
        lessonId,
        status,
        score,
        timeSpent,
        completedAt: status === 'completed' || status === 'mastered' ? new Date() : null
      });
    }

    // Update user stats
    await this.updateUserStats(userId, status);
  }

  async getDashboardData(userId: string): Promise<any> {
    const stats = await this.getUserStats(userId);
    const badges = await this.getUserBadges(userId);
    const availableLessons = await this.getAvailableLessons(userId);
    
    return {
      stats,
      badges,
      availableLessons,
      recentProgress: [],
      canAccessSynastry: false
    };
  }

  private getSunSignInsights(sunSign: string): string {
    return `Your ${sunSign} sun represents your core identity and essential nature.`;
  }

  private getMoonSignInsights(moonSign: string): string {
    return `Your ${moonSign} moon governs your emotional responses and inner needs.`;
  }

  private getRisingSignInsights(risingSign: string): string {
    return `Your ${risingSign} rising shapes how others see you and your approach to the world.`;
  }

  private getElementsOverview(): string {
    return `The four elements form the foundation of astrology: Fire (passion), Earth (stability), Air (communication), Water (emotion).`;
  }

  private getModalitiesOverview(): string {
    return `The three modalities describe approaches to change: Cardinal (initiators), Fixed (sustainers), Mutable (adapters).`;
  }

}

export const learningService = new LearningService();
