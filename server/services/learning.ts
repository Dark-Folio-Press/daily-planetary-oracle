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
import { eq, and, sql, desc, inArray, like } from "drizzle-orm";
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
      console.log('Learning content already exists, checking for updates...');
      await this.updateBasicsTrackStructure();
      return;
    }

    // Create default lessons
    await this.createDefaultLessons();
    await this.createDefaultBadges();
    
    console.log('Learning content initialized successfully');
  }

  private async updateBasicsTrackStructure(): Promise<void> {
    console.log('Updating basics track structure...');
    
    // Check if the structure needs updating by looking for the old duplicate lesson
    const duplicateLesson = await db.select()
      .from(learningLessons)
      .where(and(
        eq(learningLessons.track, 'basics'),
        eq(learningLessons.lessonNumber, 5),
        like(learningLessons.title, '%Moon Sign%')
      ));
    
    if (duplicateLesson.length === 0) {
      console.log('Basics track structure is already up to date');
      return;
    }
    
    // Update the structure: Remove duplicate moon lesson (lesson 5), 
    // move rising from 6 to 3, elements from 3 to 4, modalities from 4 to 5, big three from 7 to 6
    
    // First, update lesson numbers and content for the reorganized lessons
    await db.update(learningLessons)
      .set({
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
        requiredLessons: null
      })
      .where(and(
        eq(learningLessons.track, 'basics'),
        eq(learningLessons.lessonNumber, 6)
      ));
    
    await db.update(learningLessons)
      .set({
        lessonNumber: 4,
        requiredLessons: ['basics-3']
      })
      .where(and(
        eq(learningLessons.track, 'basics'),
        eq(learningLessons.lessonNumber, 3)
      ));
    
    await db.update(learningLessons)
      .set({
        lessonNumber: 5,
        requiredLessons: ['basics-4']
      })
      .where(and(
        eq(learningLessons.track, 'basics'),
        eq(learningLessons.lessonNumber, 4)
      ));
    
    await db.update(learningLessons)
      .set({
        lessonNumber: 6,
        requiredLessons: ['basics-5']
      })
      .where(and(
        eq(learningLessons.track, 'basics'),
        eq(learningLessons.lessonNumber, 7)
      ));
    
    // Remove the duplicate moon lesson (lesson 5)
    await db.delete(learningLessons)
      .where(and(
        eq(learningLessons.track, 'basics'),
        eq(learningLessons.lessonNumber, 5),
        like(learningLessons.title, '%Moon Sign%')
      ));
    
    // Update planets track dependency
    await db.update(learningLessons)
      .set({
        requiredLessons: ['basics-6']
      })
      .where(and(
        eq(learningLessons.track, 'planets'),
        eq(learningLessons.lessonNumber, 1)
      ));
    
    console.log('Basics track structure updated successfully');
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
            },
            {
              type: 'quiz',
              questions: [
                {
                  question: "What does your sun sign represent in astrology?",
                  options: [
                    "Your emotional responses and instincts",
                    "Your core identity and essential nature",
                    "How others see you when they first meet you",
                    "Your career and life direction"
                  ],
                  correct: 1,
                  explanation: "Your sun sign represents your core identity, ego, and the essence of who you are becoming."
                },
                {
                  question: "When is your sun sign determined?",
                  options: [
                    "The time you were born",
                    "The location where you were born", 
                    "The date you were born",
                    "Your name and birth certificate"
                  ],
                  correct: 2,
                  explanation: "Your sun sign is determined by the date you were born, as the sun moves through the zodiac signs throughout the year."
                },
                {
                  question: "How many zodiac signs are there in total?",
                  options: [
                    "10",
                    "11", 
                    "12",
                    "13"
                  ],
                  correct: 2,
                  explanation: "There are 12 zodiac signs that the sun moves through during the year: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, and Pisces."
                }
              ]
            }
          ]
        },
        requiredLessons: null,
        xpReward: 15,
        estimatedMinutes: 10
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
            },
            {
              type: 'quiz',
              questions: [
                {
                  question: "What does your moon sign primarily govern?",
                  options: [
                    "Your career ambitions and public image",
                    "Your emotional responses and inner needs", 
                    "Your physical appearance and first impressions",
                    "Your communication style and learning"
                  ],
                  correct: 1,
                  explanation: "Your moon sign governs your emotional responses, subconscious patterns, and inner emotional needs."
                },
                {
                  question: "How often does the moon change signs?",
                  options: [
                    "Every day",
                    "Every 2-3 days",
                    "Every week",
                    "Every month"
                  ],
                  correct: 1,
                  explanation: "The moon moves quickly through the zodiac, changing signs approximately every 2-3 days."
                },
                {
                  question: "Why is your moon sign considered your 'inner world'?",
                  options: [
                    "Because it's hidden from others",
                    "Because it influences your private emotional responses",
                    "Because it affects your dreams and sleep",
                    "Because it controls your subconscious mind"
                  ],
                  correct: 1,
                  explanation: "Your moon sign represents your inner emotional world - how you process feelings privately and what you need for emotional security."
                }
              ]
            }
          ]
        },
        requiredLessons: null,
        xpReward: 15,
        estimatedMinutes: 10
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
        requiredLessons: null,
        xpReward: 15,
        estimatedMinutes: 8
      },
      {
        track: 'basics',
        lessonNumber: 4,
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
        requiredLessons: ['basics-3'],
        xpReward: 15,
        estimatedMinutes: 10
      },
      {
        track: 'basics',
        lessonNumber: 5,
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
        requiredLessons: ['basics-4'],
        xpReward: 15,
        estimatedMinutes: 10
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
    // Check if badges already exist
    const existingBadges = await db.select().from(learningBadges).limit(1);
    if (existingBadges.length > 0) {
      console.log('Learning badges already exist, skipping badge creation');
      return;
    }

    const badges = [
      {
        name: 'First Steps',
        description: 'Complete your first astrology lesson',
        icon: '🌟',
        requirementType: 'completedLessons',
        requirementValue: 1,
        track: 'basics',
        requirements: { completedLessons: 1 },
        xpReward: 25
      },
      {
        name: 'Sun Explorer', 
        description: 'Master your sun sign knowledge',
        icon: '☀️',
        requirementType: 'masteredLessons',
        requirementValue: 1,
        track: 'basics',
        requirements: { masteredLessons: ['basics-1'] },
        xpReward: 50
      },
      {
        name: 'Big Three Master',
        description: 'Complete the entire basics track',
        icon: '🏆',
        requirementType: 'completedLessons',
        requirementValue: 10,
        track: 'basics',
        requirements: { completedTrack: 'basics' },
        xpReward: 100
      },
      {
        name: 'Planetary Student',
        description: 'Begin exploring planetary influences',
        icon: '🪐',
        requirementType: 'completedLessons',
        requirementValue: 1,
        track: 'planets',
        requirements: { completedLessons: 1, track: 'planets' },
        xpReward: 50
      },
      {
        name: 'House Hunter',
        description: 'Begin exploring the houses',
        icon: '🏠',
        requirementType: 'completedLessons',
        requirementValue: 1,
        track: 'houses',
        requirements: { completedLessons: 1, track: 'houses' },
        xpReward: 50
      },
      {
        name: 'Chart Interpreter',
        description: 'Complete all foundational learning tracks',
        icon: '🔮',
        requirementType: 'completedLessons',
        requirementValue: 15,
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
    
    // Create a map of lesson progress for quick lookup
    const progressMap = new Map(userProgress.map(p => [p.lessonId, p]));
    
    // Get all lessons to build completion map
    const allLessons = await db.select()
      .from(learningLessons)
      .where(eq(learningLessons.isActive, true))
      .orderBy(learningLessons.track, learningLessons.lessonNumber);
    
    const completedLessonIds = userProgress
      .filter(p => p.status === 'completed' || p.status === 'mastered')
      .map(p => p.lessonId);
    
    const availableLessons = allLessons.filter(lesson => {
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
    
    // Attach user progress to each lesson
    return availableLessons.map(lesson => {
      const progress = progressMap.get(lesson.id);
      return {
        ...lesson,
        userProgress: progress ? {
          status: progress.status,
          completedAt: progress.completedAt?.toISOString() || null
        } : null
      };
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
    
    // If lesson not found in learning_lessons, check if it's a completed lesson
    if (!lesson) {
      const [progress] = await db.select()
        .from(learningProgress)
        .where(and(
          eq(learningProgress.lessonId, lessonId),
          eq(learningProgress.userId, userId),
          sql`status IN ('completed', 'mastered')`
        ));
      
      if (progress) {
        // Create a proper lesson object for completed lessons using the same pattern as lesson 29
        const lessonInfo = this.getLessonInfoById(lessonId);
        const mockLesson = {
          id: lessonId,
          title: lessonInfo.title,
          description: lessonInfo.description,
          track: lessonInfo.track,
          lessonNumber: lessonId,
          xpReward: 50,
          estimatedMinutes: 15,
          prerequisites: null,
          content: {},
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          requiredLessons: null
        };

        // Get user's birth data for personalization (same as working lesson 29)
        const user = await db.select().from(users).where(eq(users.id, userId));
        let userChartData = null;
        
        if (user[0]?.birthDate && user[0]?.birthTime && user[0]?.birthLocation) {
          const sunSign = astrologyService.calculateSunSign(user[0].birthDate);
          const moonSign = astrologyService.calculateMoonSign(user[0].birthDate, user[0].birthTime);
          const risingSign = astrologyService.calculateRising(user[0].birthDate, user[0].birthTime, user[0].birthLocation);
          const lunarNodes = astrologyService.calculateLunarNodes(user[0].birthDate, user[0].birthTime);
          
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
            northNode: lunarNodes.northNode,
            southNode: lunarNodes.southNode,
            detailedChart,
            birthData: {
              date: user[0].birthDate,
              time: user[0].birthTime,
              location: user[0].birthLocation
            }
          };
        }

        // Generate personalized content using the same method as lesson 29
        const personalizedContent = await this.personalizeContent(mockLesson, userChartData);

        return {
          lesson: mockLesson,
          personalizedContent,
          userChartData,
          userProgress: progress
        };
      }
      
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
      
      // Calculate lunar nodes for nodes lessons
      const lunarNodes = astrologyService.calculateLunarNodes(user[0].birthDate, user[0].birthTime);
      
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
        northNode: lunarNodes.northNode,
        southNode: lunarNodes.southNode,
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
            content.push({
              type: 'chart-highlight',
              data: {
                type: 'sun-highlight',
                sign: chartData.sunSign,
                element: 'sun'
              }
            });
          } else if (lesson.title.includes('Moon Sign') || lesson.title.includes('Emotional Nature')) { // Moon Sign lesson
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
                type: 'moon-highlight',
                sign: chartData.moonSign,
                element: 'moon'
              }
            });
          } else if (lesson.title.includes('Rising Sign') || lesson.title.includes('How You Appear')) { // Rising Sign lesson
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
            content.push({
              type: 'chart-highlight',
              data: {
                type: 'rising-highlight',
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
                type: 'mercury-highlight',
                sign: mercurySign,
                planet: 'Mercury'
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
          // Handle individual house lessons (13-24)
          const houseNumber = lesson.lessonNumber - 12; // Convert lesson number to house number
          if (houseNumber >= 1 && houseNumber <= 12) {
            const houseData = chartData.detailedChart?.houses?.find((h: any) => h.number === houseNumber);
            const houseSign = houseData?.sign || 'Aries'; // Fallback
            
            content.push({
              type: 'text',
              data: {
                title: `Your ${houseNumber}${this.getOrdinalSuffix(houseNumber)} House in ${houseSign}`,
                content: this.getHousePersonalizedInsights(houseNumber, houseSign, chartData)
              }
            });
            content.push({
              type: 'text',
              data: {
                title: `Understanding the ${houseNumber}${this.getOrdinalSuffix(houseNumber)} House`,
                content: this.getHouseGeneralInsights(houseNumber)
              }
            });
            content.push({
              type: 'interactive',
              data: {
                type: 'house-explorer',
                houseNumber: houseNumber,
                sign: houseSign,
                element: `house-${houseNumber}`
              }
            });
            content.push({
              type: 'chart-highlight',
              data: {
                type: 'house-highlight',
                houseNumber: houseNumber,
                sign: houseSign,
                description: `See where your ${houseNumber}${this.getOrdinalSuffix(houseNumber)} house sits in your birth chart and how ${houseSign} influences this life area`
              }
            });
          } else if (lesson.lessonNumber === 1) { // The 12 Houses: Life's Different Areas
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
          } else if (lesson.lessonNumber === 2) { // Personal Foundation: Houses 1-4
            content.push({
              type: 'text',
              data: {
                title: `Your Personal Foundation`,
                content: `Your ${chartData.risingSign} Rising sets your entire house system. Here's what this means for you:

${chartData.risingSign} rules your 1st house of identity, and from there, the rest of the houses follow in zodiac order around the wheel.

This means your rising sign is like the "lens" through which all your other planetary energies are expressed. It determines which life areas each zodiac sign will influence for you specifically. Two people with the same sun sign but different rising signs will have completely different house systems and life patterns.

The first four houses form your personal foundation - representing your inner circle of identity, values, communication, and emotional roots. Think of them as your most intimate and immediate life experiences.`
              }
            });

            content.push({
              type: 'text',
              data: {
                title: `The Numerology of Houses 1-4`,
                content: this.getNumerologyFoundation()
              }
            });
            
            // Transform house data to format expected by frontend
            const transformedHouseData: Record<string, any> = {};
            if (chartData.detailedChart?.houses) {
              for (const house of chartData.detailedChart.houses) {
                transformedHouseData[`house_${house.number}`] = {
                  sign: house.sign,
                  degree: house.degree,
                  ruler: house.ruler,
                  themes: house.themes
                };
              }
            }
            
            content.push({
              type: 'interactive',
              data: {
                type: 'personal-foundation',
                element: 'personal-foundation',
                houses: [1, 2, 3, 4],
                houseData: Object.keys(transformedHouseData).length > 0 ? transformedHouseData : null
              }
            });
          } else if (lesson.lessonNumber === 3) { // Creative Expression: Houses 5-8
            content.push({
              type: 'text',
              data: {
                title: `Your Creative & Relational Power`,
                content: `Houses 5-8 represent your creative expression and relational power. These houses show how you express yourself creatively, approach work and health, form partnerships, and navigate transformative experiences with others.`
              }
            });

            content.push({
              type: 'text',
              data: {
                title: `The Numerology of Houses 5-8`,
                content: this.getNumerologyExpression()
              }
            });

            // Transform house data to format expected by frontend
            const transformedHouseData2: Record<string, any> = {};
            if (chartData.detailedChart?.houses) {
              for (const house of chartData.detailedChart.houses) {
                transformedHouseData2[`house_${house.number}`] = {
                  sign: house.sign,
                  degree: house.degree,
                  ruler: house.ruler,
                  themes: house.themes
                };
              }
            }
            
            content.push({
              type: 'interactive',
              data: {
                type: 'creative-expression',
                element: 'creative-expression',
                houses: [5, 6, 7, 8],
                houseData: Object.keys(transformedHouseData2).length > 0 ? transformedHouseData2 : null
              }
            });
          } else if (lesson.lessonNumber === 4) { // Higher Purpose: Houses 9-12
            content.push({
              type: 'text',
              data: {
                title: `Your Connection to the World`,
                content: `Houses 9-12 connect you to the greater cosmos. These houses reveal your philosophy, public image, community connections, and spiritual path - showing how you contribute to and connect with the world beyond yourself.`
              }
            });

            content.push({
              type: 'text',
              data: {
                title: `The Numerology of Houses 9-12`,
                content: this.getNumerologyPurpose()
              }
            });

            // Transform house data to format expected by frontend
            const transformedHouseData3: Record<string, any> = {};
            if (chartData.detailedChart?.houses) {
              for (const house of chartData.detailedChart.houses) {
                transformedHouseData3[`house_${house.number}`] = {
                  sign: house.sign,
                  degree: house.degree,
                  ruler: house.ruler,
                  themes: house.themes
                };
              }
            }
            
            content.push({
              type: 'interactive',
              data: {
                type: 'higher-purpose',
                element: 'higher-purpose',
                houses: [9, 10, 11, 12],
                houseData: Object.keys(transformedHouseData3).length > 0 ? transformedHouseData3 : null
              }
            });
          }
          break;
        case 'nodes':
          // Handle lunar nodes lessons with personalized content
          if (chartData.detailedChart?.lunarNodes || chartData.northNode) {
            const northNode = chartData.detailedChart?.lunarNodes?.northNode || chartData.northNode;
            const southNode = chartData.detailedChart?.lunarNodes?.southNode || chartData.southNode;
            
            if (lesson.lessonNumber === 1) { // Understanding the Lunar Nodes
              content.push({
                type: 'text',
                data: {
                  title: `Your Lunar Nodes: ${northNode} North ↗ ${southNode} South ↙`,
                  content: this.getLunarNodesOverview(northNode, southNode)
                }
              });
              content.push({
                type: 'text',
                data: {
                  title: 'Your Soul\'s Journey',
                  content: this.getNodalJourneyInsights(northNode, southNode)
                }
              });
              content.push({
                type: 'interactive',
                data: {
                  type: 'nodes-overview',
                  northNode: northNode,
                  southNode: southNode,
                  element: 'lunar-nodes'
                }
              });
            } else if (lesson.lessonNumber === 2) { // North Node Deep Dive
              content.push({
                type: 'text',
                data: {
                  title: `Your North Node in ${northNode}: Your Life Purpose`,
                  content: this.getNorthNodeInsights(northNode)
                }
              });
              content.push({
                type: 'text',
                data: {
                  title: 'Growth Path & Life Lessons',
                  content: this.getNorthNodeGrowthPath(northNode)
                }
              });
              content.push({
                type: 'interactive',
                data: {
                  type: 'north-node-explorer',
                  sign: northNode,
                  element: 'north-node'
                }
              });
            } else if (lesson.lessonNumber === 3) { // South Node Deep Dive
              content.push({
                type: 'text',
                data: {
                  title: `Your South Node in ${southNode}: Your Past Life Gifts`,
                  content: this.getSouthNodeInsights(southNode)
                }
              });
              content.push({
                type: 'text',
                data: {
                  title: 'Balancing Past Gifts with Future Growth',
                  content: this.getSouthNodeBalance(southNode, northNode)
                }
              });
              content.push({
                type: 'interactive',
                data: {
                  type: 'south-node-explorer',
                  sign: southNode,
                  element: 'south-node'
                }
              });
            } else if (lesson.lessonNumber === 4) { // Nodes in Houses
              content.push({
                type: 'text',
                data: {
                  title: 'Your Nodal Axis in Action',
                  content: this.getNodalHousesInsights(northNode, southNode)
                }
              });
              content.push({
                type: 'text',
                data: {
                  title: `North Node in ${northNode}: Growth Areas`,
                  content: `Your North Node in ${northNode} shows where you're developing new skills and qualities in this lifetime. The house position reveals the specific life area where this growth unfolds.`
                }
              });
              content.push({
                type: 'text',
                data: {
                  title: `South Node in ${southNode}: Natural Gifts`,
                  content: `Your South Node in ${southNode} represents the talents and patterns you've already mastered. Understanding these gifts helps you use them as a foundation rather than a limitation.`
                }
              });
              content.push({
                type: 'interactive',
                data: {
                  type: 'nodes-houses-explorer',
                  northNode: northNode,
                  southNode: southNode,
                  element: 'nodal-houses'
                }
              });
            } else if (lesson.lessonNumber === 5) { // Nodal Aspects
              content.push({
                type: 'text',
                data: {
                  title: 'Planetary Support for Your Soul\'s Journey',
                  content: this.getNodalAspectsInsights(northNode, southNode)
                }
              });
              content.push({
                type: 'text',
                data: {
                  title: `Understanding Nodal Aspects`,
                  content: `Planets making aspects to your ${northNode} North Node and ${southNode} South Node provide additional tools, challenges, and support for your karmic evolution. These connections show how different parts of your chart work together to support your soul's growth.`
                }
              });
              content.push({
                type: 'text',
                data: {
                  title: 'Your Nodal Network',
                  content: `The aspects to your nodes create a network of planetary energies that either support your North Node development or challenge you to move beyond South Node patterns. This cosmic support system guides your spiritual evolution.`
                }
              });
              content.push({
                type: 'interactive',
                data: {
                  type: 'nodal-aspects-explorer',
                  northNode: northNode,
                  southNode: southNode,
                  element: 'nodal-aspects'
                }
              });
            }
            
            content.push({
              type: 'chart-highlight',
              data: {
                element: `Lunar Nodes: ${northNode} ↗ ${southNode} ↙`,
                description: 'See your North and South Nodes in your birth chart and how they guide your soul\'s evolution'
              }
            });
          } else {
            content.push({
              type: 'text',
              data: {
                title: lesson.title,
                content: 'To see your personalized nodal insights, please ensure your birth information is complete in your profile.'
              }
            });
          }
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

  async checkAndAwardBadges(userId: string): Promise<void> {
    // Get user's current progress and stats
    const userProgress = await db.select()
      .from(learningProgress)
      .where(eq(learningProgress.userId, userId));
    
    const userStats = await this.getUserStats(userId);
    const currentBadges = await this.getUserBadges(userId);
    const currentBadgeIds = new Set(currentBadges.map(b => b.id));
    
    // Get all available badges
    const allBadges = await db.select().from(learningBadges);
    
    for (const badge of allBadges) {
      // Skip if user already has this badge
      if (currentBadgeIds.has(badge.id!)) {
        continue;
      }
      
      const requirements = badge.requirements as any;
      let shouldAward = false;
      
      // Check badge requirements
      if (requirements.completedLessons && (userStats.completedLessons || 0) >= requirements.completedLessons) {
        if (requirements.track) {
          // Check track-specific completion
          const trackProgress = userProgress.filter(p => {
            // Need to get lesson info to check track
            return (p.status === 'completed' || p.status === 'mastered');
          });
          shouldAward = trackProgress.length >= requirements.completedLessons;
        } else {
          shouldAward = true;
        }
      }
      
      if (requirements.masteredLessons) {
        // Check if specific lessons are mastered
        const masteredLessonIds = userProgress
          .filter(p => p.status === 'mastered')
          .map(p => p.lessonId);
        
        // For now, simplified check based on lesson count
        shouldAward = masteredLessonIds.length > 0;
      }
      
      if (requirements.completedTrack) {
        // Check if specific track is completed
        // For now, simplified: if user has many completed lessons
        shouldAward = (userStats.completedLessons || 0) >= 10;
      }
      
      if (requirements.completedTracks) {
        // Check if multiple tracks are completed
        shouldAward = (userStats.completedLessons || 0) >= 15;
      }
      
      // Award the badge
      if (shouldAward) {
        await db.insert(learningUserBadges).values({
          userId,
          badgeId: badge.id!,
          earnedAt: new Date()
        });
        
        console.log(`Awarded badge "${badge.name}" to user ${userId}`);
      }
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
    
    // Check and award badges
    await this.checkAndAwardBadges(userId);
  }

  async getCompletedLessons(userId: string): Promise<LearningLesson[]> {
    // Get user's completed progress
    const userProgress = await db.select()
      .from(learningProgress)
      .where(and(
        eq(learningProgress.userId, userId),
        sql`status IN ('completed', 'mastered')`
      ));
    
    if (userProgress.length === 0) {
      return [];
    }
    
    // Get the lesson details for completed lessons
    const completedLessonIds = userProgress.map(p => p.lessonId);
    
    if (completedLessonIds.length === 0) {
      return [];
    }
    
    // Try to get lesson details from learning_lessons table
    const actualLessons = await db.select()
      .from(learningLessons)
      .where(inArray(learningLessons.id, completedLessonIds))
      .orderBy(learningLessons.track, learningLessons.lessonNumber);
    
    // Create a map of actual lesson data
    const lessonsMap = new Map(actualLessons.map(lesson => [lesson.id, lesson]));
    
    // Create lesson objects for all completed progress, using actual data when available
    return userProgress.map(progress => {
      const actualLesson = lessonsMap.get(progress.lessonId);
      
      if (actualLesson) {
        // Use actual lesson data
        return {
          ...actualLesson,
          userProgress: progress
        };
      } else {
        // Create a lesson object using proper lesson info
        const lessonInfo = this.getLessonInfoById(progress.lessonId);
        return {
          id: progress.lessonId,
          title: lessonInfo.title,
          description: lessonInfo.description,
          track: lessonInfo.track,
          lessonNumber: progress.lessonId,
          xpReward: 50, // Default XP
          estimatedMinutes: 15, // Default time
          difficulty: "beginner" as const,
          prerequisites: null,
          content: {},
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          requiredLessons: null,
          userProgress: progress
        };
      }
    }).sort((a, b) => a.lessonNumber - b.lessonNumber);
  }
  
  private getLessonTrackById(lessonId: number): string {
    // Map lesson IDs to tracks based on typical curriculum structure
    if (lessonId <= 3) return "basics";
    if (lessonId <= 12) return "planets";
    if (lessonId <= 24) return "houses";
    return "advanced";
  }

  private getLessonInfoById(lessonId: number): { title: string; description: string; track: string } {
    const track = this.getLessonTrackById(lessonId);
    
    // Comprehensive lesson catalog based on astrological curriculum
    const lessonCatalog: Record<number, { title: string; description: string }> = {
      // Basics Track (1-3)
      1: { title: "Your Sun Sign: The Core of Who You Are", description: "Discover your fundamental personality traits and life purpose through your sun sign" },
      2: { title: "Your Moon Sign: Your Emotional Nature", description: "Explore your inner world, emotions, and instinctive responses" },
      3: { title: "Your Rising Sign: How You Appear to Others", description: "Learn about your outer personality and first impressions" },
      
      // Planets Track (4-12) 
      4: { title: "Mercury: Your Communication Style", description: "Understanding how you think, learn, and communicate" },
      5: { title: "Venus: Your Love Language", description: "Discover what you value in relationships and beauty" },
      6: { title: "Mars: Your Drive and Ambition", description: "Explore your energy, passion, and how you take action" },
      7: { title: "Jupiter: Your Growth and Expansion", description: "Learn about luck, opportunities, and personal growth" },
      8: { title: "Saturn: Your Discipline and Structure", description: "Understanding life lessons, responsibility, and achievements" },
      9: { title: "Uranus: Your Innovation and Freedom", description: "Discover your unique qualities and desire for independence" },
      10: { title: "Neptune: Your Dreams and Intuition", description: "Explore spirituality, creativity, and psychic abilities" },
      11: { title: "Pluto: Your Transformation Power", description: "Understanding deep change, regeneration, and personal power" },
      12: { title: "Planetary Aspects: How Your Planets Interact", description: "Learn how planetary relationships create your unique personality blend" },
      
      // Houses Track (13-24)
      13: { title: "1st House: Your Identity and Appearance", description: "The house of self, personality, and first impressions" },
      14: { title: "2nd House: Your Values and Resources", description: "Understanding money, possessions, and self-worth" },
      15: { title: "3rd House: Your Communication and Learning", description: "Siblings, short trips, and everyday interactions" },
      16: { title: "4th House: Your Home and Family", description: "Roots, family dynamics, and emotional foundation" },
      17: { title: "5th House: Your Creativity and Romance", description: "Self-expression, children, and recreational activities" },
      18: { title: "6th House: Your Work and Health", description: "Daily routines, service to others, and physical wellness" },
      19: { title: "7th House: Your Partnerships and Marriage", description: "One-on-one relationships and business partnerships" },
      20: { title: "8th House: Your Transformation and Shared Resources", description: "Intimacy, shared finances, and life-changing experiences" },
      21: { title: "9th House: Your Philosophy and Higher Learning", description: "Travel, education, religion, and personal beliefs" },
      22: { title: "10th House: Your Career and Public Image", description: "Professional life, reputation, and life goals" },
      23: { title: "11th House: Your Friendships and Hopes", description: "Social groups, wishes, and humanitarian causes" },
      24: { title: "12th House: Your Spirituality and Subconscious", description: "Hidden aspects, karma, and spiritual development" },
      
      // Advanced Track (25-29)
      25: { title: "Elements: Fire, Earth, Air, Water", description: "Understanding the four fundamental energies in astrology" },
      26: { title: "Modalities: Cardinal, Fixed, Mutable", description: "How the three approaches to change shape your personality" },
      27: { title: "Polarities: Understanding Opposite Signs", description: "Learning from the complementary nature of opposing energies" },
      28: { title: "Birth Chart Integration: Your Complete Cosmic Picture", description: "Synthesizing all elements of your chart into a cohesive understanding" },
      29: { title: "Advanced Sun Sign Mastery", description: "Master advanced concepts and nuances of your sun sign expression" }
    };

    const info = lessonCatalog[lessonId];
    return {
      title: info ? info.title : `Advanced Lesson ${lessonId}`,
      description: info ? info.description : `Explore advanced astrological concepts and deepen your understanding`,
      track
    };
  }

  async getDashboardData(userId: string): Promise<any> {
    const stats = await this.getUserStats(userId);
    const badges = await this.getUserBadges(userId);
    const availableLessons = await this.getAvailableLessons(userId);
    const completedLessons = await this.getCompletedLessons(userId);
    
    return {
      stats,
      badges,
      availableLessons,
      completedLessons,
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

  private getOrdinalSuffix(num: number): string {
    if (num % 100 >= 11 && num % 100 <= 13) return 'th';
    switch (num % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }

  private getHousePersonalizedInsights(houseNumber: number, houseSign: string, chartData: any): string {
    const houseThemes: Record<number, string> = {
      1: `identity and first impressions`,
      2: `values, money, and possessions`,
      3: `communication and siblings`,
      4: `home, family, and emotional foundation`,
      5: `creativity, romance, and children`,
      6: `work, health, and daily routines`,
      7: `partnerships and marriage`,
      8: `transformation and shared resources`,
      9: `philosophy, travel, and higher learning`,
      10: `career and public reputation`,
      11: `friendships and future goals`,
      12: `spirituality and hidden aspects`
    };

    return `Your ${houseNumber}${this.getOrdinalSuffix(houseNumber)} house is in ${houseSign}, which means your approach to ${houseThemes[houseNumber]} is influenced by ${houseSign}'s energy. This placement shows how you naturally express yourself in this life area and what experiences you're likely to encounter here.`;
  }

  private getHouseGeneralInsights(houseNumber: number): string {
    const houseDescriptions: Record<number, string> = {
      1: `The 1st house represents your identity, personality, and how you appear to others. It's ruled by your rising sign and shows your natural approach to life.`,
      2: `The 2nd house governs your values, money, possessions, and self-worth. It reveals what you find valuable and how you handle material resources.`,
      3: `The 3rd house rules communication, siblings, short trips, and learning. It shows how you process information and connect with your immediate environment.`,
      4: `The 4th house represents home, family, roots, and your emotional foundation. It reveals your inner world and where you find security.`,
      5: `The 5th house governs creativity, romance, children, and self-expression. It shows how you play, create, and express your unique personality.`,
      6: `The 6th house rules work, health, daily routines, and service. It reveals how you approach responsibility and maintain your physical wellbeing.`,
      7: `The 7th house represents partnerships, marriage, and one-on-one relationships. It shows what you seek in others and how you relate to people.`,
      8: `The 8th house governs transformation, shared resources, intimacy, and the occult. It reveals your relationship with deep change and hidden matters.`,
      9: `The 9th house rules philosophy, higher education, travel, and spiritual beliefs. It shows how you expand your understanding of the world.`,
      10: `The 10th house represents career, reputation, and your public image. It reveals your life direction and how you want to be known in the world.`,
      11: `The 11th house governs friendships, groups, hopes, and wishes. It shows your social connections and dreams for the future.`,
      12: `The 12th house rules spirituality, the subconscious, karma, and hidden enemies. It reveals your connection to the divine and unconscious patterns.`
    };

    return houseDescriptions[houseNumber] || `The ${houseNumber}${this.getOrdinalSuffix(houseNumber)} house is an important area of life experience in astrology.`;
  }

  private getModalitiesOverview(): string {
    return `The three modalities describe approaches to change: Cardinal (initiators), Fixed (sustainers), Mutable (adapters).`;
  }

  // Helper methods for planet insights
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

  // Helper methods for houses insights
  private getHousesOverview(): string {
    return `The 12 houses are like the stage where your planets perform. Each house represents a different area of life experience - from your identity and resources to your relationships and spirituality. While the signs describe *how* you express energy, the houses show *where* that energy manifests in your actual life circumstances.

Think of the houses as the departments of your life: the 1st house is your personal brand, the 2nd is your resources and values, the 7th is partnerships, the 10th is your career reputation, and so on. Understanding your house system reveals where you'll encounter your greatest challenges, opportunities, and life lessons.`;
  }

  private getHouseThemesExplanation(): string {
    return `1st House: Your identity, appearance, first impressions

2nd House: Money, possessions, self-worth, values  

3rd House: Communication, siblings, local travel, learning

4th House: Home, family, roots, emotional foundation

5th House: Creativity, romance, children, self-expression

6th House: Work, health, daily routines, service

7th House: Marriage, partnerships, one-on-one relationships

8th House: Shared resources, transformation, deep psychology

9th House: Higher education, philosophy, long-distance travel

10th House: Career, reputation, public image, achievements

11th House: Friends, groups, hopes, social networks

12th House: Spirituality, hidden enemies, subconscious, sacrifice

Each house has specific themes, but how these play out depends on which signs rule your house cusps and which planets reside there.`;
  }

  private getNumerologyFoundation(): string {
    return `Numbers 1-4 represent the fundamental building blocks of existence, mirroring the first four houses of your astrological chart.

Number 1 (1st House - Identity): The beginning, the self, pure potential manifesting into form. Like Aries energy, it's the spark of individual consciousness emerging.

Number 2 (2nd House - Resources): Duality and receptivity, the need to gather and build. This reflects our relationship with the material world and what we value.

Number 3 (3rd House - Communication): Creative expression and connection, the urge to share and communicate our inner world with others around us.

Number 4 (4th House - Foundation): Structure and stability, the container that holds and nurtures. This represents our roots and emotional security.`;
  }

  private getNumerologyExpression(): string {
    return `Numbers 5-8 represent the expansion beyond personal foundation into creative and relational expression.

Number 5 (5th House - Creativity): Freedom and creative self-expression, the joy of play and romance. This is where we risk and create.

Number 6 (6th House - Service): Harmony and service, the refinement of skills and devotion to improvement. This perfects our daily experience.

Number 7 (7th House - Partnership): Reflection and partnership, seeing ourselves through relationship with others. This completes our understanding.

Number 8 (8th House - Transformation): Power and regeneration, the mastery of transformation and shared resources. This deepens our capacity for change.

These numbers guide us from personal creativity (5) through service and refinement (6), into partnership reflection (7), and finally to transformative mastery (8).`;
  }

  private getNumerologyPurpose(): string {
    return `Numbers 9-12 represent completion and transcendence, connecting us to universal purpose and cosmic consciousness.

Number 9 (9th House - Philosophy): Universal wisdom and higher knowledge, the expansion of consciousness beyond personal limits into universal truth.

Number 10 (10th House - Reputation): Completion and worldly achievement, the culmination of our efforts in the public sphere and social contribution.

Number 11 (11th House - Community): Master number of inspiration and collective vision, connecting individual purpose with group consciousness and future dreams.

Number 12 (12th House - Spirituality): Universal completion and dissolution, the return to source consciousness and connection with the infinite.

The final numbers guide us from expanded awareness (9) through public achievement (10), into collective inspiration (11), and finally to spiritual transcendence (12).`;
  }

  // Lunar Nodes personalization helper methods
  private getLunarNodesOverview(northNode: string, southNode: string): string {
    return `Your lunar nodes represent your soul's karmic journey in this lifetime. Your South Node in ${southNode} reveals the gifts and patterns you've mastered in past lives, while your North Node in ${northNode} shows the qualities you're developing now. The nodes are always opposite each other, creating a dynamic tension between your comfort zone (South Node) and your growth edge (North Node). Understanding this axis helps you balance your natural talents with your evolutionary path.`;
  }

  private getNodalJourneyInsights(northNode: string, southNode: string): string {
    const northElement = this.getSignElement(northNode);
    const southElement = this.getSignElement(southNode);
    
    return `Your soul's journey involves moving from the ${southElement} energy of ${southNode} toward the ${northElement} energy of ${northNode}. This doesn't mean abandoning your South Node gifts, but rather using them as a foundation to develop new skills. The tension between these two signs creates opportunities for profound spiritual growth and life purpose fulfillment.`;
  }

  private getNorthNodeInsights(northNode: string): string {
    const insights: Record<string, string> = {
      'Aries': 'Your North Node in Aries calls you to develop independence, leadership, and the courage to be authentically yourself. This lifetime is about learning to initiate action, trust your instincts, and pioneer new paths rather than always seeking consensus or approval.',
      'Taurus': 'Your North Node in Taurus invites you to cultivate stability, patience, and appreciation for simple pleasures. This lifetime is about grounding yourself in the physical world, building lasting foundations, and learning to slow down and savor life\'s experiences.',
      'Gemini': 'Your North Node in Gemini encourages you to embrace curiosity, communication, and mental flexibility. This lifetime is about learning to gather information, connect with others through dialogue, and adapt your perspectives based on new knowledge.',
      'Cancer': 'Your North Node in Cancer calls you to develop emotional intelligence, nurturing abilities, and connection to family and home. This lifetime is about learning to lead with your heart, create emotional security, and honor your intuitive wisdom.',
      'Leo': 'Your North Node in Leo invites you to embrace creative self-expression, personal recognition, and heart-centered leadership. This lifetime is about learning to shine your unique light, take center stage when appropriate, and express your authentic creative gifts.',
      'Virgo': 'Your North Node in Virgo encourages you to develop practical skills, attention to detail, and service to others. This lifetime is about learning to refine your abilities, create helpful systems, and contribute to the world through meaningful work.',
      'Libra': 'Your North Node in Libra calls you to cultivate diplomacy, partnership skills, and aesthetic appreciation. This lifetime is about learning to cooperate, create harmony, and see multiple perspectives rather than imposing your own will.',
      'Scorpio': 'Your North Node in Scorpio invites you to embrace emotional depth, transformation, and psychological insight. This lifetime is about learning to go beyond surface appearances, heal deep wounds, and develop authentic intimacy with others.',
      'Sagittarius': 'Your North Node in Sagittarius encourages you to expand your horizons, seek higher wisdom, and embrace adventure. This lifetime is about learning to think bigger, explore different philosophies, and share your knowledge with enthusiasm.',
      'Capricorn': 'Your North Node in Capricorn calls you to develop discipline, responsibility, and professional mastery. This lifetime is about learning to build lasting achievements, take charge of your destiny, and contribute to society through your expertise.',
      'Aquarius': 'Your North Node in Aquarius invites you to embrace innovation, group consciousness, and humanitarian ideals. This lifetime is about learning to work with others for the greater good, embrace your uniqueness, and contribute to progressive change.',
      'Pisces': 'Your North Node in Pisces encourages you to develop compassion, intuition, and spiritual connection. This lifetime is about learning to trust your inner knowing, serve others with unconditional love, and dissolve the ego boundaries that separate you from universal consciousness.'
    };
    
    return insights[northNode] || `Your North Node in ${northNode} represents your soul's growth direction in this lifetime.`;
  }

  private getNorthNodeGrowthPath(northNode: string): string {
    const growthPaths: Record<string, string> = {
      'Aries': 'Develop courage to act independently, learn to trust your first instincts, practice making decisions quickly, embrace leadership opportunities, and cultivate self-reliance.',
      'Taurus': 'Learn to slow down and be present, develop patience with natural timing, build practical skills and resources, appreciate sensory experiences, and create stable foundations.',
      'Gemini': 'Cultivate curiosity about diverse topics, practice active listening and communication, develop mental flexibility, gather information before forming opinions, and connect with your local community.',
      'Cancer': 'Honor your emotional needs and intuition, learn to nurture yourself and others, create a sense of home and belonging, develop empathy and caring, and trust your inner wisdom.',
      'Leo': 'Express your unique creative gifts, learn to receive recognition gracefully, develop confidence in your talents, practice generous leadership, and share your light with joy.',
      'Virgo': 'Focus on practical service and improvement, develop attention to detail, learn healthy routines and habits, refine your skills through practice, and contribute through meaningful work.',
      'Libra': 'Learn to cooperate and compromise, develop aesthetic appreciation, practice seeing all sides of situations, create harmony in relationships, and cultivate diplomatic skills.',
      'Scorpio': 'Embrace emotional transformation, learn to go deeper in relationships, develop psychological insight, practice authentic vulnerability, and use your power for healing.',
      'Sagittarius': 'Expand your philosophical understanding, embrace adventure and learning, develop teaching abilities, practice optimism and enthusiasm, and share wisdom gained through experience.',
      'Capricorn': 'Take responsibility for your life direction, develop long-term planning skills, build professional expertise, practice discipline and commitment, and create lasting achievements.',
      'Aquarius': 'Contribute to group causes and humanitarian efforts, embrace your unique perspective, develop innovative thinking, practice detached wisdom, and work for collective progress.',
      'Pisces': 'Develop spiritual practices and connection, learn to serve others compassionately, trust your intuition and dreams, practice forgiveness and acceptance, and dissolve ego boundaries.'
    };
    
    return growthPaths[northNode] || `Focus on developing the positive qualities of ${northNode} energy.`;
  }

  private getSouthNodeInsights(southNode: string): string {
    const insights: Record<string, string> = {
      'Aries': 'Your South Node in Aries indicates mastery of independence, leadership, and pioneering action from past lives. You naturally know how to initiate, compete, and assert yourself. However, overusing these traits can lead to impulsiveness, aggression, or excessive self-focus.',
      'Taurus': 'Your South Node in Taurus shows past-life mastery of stability, practicality, and material security. You naturally understand resources, patience, and sensory pleasures. However, over-reliance on these gifts can lead to stubbornness, materialism, or resistance to change.',
      'Gemini': 'Your South Node in Gemini reveals past-life expertise in communication, adaptability, and information gathering. You naturally excel at networking, learning, and mental agility. However, overdoing these traits can lead to superficiality, scattered energy, or gossiping.',
      'Cancer': 'Your South Node in Cancer indicates mastery of nurturing, emotional sensitivity, and family devotion from past lives. You naturally understand caring, intuition, and creating emotional security. However, overusing these gifts can lead to moodiness, over-protecting others, or emotional manipulation.',
      'Leo': 'Your South Node in Leo shows past-life mastery of creative expression, leadership, and personal recognition. You naturally know how to perform, inspire, and shine brightly. However, over-reliance on these traits can lead to ego inflation, attention-seeking, or dramatic behavior.',
      'Virgo': 'Your South Node in Virgo reveals past-life expertise in service, perfectionism, and practical skills. You naturally excel at organization, analysis, and improvement. However, overdoing these gifts can lead to criticism, anxiety, or getting lost in details.',
      'Libra': 'Your South Node in Libra indicates mastery of diplomacy, partnership, and aesthetic harmony from past lives. You naturally understand cooperation, beauty, and balance. However, overusing these traits can lead to indecision, people-pleasing, or avoiding conflict.',
      'Scorpio': 'Your South Node in Scorpio shows past-life mastery of transformation, intensity, and psychological depth. You naturally know how to penetrate mysteries, handle power, and facilitate change. However, over-reliance can lead to manipulation, obsession, or emotional extremes.',
      'Sagittarius': 'Your South Node in Sagittarius reveals past-life expertise in philosophy, teaching, and adventure. You naturally excel at big-picture thinking, inspiring others, and seeking truth. However, overdoing these gifts can lead to preaching, over-promising, or avoiding practical details.',
      'Capricorn': 'Your South Node in Capricorn indicates mastery of authority, structure, and professional achievement from past lives. You naturally understand responsibility, hierarchy, and long-term planning. However, overusing these traits can lead to workaholism, coldness, or authoritarian behavior.',
      'Aquarius': 'Your South Node in Aquarius shows past-life mastery of innovation, group dynamics, and humanitarian ideals. You naturally know how to work with groups, think originally, and champion causes. However, over-reliance can lead to emotional detachment, rebelliousness, or elitist attitudes.',
      'Pisces': 'Your South Node in Pisces reveals past-life expertise in spirituality, compassion, and universal connection. You naturally excel at empathy, artistic expression, and mystical understanding. However, overdoing these gifts can lead to escapism, martyrdom, or losing boundaries.'
    };
    
    return insights[southNode] || `Your South Node in ${southNode} represents your natural talents and past-life mastery.`;
  }

  private getSouthNodeBalance(southNode: string, northNode: string): string {
    return `The key to working with your South Node in ${southNode} is not to abandon these gifts, but to use them wisely as a foundation for developing your North Node in ${northNode}. When you find yourself falling into the shadow expressions of ${southNode} - such as overusing these traits or using them to avoid growth - redirect that energy toward your ${northNode} development. Your ${southNode} talents are meant to support your journey toward ${northNode} mastery, not replace it.`;
  }

  private getNodalHousesInsights(northNode: string, southNode: string): string {
    return `Understanding which houses contain your North Node (${northNode}) and South Node (${southNode}) reveals the specific life areas where your karmic work unfolds. The house positions show where you'll encounter the most growth opportunities and where your past-life patterns are most likely to surface. While we're working on adding house position calculations to your personalized content, focus on how the energies of ${northNode} and ${southNode} play out in different areas of your life experience.`;
  }

  private getNodalAspectsInsights(northNode: string, southNode: string): string {
    return `Planetary aspects to your lunar nodes provide additional tools, challenges, and support for your soul's evolution from ${southNode} to ${northNode}. Planets making harmonious aspects (trines, sextiles) to your nodes offer natural gifts that support your karmic journey, while challenging aspects (squares, oppositions) present obstacles that ultimately strengthen your growth. Conjunctions to your nodes indicate planets that are intimately connected to your life purpose and karmic lessons.`;
  }

}

export const learningService = new LearningService();
