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
  Shapes
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

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
  const [selectedTrack, setSelectedTrack] = useState<string>("all");
  
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

  const trackOptions = [
    { value: "all", label: "All Tracks", icon: BookOpen },
    { value: "basics", label: "Basics", icon: Star },
    { value: "planets", label: "Planets", icon: Target },
    { value: "houses", label: "Houses", icon: Award },
    { value: "nodes", label: "Nodes", icon: GitBranch },
    { value: "patterns", label: "Patterns & Shapes", icon: Shapes },
  ];

  const filteredLessons = selectedTrack === "all" 
    ? availableLessons 
    : availableLessons.filter(lesson => lesson.track === selectedTrack);

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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total XP</p>
                  <p className="text-2xl font-bold">{stats.totalXp.toLocaleString()}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-300" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Streak</p>
                  <p className="text-2xl font-bold">{stats.currentStreak} days</p>
                </div>
                <Flame className="h-8 w-8 text-yellow-300" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Completed</p>
                  <p className="text-2xl font-bold">{stats.completedLessons}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Study Time</p>
                  <p className="text-2xl font-bold">{Math.floor(stats.totalTimeSpent / 60)}h</p>
                </div>
                <Clock className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="lessons" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="lessons">Available Lessons</TabsTrigger>
            <TabsTrigger value="completed">Completed Lessons</TabsTrigger>
            <TabsTrigger value="badges">Badges & Achievements</TabsTrigger>
            <TabsTrigger value="progress">Progress Overview</TabsTrigger>
          </TabsList>

          {/* Lessons Tab */}
          <TabsContent value="lessons" className="space-y-6">
            {allLessonsCompleted ? (
              <Card className="text-center py-16 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-900/20 dark:via-indigo-900/20 dark:to-blue-900/20 border-2 border-dashed border-purple-200 dark:border-purple-800">
                <CardContent>
                  <div className="text-6xl mb-6">🎉</div>
                  <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Congratulations!
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
                    You've completed the Master Your Birth Chart Modules!
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    More cosmic learning adventures are coming soon.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                    <Star className="w-4 h-4" />
                    <span>{completedLessons.length} lessons mastered</span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Track Filter */}
                <div className="flex flex-wrap gap-2">
                  {trackOptions.map((track) => {
                    const Icon = track.icon;
                    return (
                      <Button
                        key={track.value}
                        variant={selectedTrack === track.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTrack(track.value)}
                        className="flex items-center gap-2"
                      >
                        <Icon className="w-4 h-4" />
                        {track.label}
                      </Button>
                    );
                  })}
                </div>

                {/* Available Lessons */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLessons.map((lesson) => (
                <Card key={lesson.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Badge variant="secondary" className="mb-2 capitalize">
                        {lesson.track}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-3 h-3" />
                        {lesson.estimatedMinutes}min
                      </div>
                    </div>
                    <CardTitle className="text-lg group-hover:text-purple-600 transition-colors">
                      {lesson.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {lesson.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm font-medium text-purple-600">
                        <Star className="w-4 h-4" />
                        +{lesson.xpReward} XP
                      </div>
                      {lesson.userProgress?.status === 'completed' || lesson.userProgress?.status === 'mastered' ? (
                        <Link href={`/learning/lesson/${lesson.id}`}>
                          <Button size="sm" variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/learning/lesson/${lesson.id}`}>
                          <Button size="sm" className="group-hover:bg-purple-600" data-testid={`button-start-lesson-${lesson.id}`}>
                            Start
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
                </div>

                {filteredLessons.length === 0 && (
                  <Card className="text-center py-12">
                    <CardContent>
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No lessons available</h3>
                      <p className="text-gray-500">
                        Complete prerequisite lessons to unlock more content in this track.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Synastry Unlock Card */}
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
              </>
            )}
          </TabsContent>

          {/* Completed Lessons Tab */}
          <TabsContent value="completed" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedLessons.map((lesson) => (
                <Card key={lesson.id} className="hover:shadow-lg transition-shadow cursor-pointer group bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Badge variant="secondary" className="mb-2 capitalize bg-green-100 text-green-700">
                        {lesson.track}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="w-3 h-3" />
                          {lesson.estimatedMinutes}min
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                    <CardTitle className="text-lg group-hover:text-green-600 transition-colors">
                      {lesson.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {lesson.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                        <Star className="w-4 h-4" />
                        +{lesson.xpReward} XP
                      </div>
                      <div className="flex items-center gap-2">
                        {lesson.userProgress?.completedAt && (
                          <span className="text-xs text-gray-500">
                            {new Date(lesson.userProgress.completedAt).toLocaleDateString()}
                          </span>
                        )}
                        <Link href={`/learning/lesson/${lesson.id}`}>
                          <Button size="sm" variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {completedLessons.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <CheckCircle2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No completed lessons yet</h3>
                  <p className="text-gray-500">
                    Complete your first lesson to see it here for easy review access.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map((badge) => (
                <Card key={badge.id} className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800">
                  <CardHeader className="text-center">
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    <CardTitle className="text-lg text-yellow-700 dark:text-yellow-300">
                      {badge.name}
                    </CardTitle>
                    <CardDescription className="text-yellow-600 dark:text-yellow-400">
                      {badge.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                      <Calendar className="w-4 h-4" />
                      Earned {new Date(badge.earnedAt).toLocaleDateString()}
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