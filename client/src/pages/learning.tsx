import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Trophy, 
  Star, 
  BookOpen, 
  Target, 
  Clock, 
  Flame, 
  Award,
  ChevronRight,
  Lock,
  CheckCircle2,
  Calendar,
  GitBranch,
  Shapes,
  TrendingUp,
  Home,
  Palette
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { DoodleThemeDemo } from "@/components/doodle-theme-demo";
import { VintageThemeDemo } from "@/components/vintage-theme-demo";

interface LearningStats {
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  completedLessons: number;
  masteredLessons: number;
  totalTimeSpent: number;
  favoriteTrack?: string;
}

interface LearningBadge {
  id: number;
  name: string;
  description: string;
  icon: string;
  track?: string;
  earnedAt: string;
}

interface LearningLesson {
  id: number;
  track: string;
  lessonNumber: number;
  title: string;
  description: string;
  xpReward: number;
  estimatedMinutes: number;
  userProgress?: {
    status: string;
    completedAt: string | null;
  } | null;
}

interface DashboardData {
  stats: LearningStats;
  badges: LearningBadge[];
  availableLessons: LearningLesson[];
  completedLessons: LearningLesson[];
  canAccessSynastry: boolean;
}

export default function LearningPage() {
  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/learning/dashboard"]
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Unable to load learning data</h2>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  const { stats, badges, availableLessons, completedLessons = [], canAccessSynastry } = dashboardData;
  
  // Check if all lessons are completed (for congratulations message)
  const allLessonsCompleted = availableLessons.length === 0 && completedLessons.length > 0;

  // Helper function to get unified, progression-ordered lessons for a specific track
  const getUnifiedLessonsForTrack = (track: string) => {
    const available = availableLessons.filter(lesson => lesson.track === track);
    const completed = completedLessons.filter(lesson => lesson.track === track);
    
    // Merge and deduplicate lessons, then sort by progression order (lessonNumber)
    const allLessons = [...available, ...completed];
    const uniqueLessons = allLessons.filter((lesson, index, array) => 
      array.findIndex(l => l.id === lesson.id) === index
    );
    
    // Sort by lesson number for proper progression order
    return uniqueLessons.sort((a, b) => a.lessonNumber - b.lessonNumber);
  };

  // Helper component to render unified lessons for a track in progression order
  const renderTrackLessons = (track: string, trackName: string) => {
    const unifiedLessons = getUnifiedLessonsForTrack(track);
    
    if (unifiedLessons.length === 0) {
      return (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No {trackName} lessons yet</h3>
            <p className="text-gray-500">
              Complete previous learning tracks to unlock all {trackName} lessons and continue your astrological journey.
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {unifiedLessons.map((lesson) => {
          // Check if lesson is completed based on userProgress status
          const isCompleted = lesson.userProgress?.status === 'completed' || lesson.userProgress?.status === 'mastered';
          
          const isMastered = lesson.userProgress?.status === 'mastered';
          
          return (
            <Card 
              key={lesson.id} 
              className={`hover:shadow-lg transition-shadow cursor-pointer group ${
                isMastered 
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-300 dark:border-yellow-800' 
                  : isCompleted 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                  : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex gap-2 mb-2">
                    <Badge variant="secondary" className="capitalize">
                      {lesson.track}
                    </Badge>
                    {isMastered && (
                      <Badge className="bg-yellow-500 text-yellow-900 hover:bg-yellow-600">
                        ⭐ MASTERED
                      </Badge>
                    )}
                    {isCompleted && !isMastered && (
                      <Badge className="bg-green-500 text-green-900 hover:bg-green-600">
                        ✓ COMPLETED
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-3 h-3" />
                      {lesson.estimatedMinutes}min
                    </div>
                    {isCompleted && (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                </div>
                <CardTitle className={`text-lg transition-colors ${
                  isCompleted 
                    ? 'group-hover:text-green-600' 
                    : 'group-hover:text-purple-600'
                }`}>
                  {lesson.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {lesson.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    isCompleted ? 'text-green-600' : 'text-purple-600'
                  }`}>
                    <Star className="w-4 h-4" />
                    +{lesson.xpReward} XP
                  </div>
                  <div className="flex items-center gap-2">
                    {isCompleted && lesson.userProgress?.completedAt && (
                      <span className="text-xs text-gray-500">
                        {new Date(lesson.userProgress.completedAt).toLocaleDateString()}
                      </span>
                    )}
                    <Link href={`/learning/lesson/${lesson.id}`}>
                      {isCompleted ? (
                        <Button size="sm" variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      ) : (
                        <Button size="sm" className="group-hover:bg-purple-600" data-testid={`button-start-lesson-${lesson.id}`}>
                          Start
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      )}
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            🎓 Cosmic Academy Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Master the art of reading your own astrological chart through interactive lessons and earn cosmic rewards
          </p>
        </div>

        {/* Stats Cards - Optimized for Mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs md:text-sm font-medium">Total XP</p>
                  <p className="text-lg md:text-2xl font-bold">{stats.totalXp.toLocaleString()}</p>
                </div>
                <Star className="h-5 w-5 md:h-8 md:w-8 text-yellow-300" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-xs md:text-sm font-medium">Streak</p>
                  <p className="text-lg md:text-2xl font-bold">{stats.currentStreak} days</p>
                </div>
                <Flame className="h-5 w-5 md:h-8 md:w-8 text-yellow-300" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs md:text-sm font-medium">Completed</p>
                  <p className="text-lg md:text-2xl font-bold">{stats.completedLessons}</p>
                </div>
                <CheckCircle2 className="h-5 w-5 md:h-8 md:w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs md:text-sm font-medium">Study Time</p>
                  <p className="text-lg md:text-2xl font-bold">{Math.floor(stats.totalTimeSpent / 60)}h</p>
                </div>
                <Clock className="h-5 w-5 md:h-8 md:w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="progress" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 gap-1 h-auto p-1">
            <TabsTrigger value="progress" className="flex flex-col items-center gap-1 p-2 text-xs">
              <TrendingUp className="w-4 h-4" />
              <span>Progress</span>
            </TabsTrigger>
            <TabsTrigger value="badges" className="flex flex-col items-center gap-1 p-2 text-xs">
              <Award className="w-4 h-4" />
              <span>Badges</span>
            </TabsTrigger>
            <TabsTrigger value="basics" className="flex flex-col items-center gap-1 p-2 text-xs">
              <Star className="w-4 h-4" />
              <span>Basics</span>
            </TabsTrigger>
            <TabsTrigger value="planets" className="flex flex-col items-center gap-1 p-2 text-xs">
              <Target className="w-4 h-4" />
              <span>Planets</span>
            </TabsTrigger>
            <TabsTrigger value="houses" className="flex flex-col items-center gap-1 p-2 text-xs">
              <Home className="w-4 h-4" />
              <span>Houses</span>
            </TabsTrigger>
            <TabsTrigger value="nodes" className="flex flex-col items-center gap-1 p-2 text-xs">
              <GitBranch className="w-4 h-4" />
              <span>Nodes</span>
            </TabsTrigger>
            <TabsTrigger value="patterns" className="flex flex-col items-center gap-1 p-2 text-xs">
              <Shapes className="w-4 h-4" />
              <span>Patterns</span>
            </TabsTrigger>
            <TabsTrigger value="themes" className="flex flex-col items-center gap-1 p-2 text-xs">
              <Palette className="w-4 h-4" />
              <span>Themes</span>
            </TabsTrigger>
          </TabsList>

          {/* Track-Specific Tabs */}
          <TabsContent value="basics" className="space-y-6">
            {renderTrackLessons("basics", "Basics")}
            {canAccessSynastry && (
              <Card className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border-pink-200 dark:border-pink-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-pink-700 dark:text-pink-300">
                    <Trophy className="w-5 h-5" />
                    🎉 Congratulations! Synastry Module Unlocked
                  </CardTitle>
                  <CardDescription>
                    You've mastered the fundamentals! Now you can add a second birth chart to explore relationship compatibility.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/learning/synastry">
                    <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                      Explore Synastry
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="planets" className="space-y-6">
            {renderTrackLessons("planets", "Planets")}
          </TabsContent>

          <TabsContent value="houses" className="space-y-6">
            {renderTrackLessons("houses", "Houses")}
          </TabsContent>

          <TabsContent value="nodes" className="space-y-6">
            {renderTrackLessons("nodes", "Lunar Nodes")}
          </TabsContent>

          <TabsContent value="patterns" className="space-y-6">
            {renderTrackLessons("patterns", "Patterns & Shapes")}
          </TabsContent>

          <TabsContent value="themes" className="space-y-6">
            <div className="space-y-8">
              <DoodleThemeDemo userXP={stats.totalXp} />
              <div className="border-t pt-8">
                <VintageThemeDemo />
              </div>
            </div>
          </TabsContent>

          {/* Badges Tab - Optimized for Mobile */}
          <TabsContent value="badges" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {badges.map((badge) => (
                <Card key={badge.id} className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl md:text-3xl">{badge.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm md:text-base text-yellow-700 dark:text-yellow-300 truncate">
                          {badge.name}
                        </h4>
                        <p className="text-xs md:text-sm text-yellow-600 dark:text-yellow-400 line-clamp-2">
                          {badge.description}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                          <Calendar className="w-3 h-3" />
                          {new Date(badge.earnedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {badges.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No badges yet</h3>
                  <p className="text-gray-500">
                    Start learning lessons to earn your first badge!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Overall Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Learning Progress</CardTitle>
                  <CardDescription>Your journey through the astrology curriculum</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Lessons Completed</span>
                      <span>{stats.completedLessons}</span>
                    </div>
                    <Progress value={(stats.completedLessons / 12) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Lessons Mastered</span>
                      <span>{stats.masteredLessons}</span>
                    </div>
                    <Progress value={(stats.masteredLessons / 12) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Streak Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Streak Stats</CardTitle>
                  <CardDescription>Consistency is key to mastery</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Current Streak</span>
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="font-semibold">{stats.currentStreak} days</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Longest Streak</span>
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold">{stats.longestStreak} days</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Study Time</span>
                    <span className="font-semibold">{Math.floor(stats.totalTimeSpent / 60)}h {stats.totalTimeSpent % 60}m</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}