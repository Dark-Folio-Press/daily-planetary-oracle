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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learning/dashboard"] });
      toast({
        title: "Progress recorded!",
        description: `You earned +${lessonData?.lesson.xpReward} XP`,
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
    
    const timeSpent = Math.floor((Date.now() - startTime) / 1000 / 60); // minutes
    
    progressMutation.mutate({
      lessonId: lessonData.lesson.id,
      status: 'completed',
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
              {Math.min(currentSection + 1, personalizedContent.length)} of {personalizedContent.length}
            </span>
          </div>
          <Progress 
            value={(Math.min(currentSection + 1, personalizedContent.length) / personalizedContent.length) * 100} 
            className="h-2"
          />
        </div>

        {/* User Chart Context */}
        {userChartData && (
          <Alert className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800">
            <Lightbulb className="w-4 h-4" />
            <AlertDescription>
              <strong>Your Personal Chart Context:</strong> As someone with {userChartData.sunSign} Sun, {userChartData.moonSign} Moon, 
              and {userChartData.risingSign} Rising, this lesson will use examples specific to your unique astrological makeup.
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
            {personalizedContent.slice(0, currentSection + 1).map((content, index) => (
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
                          Explore your {content.data.sign} {content.data.element} through interactive examples
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

                {index < personalizedContent.length - 1 && (
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
            {currentSection < personalizedContent.length - 1 ? (
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
                disabled={isCompleted || progressMutation.isPending || currentSection < personalizedContent.length - 1}
                className="bg-green-600 hover:bg-green-700"
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
          <DialogContent className="max-w-2xl [&>button]:opacity-100 [&>button]:bg-gray-100 [&>button]:hover:bg-gray-200 [&>button]:border [&>button]:border-gray-300">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Interactive Learning: {interactiveContent?.type}
              </DialogTitle>
              <DialogDescription>
                {interactiveContent?.element === 'big-three' ? (
                  `Explore your ${interactiveContent?.sun}-${interactiveContent?.moon}-${interactiveContent?.rising} combination through hands-on examples`
                ) : (
                  `Explore your ${interactiveContent?.sign} ${interactiveContent?.element} traits through hands-on examples`
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
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
                          if (currentSection < personalizedContent.length - 1) {
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
                        if (currentSection < personalizedContent.length - 1) {
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
      </div>
    </div>
  );
}