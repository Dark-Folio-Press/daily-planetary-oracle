import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight, Star, Target, Award } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface DashboardData {
  stats: any;
  badges: any[];
  availableLessons: any[];
  recentProgress: any[];
  canAccessSynastry: boolean;
}

export default function LearningSimple() {
  const { data: dashboardData } = useQuery<DashboardData>({
    queryKey: ['/api/learning/dashboard']
  });

  // Check if planetary track is unlocked (user has access to planets lessons)
  const hasAccessToPlanetary = dashboardData?.availableLessons?.some(lesson => 
    lesson.track === 'planets'
  ) || false;

  // Check if houses track is unlocked
  const hasAccessToHouses = dashboardData?.availableLessons?.some(lesson => 
    lesson.track === 'houses'
  ) || false;

  // Find the first available planetary lesson ID
  const firstPlanetaryLesson = dashboardData?.availableLessons?.find(lesson => 
    lesson.track === 'planets'
  );
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <GraduationCap className="w-16 h-16 mx-auto mb-4 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Learn Astrology
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Master your birth chart through personalized, gamified lessons
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Welcome to Astrological Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your personalized learning journey will teach you to interpret your birth chart
                using your actual astrological data. Complete lessons to earn XP and unlock advanced features!
              </p>
              <Link href="/learning/lesson/1">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Start Your First Lesson
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-purple-600" />
                  Basics Track
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Learn about your Sun, Moon, and Rising signs
                </p>
                <Link href="/learning/lesson/1">
                  <Button variant="outline" size="sm" className="w-full">
                    Start Basics
                    <ArrowRight className="w-3 h-3 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className={`hover:shadow-lg transition-shadow cursor-pointer border-blue-200 dark:border-blue-800 ${!hasAccessToPlanetary ? 'opacity-75' : ''}`}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Planetary Track
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Discover how each planet influences your personality
                </p>
                {hasAccessToPlanetary ? (
                  <Link href={`/learning/lesson/${firstPlanetaryLesson?.id || 5}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      Start Planetary
                      <ArrowRight className="w-3 h-3 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    Complete Basics First
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className={`hover:shadow-lg transition-shadow cursor-pointer border-orange-200 dark:border-orange-800 ${!hasAccessToHouses ? 'opacity-75' : ''}`}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="w-5 h-5 text-orange-600" />
                  Houses Track
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Understand the 12 houses and their meanings
                </p>
                {hasAccessToHouses ? (
                  <Link href="/learning/lesson/7">
                    <Button variant="outline" size="sm" className="w-full">
                      Start Houses
                      <ArrowRight className="w-3 h-3 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    Complete Previous Tracks
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}