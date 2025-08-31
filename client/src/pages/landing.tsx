import { Button } from "@/components/ui/button";
import { Sparkles, Music, Star } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";

export default function Landing() {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  // Alternating text content as requested
  const textVariations = [
    {
      title: "AI-curated music to match your individual weekly planetary transits",
      subtitle: "Let our AI astrologer create a personalized 7-song weekly playlist based on your birth chart and current planetary movements."
    },
    {
      title: "AI-Powered Curation",
      subtitle: "Experience musical alchemy— Your celestial blueprint guides our Astro Agent in transmuting planetary patterns into sound. Each note resonates with the energy of your chart and the shifting skies."
    }
  ];

  // Feature descriptions with alternating content
  const featureDescriptions = [
    [
      {
        title: "AI-Powered Curation",
        content: "Experience musical alchemy— Your celestial blueprint guides our Astro Agent in transmuting planetary patterns into sound. Each note resonates with the energy of your chart and the shifting skies."
      },
      {
        title: "Astrological Insights",
        content: "Unlock personalized horoscopes crafted from real-time planetary movements and precise birth chart readings powered by Swiss Ephemeris and Immanuel."
      },
      {
        title: "Spotify Integration", 
        content: "Your stars, your soundtrack. Send your daily horoscope playlist straight to Spotify and carry the cosmos in your pocket."
      }
    ],
    [
      {
        title: "Musical Alchemy",
        content: "Our Astro Agent transmutes planetary patterns into sound. Each note resonates with the energy of your chart and the shifting skies. Get your horoscope as a soundscape!"
      },
      {
        title: "Astrological Insights",
        content: "Unlock personalized horoscopes crafted from real-time planetary movements and precise birth chart readings powered by Swiss Ephemeris and Immanuel."
      },
      {
        title: "Spotify Integration",
        content: "Your stars, your soundtrack. Send your daily horoscope playlist straight to Spotify and carry the cosmos in your pocket."
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
              Cosmic Playlist Generator
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
              Sign in to save and share your personalized playlists, detailed birth chart readings, and cosmic horoscopes. 
              Your astrological journey awaits with AI-curated music that matches your celestial energy.
            </p>
            <div className="space-y-4">
              <Link href="/login">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 w-full"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Sign In to Get Started
                </Button>
              </Link>
              <p className="text-sm text-gray-500">
                New to Cosmic Playlist?{" "}
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