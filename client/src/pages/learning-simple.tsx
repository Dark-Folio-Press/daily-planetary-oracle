import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export default function LearningSimple() {
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
              <Button className="bg-purple-600 hover:bg-purple-700">
                Start Your First Lesson
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basics Track</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Learn about your Sun, Moon, and Rising signs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Planetary Track</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Discover how each planet influences your personality
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Houses Track</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Understand the 12 houses and their meanings
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}