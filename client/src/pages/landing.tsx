import { Button } from "@/components/ui/button";
import { Sparkles, Music, Star } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";

export default function Landing() {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  // Alternating text content focusing on astrological mastery
  const textVariations = [
    {
      title: "Master your astrological blueprint with AI-powered guidance",
      subtitle: "Discover the depths of your birth chart through personalized conversations with our AI astrologer. Learn how planetary transits shape your daily life and cosmic journey."
    },
    {
      title: "Your personal astrological mentor awaits",
      subtitle: "Engage in meaningful conversations about your chart placements, planetary influences, and cosmic patterns. Unlock the wisdom of the stars through guided AI discussions."
    }
  ];

  // Feature descriptions focusing on astrological mastery
  const featureDescriptions = [
    [
      {
        title: "Interactive AI Astrological Guidance",
        content: "Engage in deep conversations with our AI astrologer about your birth chart, planetary placements, and cosmic influences. Learn through personalized discussions tailored to your unique astrological profile."
      },
      {
        title: "Comprehensive Chart Analysis",
        content: "Unlock detailed birth chart readings, transit analysis, and precise interpretations powered by Swiss Ephemeris. Master the language of the stars through professional-level insights."
      },
      {
        title: "Cosmic Soundtrack & Mood Tracking", 
        content: "Express your astrological journey through personalized music and daily mood tracking. Discover how planetary movements influence your emotional patterns and energy levels."
      }
    ],
    [
      {
        title: "Personalized Astrological Learning",
        content: "Transform your relationship with astrology through AI-guided conversations. Ask questions, explore meanings, and deepen your understanding of your cosmic blueprint."
      },
      {
        title: "Professional Chart Interpretations",
        content: "Access detailed birth chart analysis, aspect patterns, and transit forecasts. Our AI provides university-level astrological education through interactive discussions."
      },
      {
        title: "Journey Documentation",
        content: "Track your astrological insights, mood patterns, and cosmic synchronicities. Build a comprehensive record of your spiritual and astrological growth over time."
      }
    ]
  ];

  // Rotate text every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % textVariations.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const currentText = textVariations[currentTextIndex];
  const currentFeatures = featureDescriptions[currentTextIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
                <Music className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Cosmic Vibes
            </h1>
            <div className="transition-all duration-1000 ease-in-out">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                <strong>{currentText.title}</strong>
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                {currentText.subtitle}
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="p-6 bg-white rounded-lg shadow-sm transition-all duration-1000 ease-in-out">
              <Sparkles className="h-8 w-8 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                <strong>{currentFeatures[0].title}</strong>
              </h3>
              <p className="text-gray-600">
                {currentFeatures[0].content}
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm transition-all duration-1000 ease-in-out">
              <Star className="h-8 w-8 text-purple-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                <strong>{currentFeatures[1].title}</strong>
              </h3>
              <p className="text-gray-600">
                {currentFeatures[1].content}
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm transition-all duration-1000 ease-in-out">
              <Music className="h-8 w-8 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                <strong>{currentFeatures[2].title}</strong>
              </h3>
              <p className="text-gray-600">
                {currentFeatures[2].content}
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome, Celestial Traveler
            </h2>
            <p className="text-gray-600 mb-6">
              Embark on a journey of astrological self-discovery through AI-guided conversations. 
              Master your birth chart, understand planetary influences, and unlock the wisdom of your cosmic blueprint.
            </p>
            <div className="space-y-4">
              <Link href="/chat">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 w-full"
                  data-testid="button-try-free"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Try Free as Guest
                </Button>
              </Link>
              <p className="text-sm text-gray-500 text-center">
                No login required • Try 3 for free! • Free Spotify export
              </p>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>
              
              <Link href="/login">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full border-2"
                  data-testid="button-sign-in"
                >
                  Sign In for Full Access
                </Button>
              </Link>
              <p className="text-sm text-gray-500">
                New to Cosmic Vibes?{" "}
                <Link href="/signup" className="text-blue-600 hover:text-blue-500 font-medium">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}