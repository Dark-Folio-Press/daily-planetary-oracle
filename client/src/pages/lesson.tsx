import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  CheckCircle2, 
  Award,
  BookOpen,
  Target,
  Lightbulb
} from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import LessonQuiz from "@/components/lesson-quiz";
import { PatternIdentificationChallenge } from "@/components/pattern-identification-challenge";

interface LessonContent {
  type: 'text' | 'interactive' | 'chart-highlight' | 'quiz';
  data: any;
}

interface PersonalizedLesson {
  lesson: {
    id: number;
    track: string;
    lessonNumber: number;
    title: string;
    description: string;
    content: any;
    xpReward: number;
    estimatedMinutes: number;
  };
  personalizedContent: LessonContent[];
  userChartData?: {
    sunSign: string;
    moonSign: string;
    risingSign: string;
    birthData: {
      date: string;
      time: string;
      location: string;
    };
  };
  userProgress?: {
    status: string;
  };
  nextLessonId?: number;
}

export default function LessonPage() {
  const [, params] = useRoute("/learning/lesson/:lessonId");
  const [startTime] = useState(Date.now());
  const [currentSection, setCurrentSection] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showInteractiveModal, setShowInteractiveModal] = useState(false);
  const [interactiveContent, setInteractiveContent] = useState<any>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizPassed, setQuizPassed] = useState(false);
  const queryClient = useQueryClient();
  
  const lessonId = params?.lessonId ? parseInt(params.lessonId) : null;

  const { data: lessonData, isLoading } = useQuery<PersonalizedLesson>({
    queryKey: [`/api/learning/lesson/${lessonId}`],
    enabled: !!lessonId
  });

  const progressMutation = useMutation({
    mutationFn: (progressData: {
      lessonId: number;
      status: 'started' | 'completed' | 'mastered';
      score?: number;
      timeSpent?: number;
    }) => apiRequest("POST", `/api/learning/progress`, progressData),
    onSuccess: (data: any) => {
      // Update the dashboard cache with the returned data
      if (data.dashboardData) {
        queryClient.setQueryData(["/api/learning/dashboard"], data.dashboardData);
      }
      
      // Force immediate refetch of dashboard
      queryClient.invalidateQueries({ queryKey: ["/api/learning/dashboard"], refetchType: 'active' });
      
      const isMastered = data.status === 'mastered' || quizPassed;
      const baseXP = lessonData?.lesson.xpReward || 15;
      const bonusXP = isMastered ? 10 : 0;
      const totalXP = baseXP + bonusXP;
      
      toast({
        title: isMastered ? "Lesson Mastered! 🏆" : "Lesson Completed! ✨",
        description: `You earned +${totalXP} XP${bonusXP > 0 ? ` (${baseXP} + ${bonusXP} mastery bonus)` : ''}`,
        duration: 5000,
      });
    }
  });

  // Record lesson start (but don't mark as completed automatically)
  useEffect(() => {
    if (lessonData && !isCompleted) {
      // Only record that lesson was started, not completed
    }
  }, [lessonData]);

  const handleCompleteLesson = () => {
    if (!lessonData) return;
    
    // Check if lesson has quiz content
    const hasQuiz = lessonData.personalizedContent.some(section => section.type === 'quiz');
    
    if (hasQuiz && quizScore === null) {
      // Show quiz first before completion
      setShowQuiz(true);
    } else {
      // Complete lesson directly (no quiz or quiz already completed)
      const timeSpent = Math.floor((Date.now() - startTime) / 1000 / 60); // minutes
      const status = quizPassed ? 'mastered' : 'completed';
      const xpBonus = quizPassed ? 10 : 0;
      
      progressMutation.mutate({
        lessonId: lessonData.lesson.id,
        status,
        score: quizScore || undefined,
        timeSpent
      });
      
      setIsCompleted(true);
    }
  };

  const handleQuizComplete = (score: number, totalQuestions: number, passed: boolean) => {
    setQuizScore(score);
    setQuizPassed(passed);
    setShowQuiz(false);
    
    // Auto-complete lesson after quiz
    const timeSpent = Math.floor((Date.now() - startTime) / 1000 / 60);
    const status = passed ? 'mastered' : 'completed';
    
    progressMutation.mutate({
      lessonId: lessonData!.lesson.id,
      status,
      score,
      timeSpent
    });
    
    setIsCompleted(true);
  };

  if (!lessonId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Invalid lesson ID</h2>
          <Link href="/learning">
            <Button>Back to Learning</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8 animate-pulse">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!lessonData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Lesson not found</h2>
          <Link href="/learning">
            <Button>Back to Learning</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { lesson, personalizedContent, userChartData, userProgress, nextLessonId } = lessonData;
  
  // Check if this lesson is already completed by the user
  const isAlreadyCompleted = userProgress?.status === 'completed' || userProgress?.status === 'mastered';
  
  const trackIcons: Record<string, any> = {
    basics: Star,
    planets: Target,
    houses: Award,
  };

  const TrackIcon = trackIcons[lesson.track] || BookOpen;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/learning">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Learning
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="capitalize">
                <TrackIcon className="w-3 h-3 mr-1" />
                {lesson.track}
              </Badge>
              <span className="text-sm text-gray-500">Lesson {lesson.lessonNumber}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {lesson.title}
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {lesson.estimatedMinutes} min
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              +{lesson.xpReward} XP
            </div>
          </div>
        </div>

        {/* Review Mode Banner */}
        {isAlreadyCompleted && (
          <Alert className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-green-800 dark:text-green-200">Review Mode</strong>
                  <span className="text-green-700 dark:text-green-300 ml-2">
                    You've already completed this lesson. Feel free to review your personalized insights anytime!
                  </span>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-gray-500">
              {Math.min(currentSection + 1, personalizedContent?.length || 0)} of {personalizedContent?.length || 0}
            </span>
          </div>
          <Progress 
            value={personalizedContent?.length ? (Math.min(currentSection + 1, personalizedContent.length) / personalizedContent.length) * 100 : 0} 
            className="h-2"
          />
        </div>

        {/* Planet Context for User */}
        {userChartData && (
          <Alert className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800">
            <Lightbulb className="w-4 h-4" />
            <AlertDescription>
              {lesson.track === 'planets' && lesson.title.includes('Mercury') && (
                <div>
                  <strong>Mercury & Your {userChartData.sunSign} Sun:</strong> Mercury governs communication, thinking, and learning style. 
                  As a {userChartData.sunSign} Sun, Mercury influences how you express your core identity and process information in your unique way.
                </div>
              )}
              {lesson.track === 'planets' && lesson.title.includes('Venus') && (
                <div>
                  <strong>Venus & Your {userChartData.sunSign} Sun:</strong> Venus rules love, relationships, and what you value. 
                  With your {userChartData.sunSign} Sun, Venus shapes how you approach romance and express affection through your core personality.
                </div>
              )}
              {lesson.track === 'planets' && lesson.title.includes('Mars') && (
                <div>
                  <strong>Mars & Your {userChartData.sunSign} Sun:</strong> Mars represents drive, ambition, and how you pursue goals. 
                  Your {userChartData.sunSign} Sun colors how Mars energy manifests in your motivation and action style.
                </div>
              )}
              {lesson.track === 'planets' && lesson.title.includes('Jupiter') && (
                <div>
                  <strong>Jupiter & Your {userChartData.sunSign} Sun:</strong> Jupiter brings expansion, wisdom, and growth opportunities. 
                  As a {userChartData.sunSign} Sun, Jupiter amplifies your natural traits and shows where you find luck and abundance.
                </div>
              )}
              {lesson.track === 'planets' && lesson.title.includes('Saturn') && (
                <div>
                  <strong>Saturn & Your {userChartData.sunSign} Sun:</strong> Saturn teaches discipline, responsibility, and life lessons. 
                  Your {userChartData.sunSign} Sun influences how you approach Saturn's challenges and build lasting foundations.
                </div>
              )}
              {lesson.track === 'planets' && lesson.title.includes('Uranus') && (
                <div>
                  <strong>Uranus & Your {userChartData.sunSign} Sun:</strong> Uranus brings innovation, sudden change, and revolutionary thinking. 
                  With your {userChartData.sunSign} Sun, Uranus shows how you express uniqueness and break free from limitations.
                </div>
              )}
              {lesson.track === 'planets' && lesson.title.includes('Neptune') && (
                <div>
                  <strong>Neptune & Your {userChartData.sunSign} Sun:</strong> Neptune governs dreams, spirituality, and intuition. 
                  Your {userChartData.sunSign} Sun filters Neptune's mystical energy through your core identity and creative expression.
                </div>
              )}
              {lesson.track === 'planets' && lesson.title.includes('Pluto') && (
                <div>
                  <strong>Pluto & Your {userChartData.sunSign} Sun:</strong> Pluto rules transformation, power, and regeneration. 
                  As a {userChartData.sunSign} Sun, Pluto shows how you undergo deep personal evolution and embrace change.
                </div>
              )}
              {lesson.track === 'houses' && (
                <div>
                  <strong>The House System:</strong> The 12 houses represent different life areas and experiences in your chart. 
                  Each house governs specific themes - from identity and resources to relationships and career - 
                  showing where planetary energies manifest in your daily life.
                </div>
              )}
              {lesson.track === 'nodes' && (
                <div>
                  <strong>Your Lunar Nodes:</strong> Your North Node in {(userChartData as any)?.northNode || 'your sign'} shows your soul's growth direction, 
                  while your South Node in {(userChartData as any)?.southNode || 'the opposite sign'} represents past-life gifts and talents. 
                  Together, they reveal your karmic path and life purpose in this incarnation.
                </div>
              )}
              {lesson.track !== 'planets' && lesson.track !== 'houses' && lesson.track !== 'nodes' && (
                <div>
                  <strong>Your Personal Chart Context:</strong> As someone with {userChartData.sunSign} Sun, {userChartData.moonSign} Moon, 
                  and {userChartData.risingSign} Rising, this lesson will use examples specific to your unique astrological makeup.
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Lesson Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              {lesson.title}
            </CardTitle>
            <CardDescription>{lesson.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {(personalizedContent || []).slice(0, currentSection + 1).map((content, index) => (
              <div 
                key={index} 
                className={`transition-opacity duration-500 ${index === currentSection ? 'opacity-100' : 'opacity-75'}`}
              >
                {content.type === 'text' && (
                  <div className="prose prose-purple dark:prose-invert max-w-none">
                    {content.data.title && (
                      <h3 className="text-xl font-semibold mb-3 text-purple-700 dark:text-purple-300">
                        {content.data.title}
                      </h3>
                    )}
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {content.data.content}
                    </p>
                  </div>
                )}
                
                {content.type === 'interactive' && (
                  <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold mb-2 text-blue-700 dark:text-blue-300">
                          Interactive Element: {content.data.type}
                        </h4>
                        <p className="text-blue-600 dark:text-blue-400 mb-4">
                          {content.data.element === 'personal-foundation' ? (
                            'Explore your personal-foundation traits through interactive examples'
                          ) : content.data.element === 'creative-expression' ? (
                            'Explore your creative-expression traits through interactive examples'
                          ) : content.data.element === 'higher-purpose' ? (
                            'Explore your higher-purpose traits through interactive examples'
                          ) : content.data.element === 'lunar-nodes' ? (
                            `Explore your ${content.data.northNode} North Node and ${content.data.southNode} South Node axis`
                          ) : content.data.element === 'north-node' ? (
                            `Explore your North Node in ${content.data.sign} growth path and life lessons`
                          ) : content.data.element === 'south-node' ? (
                            `Explore your South Node in ${content.data.sign} gifts and natural talents`
                          ) : content.data.element === 'nodal-houses' ? (
                            `Explore your ${content.data.northNode} and ${content.data.southNode} nodal house placements`
                          ) : content.data.element === 'nodal-aspects' ? (
                            `Explore your ${content.data.northNode} and ${content.data.southNode} nodal aspects patterns`
                          ) : content.data.element === 'pattern-exploration' ? (
                            'Learn to identify the seven chart patterns through interactive pattern recognition'
                          ) : content.data.element === 'hemisphere-focus' ? (
                            'Explore how your planets distribute across the four hemispheres of life'
                          ) : content.data.element === 'your-chart-pattern' ? (
                            'Discover your personal birth chart pattern with visual analysis and overlay'
                          ) : (
                            `Explore your ${content.data.sign || 'astrological'} ${content.data.element} through interactive examples`
                          )}
                        </p>
                        <Button 
                          variant="outline" 
                          className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300"
                          onClick={() => {
                            setShowInteractiveModal(true);
                            setInteractiveContent(content.data);
                          }}
                        >
                          Launch Interactive Tool
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {content.type === 'chart-highlight' && (
                  <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <Award className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold mb-2 text-yellow-700 dark:text-yellow-300">
                          Chart Focus: {content.data.element}
                        </h4>
                        <p className="text-yellow-600 dark:text-yellow-400 mb-4">
                          {content.data.description}
                        </p>
                        <Button 
                          variant="outline" 
                          className="border-yellow-300 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-600 dark:text-yellow-300"
                          onClick={() => {
                            setShowInteractiveModal(true);
                            setInteractiveContent({
                              ...content.data,
                              type: 'chart-focus'
                            });
                          }}
                        >
                          View in Your Chart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {index < (personalizedContent?.length || 0) - 1 && (
                  <Separator className="my-6" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Navigation & Completion */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
            disabled={currentSection === 0}
            data-testid="button-previous-section"
          >
            Previous Section
          </Button>

          <div className="flex gap-2">
            {currentSection < (personalizedContent?.length || 0) - 1 ? (
              <Button
                onClick={() => setCurrentSection(currentSection + 1)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Next Section
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </Button>
            ) : isAlreadyCompleted ? (
              <Button
                disabled
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Previously Completed
              </Button>
            ) : (
              <Button
                onClick={handleCompleteLesson}
                disabled={isCompleted || progressMutation.isPending || currentSection < (personalizedContent?.length || 0) - 1}
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-complete-lesson"
              >
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Completed
                  </>
                ) : progressMutation.isPending ? (
                  "Recording Progress..."
                ) : (
                  <>
                    Complete Lesson
                    <CheckCircle2 className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Completion Message */}
        {(isCompleted || isAlreadyCompleted) && (
          <Alert className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <CheckCircle2 className="w-4 h-4" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                <strong>{isAlreadyCompleted ? 'Lesson Previously Completed!' : 'Lesson Complete!'}</strong> You've earned +{lesson.xpReward} XP. {nextLessonId ? 'Ready for your next cosmic learning adventure?' : 'You\'ve completed all available lessons in this track!'}
              </div>
              <div className="flex gap-2 ml-4">
                <Link href="/learning">
                  <Button variant="outline" size="sm">
                    Back to Dashboard
                  </Button>
                </Link>
                {nextLessonId ? (
                  <Link href={`/learning/lesson/${nextLessonId}`}>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      Next Lesson →
                    </Button>
                  </Link>
                ) : (
                  <Link href="/learning">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      ✨ Track Complete!
                    </Button>
                  </Link>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Interactive Modal */}
        <Dialog open={showInteractiveModal} onOpenChange={setShowInteractiveModal}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col [&>button]:opacity-100 [&>button]:bg-gray-100 [&>button]:hover:bg-gray-200 [&>button]:border [&>button]:border-gray-300">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Interactive Learning: {interactiveContent?.type}
              </DialogTitle>
              <DialogDescription>
                {interactiveContent?.element === 'big-three' ? (
                  `Explore your ${interactiveContent?.sun}-${interactiveContent?.moon}-${interactiveContent?.rising} combination through hands-on examples`
                ) : interactiveContent?.element === 'pattern-exploration' ? (
                  'Learn to recognize the seven chart patterns through visual examples and interactive training'
                ) : interactiveContent?.element === 'hemisphere-focus' ? (
                  'Explore how planetary distribution across hemispheres reveals your life focus and approach'
                ) : interactiveContent?.element === 'your-chart-pattern' ? (
                  'Discover your personal birth chart pattern with visual analysis and interpretation'
                ) : (
                  `Explore your ${interactiveContent?.sign} ${interactiveContent?.element} traits through hands-on examples`
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 overflow-y-auto flex-1 pr-2">
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                <CardContent className="p-6">
                  {interactiveContent?.element === 'sun' && (
                    <>
                      <h4 className="font-semibold mb-3">Your {interactiveContent?.sign} Sun in Action</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Scenario 1: At Work</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Your Virgo sun drives you to organize projects and help teammates improve their processes.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Scenario 2: In Relationships</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            You show love through practical acts of service and thoughtful attention to details.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Scenario 3: Personal Growth</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            You find fulfillment in continuous learning and making meaningful improvements.
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {interactiveContent?.element === 'moon' && (
                    <>
                      <h4 className="font-semibold mb-3">Your {interactiveContent?.sign} Moon Emotions</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Emotional Response: Stress</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Your Pisces moon absorbs stress from others and needs creative escape and alone time to recharge.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Emotional Response: Joy</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            You experience joy through artistic expression, spiritual connection, and helping others heal.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Emotional Response: Comfort</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            You find comfort in water, music, meditation, and environments that honor your sensitivity.
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {interactiveContent?.element === 'rising' && (
                    <>
                      <h4 className="font-semibold mb-3">Your {interactiveContent?.sign} Rising First Impressions</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">First Meeting: Professional Setting</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Your Pisces rising makes you appear approachable and intuitive, often putting others at ease immediately.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">First Meeting: Social Gathering</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            People see you as mysteriously wise and compassionate, often seeking your advice or comfort.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">First Meeting: New Environment</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            You adapt to new situations with fluid grace, reading the room and adjusting your energy accordingly.
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {interactiveContent?.type === 'element-explorer' && (
                    <>
                      <h4 className="font-semibold mb-3">Your {interactiveContent?.element.charAt(0).toUpperCase() + interactiveContent?.element.slice(1)} Element Exploration</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Element Characteristics</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {interactiveContent?.element === 'earth' && 'Earth signs are practical, grounded, and focused on building stable foundations. They value security, work steadily toward goals, and bring reliability to everything they do.'}
                            {interactiveContent?.element === 'fire' && 'Fire signs are passionate, energetic, and spontaneous. They lead with confidence, act on instinct, and bring enthusiasm and inspiration to their pursuits.'}
                            {interactiveContent?.element === 'air' && 'Air signs are intellectual, social, and communicative. They think before acting, value ideas and relationships, and excel at connecting people and concepts.'}
                            {interactiveContent?.element === 'water' && 'Water signs are emotional, intuitive, and empathetic. They lead with their hearts, possess strong psychic abilities, and connect deeply with others\' feelings.'}
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Your {interactiveContent?.sign} Expression</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            As a {interactiveContent?.sign} sun, you express {interactiveContent?.element} energy through your core personality, bringing {interactiveContent?.element} qualities to how you approach life and relationships.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Daily Application</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {interactiveContent?.element === 'earth' && 'You naturally organize your environment, create practical solutions, and build lasting structures in your work and relationships.'}
                            {interactiveContent?.element === 'fire' && 'You initiate new projects with enthusiasm, inspire others with your passion, and approach challenges with courage and optimism.'}
                            {interactiveContent?.element === 'air' && 'You connect ideas and people, communicate effectively, and approach problems through analysis and collaboration.'}
                            {interactiveContent?.element === 'water' && 'You navigate life through intuition, create emotional connections, and offer healing and compassion to those around you.'}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {interactiveContent?.type === 'modality-explorer' && (
                    <>
                      <h4 className="font-semibold mb-3">Your {interactiveContent?.modality.charAt(0).toUpperCase() + interactiveContent?.modality.slice(1)} Modality Exploration</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Modality Approach</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {interactiveContent?.modality === 'cardinal' && 'Cardinal signs are natural initiators and leaders. You excel at starting new projects, taking charge of situations, and pioneering change.'}
                            {interactiveContent?.modality === 'fixed' && 'Fixed signs are determined and persistent. You excel at sustaining projects, providing stability, and seeing things through to completion.'}
                            {interactiveContent?.modality === 'mutable' && 'Mutable signs are adaptable and flexible. You excel at adjusting to change, finding creative solutions, and helping others transition.'}
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Your {interactiveContent?.sign} Style</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            As a {interactiveContent?.modality} sign, your {interactiveContent?.sign} sun approaches goals and challenges with {interactiveContent?.modality} energy, making you naturally {interactiveContent?.modality === 'cardinal' ? 'driven to lead and initiate' : interactiveContent?.modality === 'fixed' ? 'determined to maintain and perfect' : 'adaptable and versatile'}.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Life Application</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {interactiveContent?.modality === 'cardinal' && 'You naturally step up as a leader, start new initiatives, and motivate others to action. People look to you to get things moving.'}
                            {interactiveContent?.modality === 'fixed' && 'You provide consistency and reliability, perfect existing systems, and offer unwavering support. People count on your steady presence.'}
                            {interactiveContent?.modality === 'mutable' && 'You help others adapt to change, find flexible solutions, and bridge different perspectives. People appreciate your versatility.'}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {interactiveContent?.type === 'big-three-integration' && (
                    <>
                      <h4 className="font-semibold mb-3">Your {interactiveContent?.sun}-{interactiveContent?.moon}-{interactiveContent?.rising} Big Three</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">{interactiveContent?.sun} Sun</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Core identity & self-expression
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">{interactiveContent?.moon} Moon</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Emotions & inner needs
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">{interactiveContent?.rising} Rising</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            First impressions & social mask
                          </p>
                        </div>
                      </div>
                      <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border mt-3">
                        <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Your Unique Blend</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {interactiveContent?.sun} identity + {interactiveContent?.moon} emotions + {interactiveContent?.rising} expression = Your complete astrological personality
                        </p>
                      </div>
                    </>
                  )}

                  {interactiveContent?.element === 'venus' && (
                    <>
                      <h4 className="font-semibold mb-3">Your {interactiveContent?.sign} Venus in Relationships</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Romantic Style</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Your {interactiveContent?.sign} Venus seeks harmony and balance in love, preferring diplomatic partners who appreciate beauty and fairness.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Value System</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            You value justice, aesthetic beauty, and partnership equality above all, finding fulfillment in creating harmonious environments.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Attraction Style</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            You're drawn to charming, well-balanced individuals who share your love of culture, art, and peaceful connection.
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {interactiveContent?.element === 'mercury' && (
                    <>
                      <h4 className="font-semibold mb-3">Your {interactiveContent?.sign} Mercury Communication</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Speaking Style</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Your Mercury in {interactiveContent?.sign} makes you communicate with balance and consideration, always seeking the fair perspective.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Learning Style</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            You learn best in peaceful, aesthetically pleasing environments with collaborative discussion and varied perspectives.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Decision Making</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            You weigh all options carefully, seeking input from others and striving for decisions that benefit everyone involved.
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {interactiveContent?.element === 'mars' && (
                    <>
                      <h4 className="font-semibold mb-3">Your {interactiveContent?.sign} Mars Drive</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Action Style</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Your Mars in {interactiveContent?.sign} drives you to act through cooperation and diplomacy, preferring win-win solutions.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Motivation</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            You're motivated by justice, beauty, and creating harmony in your environment and relationships.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Conflict Style</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            You handle conflict by seeking mediation, avoiding direct confrontation, and working toward balanced resolutions.
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {interactiveContent?.element === 'jupiter' && (
                    <>
                      <h4 className="font-semibold mb-3">Your {interactiveContent?.sign} Jupiter Growth</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Expansion Style</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Your Jupiter in {interactiveContent?.sign} brings growth through wisdom, higher learning, and expanding your philosophical horizons.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Luck & Opportunities</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Fortune comes to you through teaching, travel, cultural exchange, and sharing knowledge with others.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Wisdom Path</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            You find meaning in exploring diverse belief systems, cultures, and experiences that broaden your understanding of life.
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {interactiveContent?.element === 'saturn' && (
                    <>
                      <h4 className="font-semibold mb-3">Your {interactiveContent?.sign} Saturn Lessons</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Life Discipline</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Your Saturn in {interactiveContent?.sign} teaches you discipline through structure, responsibility, and long-term commitment to your goals.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Challenges & Growth</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            You master life lessons through patience, perseverance, and building solid foundations that last.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Authority & Mastery</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            You develop expertise by respecting traditional wisdom while gradually building your own authoritative knowledge.
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {interactiveContent?.element === 'uranus' && (
                    <>
                      <h4 className="font-semibold mb-3">Your {interactiveContent?.sign} Uranus Innovation</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Revolutionary Spirit</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Your Uranus in {interactiveContent?.sign} brings sudden insights, innovative thinking, and a desire to break free from limitations.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Change & Freedom</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            You seek independence and original expression, often surprising others with your unique perspective and unconventional approaches.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Future Vision</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            You're drawn to progressive ideas, technology, and social causes that help humanity evolve and improve.
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {interactiveContent?.element === 'neptune' && (
                    <>
                      <h4 className="font-semibold mb-3">Your {interactiveContent?.sign} Neptune Dreams</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Spiritual Connection</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Your Neptune in {interactiveContent?.sign} connects you to higher realms through intuition, creativity, and spiritual practices.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Artistic Vision</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            You express divine inspiration through art, music, poetry, or other creative mediums that touch the soul.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Compassion & Service</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            You feel called to serve others, often through healing, charitable work, or bringing beauty into the world.
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {interactiveContent?.element === 'pluto' && (
                    <>
                      <h4 className="font-semibold mb-3">Your {interactiveContent?.sign} Pluto Transformation</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Deep Transformation</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Your Pluto in {interactiveContent?.sign} drives profound personal evolution through intense experiences and regeneration.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Power & Regeneration</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            You possess the ability to rise from challenges stronger than before, transforming obstacles into sources of power.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Hidden Potential</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            You uncover hidden truths and tap into deep psychological insights that help you and others heal and transform.
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {interactiveContent?.element === 'houses-general' && (
                    <>
                      <h4 className="font-semibold mb-3">The 12 Houses Overview</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Houses 1-4: Personal Foundation</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            The first four houses focus on your personal development - identity, resources, communication, and emotional foundation.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Houses 5-8: Personal Expression</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            These houses govern how you express yourself - creativity, work, relationships, and shared resources.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Houses 9-12: Universal Connection</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            The final houses connect you to the wider world - philosophy, career, community, and spirituality.
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {(interactiveContent?.element === 'personal-foundation' || 
                    interactiveContent?.element === 'creative-expression' || 
                    interactiveContent?.element === 'higher-purpose') && (
                    <>
                      <h4 className="font-semibold mb-3">
                        {interactiveContent?.element === 'personal-foundation' && 'Your Personal Foundation (Houses 1-4)'}
                        {interactiveContent?.element === 'creative-expression' && 'Your Creative Expression (Houses 5-8)'}
                        {interactiveContent?.element === 'higher-purpose' && 'Your Higher Purpose (Houses 9-12)'}
                      </h4>
                      <div className="space-y-4">
                        {interactiveContent?.houseData ? (
                          <>
                            {(() => {
                              const getOrdinal = (num: number): string => {
                                const suffixes = ['th', 'st', 'nd', 'rd'];
                                const value = num % 100;
                                return num + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
                              };
                              
                              const getHouseDescription = (num: number): { theme: string, description: string } => {
                                const descriptions = {
                                  1: { theme: 'Identity & Appearance', description: `shapes how you present yourself to the world and your natural approach to new situations` },
                                  2: { theme: 'Resources & Values', description: `influences your relationship with money, possessions, and what you truly value in life` },
                                  3: { theme: 'Communication & Learning', description: `affects how you communicate, learn, and connect with siblings and your local environment` },
                                  4: { theme: 'Home & Family', description: `governs your emotional foundation, family relationships, and sense of home and security` },
                                  5: { theme: 'Creativity & Romance', description: `influences your creative expression, romantic relationships, and approach to fun and self-expression` },
                                  6: { theme: 'Work & Health', description: `affects your daily routines, work environment, health habits, and service to others` },
                                  7: { theme: 'Partnerships & Marriage', description: `influences your approach to partnerships, marriage, and what you seek in close relationships` },
                                  8: { theme: 'Transformation & Shared Resources', description: `governs deep transformation, shared finances, and how you handle life's intense experiences` },
                                  9: { theme: 'Philosophy & Higher Learning', description: `influences your beliefs, higher education, travel, and quest for meaning and wisdom` },
                                  10: { theme: 'Career & Reputation', description: `reveals your natural approach to career, reputation, and how you want to be known publicly` },
                                  11: { theme: 'Friends & Social Networks', description: `affects your friendships, group involvements, and hopes and dreams for the future` },
                                  12: { theme: 'Spirituality & Subconscious', description: `governs your spiritual life, hidden strengths, and connection to the collective unconscious` }
                                };
                                return descriptions[num as keyof typeof descriptions] || { theme: 'Life Area', description: 'influences this area of your life' };
                              };

                              const housesToShow = interactiveContent?.houses || [];
                              
                              return (
                                <div className="max-h-96 overflow-y-auto space-y-3">
                                  {housesToShow.map((houseNumber: number) => {
                                    const houseKey = `house_${houseNumber}`;
                                    const houseInfo = interactiveContent.houseData[houseKey];
                                    
                                    if (houseInfo) {
                                      const { theme, description } = getHouseDescription(houseNumber);
                                      return (
                                        <div key={houseNumber} className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border">
                                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">{getOrdinal(houseNumber)} House - {theme}</p>
                                          <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Your <span className="font-medium">{houseInfo.sign}</span> {getOrdinal(houseNumber).toLowerCase()} house {description}.
                                          </p>
                                        </div>
                                      );
                                    }
                                    return null;
                                  })}
                                </div>
                              );
                            })()}
                          </>
                        ) : (
                          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                            <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Complete Your Birth Profile</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              Add your birth time and location to see your personalized house system and how each life area is influenced by specific zodiac signs.
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {interactiveContent?.element === 'big-three' && (
                    <>
                      <h4 className="font-semibold mb-3">Your {interactiveContent?.sun}-{interactiveContent?.moon}-{interactiveContent?.rising} Integration</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Core Identity Integration</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Your {interactiveContent?.sun} Sun provides your life purpose, while your {interactiveContent?.moon} Moon governs your emotional responses, and your {interactiveContent?.rising} Rising shapes how others perceive you.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Daily Life Expression</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            In daily interactions, people first see your {interactiveContent?.rising} Rising energy, then discover your {interactiveContent?.sun} Sun motivations, while your {interactiveContent?.moon} Moon influences how you process experiences privately.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Growth & Balance</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Personal growth comes from integrating these three energies - using your {interactiveContent?.rising} Rising to authentically express your {interactiveContent?.sun} Sun nature while honoring your {interactiveContent?.moon} Moon emotional needs.
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {interactiveContent?.element === 'south-node-explorer' && (
                    <>
                      <h4 className="font-semibold mb-3">Your {interactiveContent?.sign} South Node Journey</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Past Life Gifts</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Your South Node in {interactiveContent?.sign} represents natural talents and abilities you've developed. 
                            These are your comfort zone skills that come easily to you.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Potential Pitfalls</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            While these {interactiveContent?.sign} qualities serve you well, over-relying on them can keep you stuck. 
                            Growth comes from balancing these with your North Node development.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Integration Strategy</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Use your {interactiveContent?.sign} South Node wisdom as a foundation, but don't let it limit your growth. 
                            These gifts support your journey toward your North Node purpose.
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {interactiveContent?.element === 'north-node-explorer' && (
                    <>
                      <h4 className="font-semibold mb-3">Your {interactiveContent?.sign} North Node Path</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-green-600 dark:text-green-400">Soul's Purpose</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Your North Node in {interactiveContent?.sign} represents your soul's growth direction in this lifetime. 
                            This is where you're meant to develop new skills and perspectives.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-green-600 dark:text-green-400">Growth Challenges</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Developing {interactiveContent?.sign} qualities may feel uncomfortable at first because they're unfamiliar. 
                            This discomfort is actually a sign you're growing in the right direction.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-green-600 dark:text-green-400">Fulfillment Path</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            True fulfillment comes from embracing {interactiveContent?.sign} energy while using your South Node gifts as support. 
                            This creates a balanced approach to your soul's evolution.
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {interactiveContent?.element === 'nodal-houses-explorer' && (
                    <>
                      <h4 className="font-semibold mb-3">Your Nodal House Placements</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Life Area Focus</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Your North Node in {interactiveContent?.northNode} and South Node in {interactiveContent?.southNode} show 
                            the life areas where you're learning to balance past experience with future growth.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">House Axis Meaning</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            The house positions reveal where you naturally excel (South Node house) and where you need to develop 
                            new approaches (North Node house). Both areas are important for your complete evolution.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Practical Application</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Look for opportunities to apply {interactiveContent?.northNode} energy in daily life while drawing on 
                            your {interactiveContent?.southNode} wisdom. This creates a powerful foundation for growth.
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {interactiveContent?.element === 'nodal-aspects-explorer' && (
                    <>
                      <h4 className="font-semibold mb-3">Your Nodal Aspects & Connections</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Planetary Support</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Planets aspecting your {interactiveContent?.northNode} North Node and {interactiveContent?.southNode} South Node 
                            provide additional tools and challenges for your karmic journey.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Aspect Patterns</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            The geometric relationships between planets and your nodes create specific energy patterns that 
                            influence how you experience your karmic lessons and growth opportunities.
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Integration Guide</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Understanding these planetary connections helps you recognize when you're being called to grow 
                            and provides insights into the best ways to work with your nodal energy.
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {interactiveContent?.type === 'chart-focus' && (
                    <>
                      <h4 className="font-semibold mb-3">Your Birth Chart Focus: {interactiveContent?.element}</h4>
                      <div className="space-y-4">
                        {/* Simple Birth Chart Visualization */}
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-lg border border-indigo-200 dark:border-indigo-800">
                          <div className="flex items-center justify-center">
                            <div className="relative w-48 h-48 rounded-full border-4 border-indigo-300 dark:border-indigo-700 bg-white dark:bg-gray-900">
                              {/* Chart Circle with highlighted element */}
                              <div className="absolute inset-0 rounded-full">
                                {/* Highlighted element position based on type */}
                                {interactiveContent?.element?.toLowerCase().includes('moon') && (
                                  <div className="absolute top-2 right-8 w-4 h-4 bg-yellow-400 rounded-full shadow-lg animate-pulse">
                                    <div className="text-xs text-center mt-5 font-semibold text-indigo-700">
                                      🌙 {lessonData?.userChartData?.moonSign}
                                    </div>
                                  </div>
                                )}
                                {interactiveContent?.element?.toLowerCase().includes('sun') && (
                                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-orange-400 rounded-full shadow-lg animate-pulse">
                                    <div className="text-xs text-center mt-5 font-semibold text-indigo-700">
                                      ☉ {lessonData?.userChartData?.sunSign}
                                    </div>
                                  </div>
                                )}
                                {interactiveContent?.element?.toLowerCase().includes('rising') && (
                                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-green-400 rounded-full shadow-lg animate-pulse">
                                    <div className="text-xs text-center mt-5 font-semibold text-indigo-700">
                                      ↗ {lessonData?.userChartData?.risingSign}
                                    </div>
                                  </div>
                                )}
                                {interactiveContent?.element?.toLowerCase().includes('mercury') && (
                                  <div className="absolute bottom-8 left-8 w-4 h-4 bg-blue-400 rounded-full shadow-lg animate-pulse">
                                    <div className="text-xs text-center mt-5 font-semibold text-indigo-700">
                                      ☿ Mercury
                                    </div>
                                  </div>
                                )}
                                {interactiveContent?.element?.toLowerCase().includes('venus') && (
                                  <div className="absolute bottom-2 right-1/4 w-4 h-4 bg-pink-400 rounded-full shadow-lg animate-pulse">
                                    <div className="text-xs text-center mt-5 font-semibold text-indigo-700">
                                      ♀ Venus
                                    </div>
                                  </div>
                                )}
                                {interactiveContent?.element?.toLowerCase().includes('mars') && (
                                  <div className="absolute top-16 right-16 w-4 h-4 bg-red-400 rounded-full shadow-lg animate-pulse">
                                    <div className="text-xs text-center mt-5 font-semibold text-indigo-700">
                                      ♂ Mars
                                    </div>
                                  </div>
                                )}
                                {interactiveContent?.element?.toLowerCase().includes('jupiter') && (
                                  <div className="absolute bottom-16 left-16 w-4 h-4 bg-purple-400 rounded-full shadow-lg animate-pulse">
                                    <div className="text-xs text-center mt-5 font-semibold text-indigo-700">
                                      ♃ Jupiter
                                    </div>
                                  </div>
                                )}
                                {interactiveContent?.element?.toLowerCase().includes('saturn') && (
                                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-amber-500 rounded-full shadow-lg animate-pulse">
                                    <div className="text-xs text-center mt-5 font-semibold text-indigo-700">
                                      ♄ Saturn
                                    </div>
                                  </div>
                                )}
                                {interactiveContent?.element?.toLowerCase().includes('uranus') && (
                                  <div className="absolute top-4 left-4 w-4 h-4 bg-cyan-400 rounded-full shadow-lg animate-pulse">
                                    <div className="text-xs text-center mt-5 font-semibold text-indigo-700">
                                      ♅ Uranus
                                    </div>
                                  </div>
                                )}
                                {interactiveContent?.element?.toLowerCase().includes('neptune') && (
                                  <div className="absolute bottom-4 right-4 w-4 h-4 bg-blue-500 rounded-full shadow-lg animate-pulse">
                                    <div className="text-xs text-center mt-5 font-semibold text-indigo-700">
                                      ♆ Neptune
                                    </div>
                                  </div>
                                )}
                                {interactiveContent?.element?.toLowerCase().includes('pluto') && (
                                  <div className="absolute bottom-8 right-8 w-4 h-4 bg-gray-600 rounded-full shadow-lg animate-pulse">
                                    <div className="text-xs text-center mt-5 font-semibold text-indigo-700">
                                      ♇ Pluto
                                    </div>
                                  </div>
                                )}
                                
                                {/* Big Three combination view */}
                                {interactiveContent?.element?.toLowerCase().includes('big-three') && (
                                  <>
                                    <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-orange-400 rounded-full shadow-lg animate-pulse">
                                      <div className="text-xs text-center mt-5 font-semibold text-indigo-700">
                                        ☉ {interactiveContent?.sun}
                                      </div>
                                    </div>
                                    <div className="absolute top-2 right-8 w-4 h-4 bg-yellow-400 rounded-full shadow-lg animate-pulse">
                                      <div className="text-xs text-center mt-5 font-semibold text-indigo-700">
                                        🌙 {interactiveContent?.moon}
                                      </div>
                                    </div>
                                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-green-400 rounded-full shadow-lg animate-pulse">
                                      <div className="text-xs text-center mt-5 font-semibold text-indigo-700">
                                        ↗ {interactiveContent?.rising}
                                      </div>
                                    </div>
                                  </>
                                )}
                                
                                {/* Lunar Nodes visualization */}
                                {interactiveContent?.element?.toLowerCase().includes('lunar-nodes') && (
                                  <>
                                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-green-500 rounded-full shadow-lg animate-pulse">
                                      <div className="text-xs text-center mt-5 font-semibold text-indigo-700">
                                        ☊ {interactiveContent?.northNode}
                                      </div>
                                    </div>
                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-orange-500 rounded-full shadow-lg animate-pulse">
                                      <div className="text-xs text-center mt-5 font-semibold text-indigo-700">
                                        ☋ {interactiveContent?.southNode}
                                      </div>
                                    </div>
                                  </>
                                )}
                                
                                {/* North Node focus */}
                                {interactiveContent?.element?.toLowerCase().includes('north-node') && (
                                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-green-500 rounded-full shadow-lg animate-pulse">
                                    <div className="text-xs text-center mt-6 font-semibold text-indigo-700">
                                      ☊ {interactiveContent?.sign}
                                    </div>
                                  </div>
                                )}
                                
                                {/* South Node focus */}
                                {interactiveContent?.element?.toLowerCase().includes('south-node') && (
                                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-orange-500 rounded-full shadow-lg animate-pulse">
                                    <div className="text-xs text-center mt-6 font-semibold text-indigo-700">
                                      ☋ {interactiveContent?.sign}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Nodal Houses visualization */}
                                {interactiveContent?.element?.toLowerCase().includes('nodal-houses') && (
                                  <>
                                    <div className="absolute top-6 left-6 w-4 h-4 bg-green-500 rounded-full shadow-lg animate-pulse">
                                      <div className="text-xs text-center mt-5 font-semibold text-indigo-700">
                                        ☊ {interactiveContent?.northNode}
                                      </div>
                                    </div>
                                    <div className="absolute bottom-6 right-6 w-4 h-4 bg-orange-500 rounded-full shadow-lg animate-pulse">
                                      <div className="text-xs text-center mt-5 font-semibold text-indigo-700">
                                        ☋ {interactiveContent?.southNode}
                                      </div>
                                    </div>
                                  </>
                                )}
                                
                                {/* Nodal Aspects visualization */}
                                {interactiveContent?.element?.toLowerCase().includes('nodal-aspects') && (
                                  <>
                                    <div className="absolute top-8 left-8 w-4 h-4 bg-green-500 rounded-full shadow-lg animate-pulse">
                                      <div className="text-xs text-center mt-5 font-semibold text-indigo-700">
                                        ☊ {interactiveContent?.northNode}
                                      </div>
                                    </div>
                                    <div className="absolute bottom-8 right-8 w-4 h-4 bg-orange-500 rounded-full shadow-lg animate-pulse">
                                      <div className="text-xs text-center mt-5 font-semibold text-indigo-700">
                                        ☋ {interactiveContent?.southNode}
                                      </div>
                                    </div>
                                    {/* Add connecting lines for aspects */}
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                      <line x1="25%" y1="25%" x2="75%" y2="75%" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="2,2" opacity="0.6"/>
                                    </svg>
                                  </>
                                )}
                                
                                {/* Center label */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="text-center">
                                    <div className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">Your Chart</div>
                                    <div className="text-xs text-indigo-600 dark:text-indigo-400">{lessonData?.userChartData?.birthData?.location}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {interactiveContent?.description || `See how your ${interactiveContent?.element} appears in your personal birth chart`}
                            </p>
                          </div>
                        </div>

                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Chart Insight</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            This placement shows how {interactiveContent?.element} influences your personality and life path. 
                            The position relative to other elements creates your unique astrological blueprint.
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Pattern Recognition Interactive */}
                  {interactiveContent?.element === 'pattern-exploration' && (
                    <>
                      <h4 className="font-semibold mb-3">Chart Pattern Recognition Training</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                            <h5 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">Bowl Pattern</h5>
                            <div className="relative w-20 h-20 mx-auto border-2 border-gray-300 rounded-full">
                              <div className="absolute top-2 left-4 w-2 h-2 bg-blue-500 rounded-full"></div>
                              <div className="absolute top-6 right-3 w-2 h-2 bg-blue-500 rounded-full"></div>
                              <div className="absolute bottom-6 right-3 w-2 h-2 bg-blue-500 rounded-full"></div>
                              <div className="absolute bottom-2 left-4 w-2 h-2 bg-blue-500 rounded-full"></div>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">180° spread - Self-contained, purposeful</p>
                          </div>
                          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                            <h5 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">Bucket Pattern</h5>
                            <div className="relative w-20 h-20 mx-auto border-2 border-gray-300 rounded-full">
                              <div className="absolute top-2 left-4 w-2 h-2 bg-blue-500 rounded-full"></div>
                              <div className="absolute top-6 right-3 w-2 h-2 bg-blue-500 rounded-full"></div>
                              <div className="absolute bottom-6 right-3 w-2 h-2 bg-blue-500 rounded-full"></div>
                              <div className="absolute bottom-2 left-4 w-2 h-2 bg-blue-500 rounded-full"></div>
                              <div className="absolute top-4 left-1 w-2 h-2 bg-orange-500 rounded-full"></div>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">Bowl + Singleton - Mission-focused</p>
                          </div>
                          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                            <h5 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">Seesaw Pattern</h5>
                            <div className="relative w-20 h-20 mx-auto border-2 border-gray-300 rounded-full">
                              <div className="absolute top-2 left-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                              <div className="absolute top-4 left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                              <div className="absolute bottom-2 right-2 w-2 h-2 bg-green-500 rounded-full"></div>
                              <div className="absolute bottom-4 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">Opposing clusters - Dualistic balance</p>
                          </div>
                          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                            <h5 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">Bundle Pattern</h5>
                            <div className="relative w-20 h-20 mx-auto border-2 border-gray-300 rounded-full">
                              <div className="absolute top-2 left-6 w-2 h-2 bg-purple-500 rounded-full"></div>
                              <div className="absolute top-4 left-8 w-2 h-2 bg-purple-500 rounded-full"></div>
                              <div className="absolute top-6 left-7 w-2 h-2 bg-purple-500 rounded-full"></div>
                              <div className="absolute top-8 left-5 w-2 h-2 bg-purple-500 rounded-full"></div>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">120° cluster - Specialized focus</p>
                          </div>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Pattern Recognition Exercise</p>
                          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                            Study these four main patterns. Each reveals different approaches to life: Bowl (purposeful completion), 
                            Bucket (single mission), Seesaw (balancing opposites), Bundle (concentrated expertise).
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Hemisphere Analysis Interactive */}
                  {interactiveContent?.element === 'hemisphere-focus' && (
                    <>
                      <h4 className="font-semibold mb-3">Hemispheric Analysis Tool</h4>
                      <div className="space-y-4">
                        <div className="relative w-64 h-64 mx-auto border-2 border-gray-400 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                          {/* Hemisphere dividers */}
                          <div className="absolute w-full h-0.5 bg-gray-400 top-1/2 transform -translate-y-px"></div>
                          <div className="absolute h-full w-0.5 bg-gray-400 left-1/2 transform -translate-x-px"></div>
                          
                          {/* Hemisphere labels */}
                          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-blue-700">Upper (Public)</div>
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-green-700">Lower (Private)</div>
                          <div className="absolute top-1/2 left-2 transform -translate-y-1/2 -rotate-90 text-xs font-semibold text-purple-700">Eastern (Self)</div>
                          <div className="absolute top-1/2 right-2 transform -translate-y-1/2 rotate-90 text-xs font-semibold text-orange-700">Western (Others)</div>
                          
                          {/* Sample planetary placements */}
                          <div className="absolute top-8 left-16 w-3 h-3 bg-yellow-500 rounded-full shadow-lg" title="Sun"></div>
                          <div className="absolute top-12 right-20 w-3 h-3 bg-gray-300 rounded-full shadow-lg" title="Moon"></div>
                          <div className="absolute bottom-8 left-20 w-3 h-3 bg-red-500 rounded-full shadow-lg" title="Mars"></div>
                          <div className="absolute bottom-12 right-16 w-3 h-3 bg-green-500 rounded-full shadow-lg" title="Venus"></div>
                          <div className="absolute top-16 left-32 w-3 h-3 bg-blue-500 rounded-full shadow-lg" title="Mercury"></div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Upper Hemisphere</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              Career, public recognition, achievement, outer world focus
                            </p>
                          </div>
                          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                            <p className="text-sm font-medium text-green-700 dark:text-green-300">Lower Hemisphere</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              Home, inner life, personal foundation, private reflection
                            </p>
                          </div>
                          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                            <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Eastern Hemisphere</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              Self-initiation, independence, personal will, autonomous action
                            </p>
                          </div>
                          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                            <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Western Hemisphere</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              Relationships, partnerships, responsiveness to others, collaboration
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Personal Chart Pattern Viewer */}
                  {interactiveContent?.element === 'your-chart-pattern' && (
                    <PatternIdentificationChallenge 
                      chartData={lessonData?.userChartData?.detailedChart}
                      birthData={lessonData?.userChartData?.birthData}
                    />
                  )}

                  {interactiveContent?.type === 'chart-focus' ? (
                    <div className="flex gap-3 mt-4">
                      <Button 
                        onClick={() => {
                          setShowInteractiveModal(false);
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        Close Chart
                      </Button>
                      <Button 
                        onClick={() => {
                          setShowInteractiveModal(false);
                          // Only advance if there are more sections
                          if (currentSection < (personalizedContent?.length || 0) - 1) {
                            setCurrentSection(currentSection + 1);
                          }
                          toast({
                            title: "Chart Viewed!",
                            description: `You've explored your ${interactiveContent?.element} placement`,
                          });
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        Continue Learning
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => {
                        setShowInteractiveModal(false);
                        // Only advance if there are more sections
                        if (currentSection < (personalizedContent?.length || 0) - 1) {
                          setCurrentSection(currentSection + 1);
                        }
                        toast({
                          title: "Interactive Complete!",
                          description: interactiveContent?.element === 'big-three' ? 
                            `You've explored your ${interactiveContent?.sun}-${interactiveContent?.moon}-${interactiveContent?.rising} combination in detail` :
                            `You've explored your ${interactiveContent?.sign} ${interactiveContent?.element} in detail`,
                        });
                      }}
                      className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                    >
                      Continue Learning
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>

        {/* Quiz Modal */}
        {showQuiz && lessonData && (
          <Dialog open={showQuiz} onOpenChange={() => setShowQuiz(false)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center">
                  🧠 Knowledge Check
                </DialogTitle>
                <DialogDescription className="text-center">
                  Test your understanding to complete this lesson and potentially achieve mastery!
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto p-4">
                {(() => {
                  const quizSection = lessonData.personalizedContent.find(section => section.type === 'quiz');
                  return quizSection ? (
                    <LessonQuiz
                      questions={quizSection.data.questions}
                      onQuizComplete={handleQuizComplete}
                      lessonTitle={lessonData.lesson.title}
                    />
                  ) : null;
                })()}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}