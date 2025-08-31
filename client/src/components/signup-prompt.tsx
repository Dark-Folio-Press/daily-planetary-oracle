import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Heart, BookOpen, Music } from "lucide-react";
import { Link } from "wouter";

interface SignupPromptProps {
  feature: 'chart' | 'playlist' | 'general';
  className?: string;
}

export function SignupPrompt({ feature, className = "" }: SignupPromptProps) {
  const prompts = {
    chart: {
      icon: BookOpen,
      title: "Save Your Chart Reading Forever",
      description: "Create an account to permanently save your detailed birth chart analysis, cosmic insights, and personalized astrological interpretations.",
      benefits: ["Keep all your chart readings", "Access your cosmic profile anytime", "Download PDFs of your charts"]
    },
    playlist: {
      icon: Music,
      title: "Save Your Cosmic Playlists",
      description: "Sign up to save your AI-curated playlists, export to Spotify, and track your weekly cosmic music journey.",
      benefits: ["Save unlimited playlists", "Export directly to Spotify", "Track your cosmic music evolution"]
    },
    general: {
      icon: Heart,
      title: "Save Your Cosmic Journey",
      description: "Create an account to save your chats, charts, playlists, and continue your astrological exploration.",
      benefits: ["Save all conversations", "Keep your birth chart data", "Access premium cosmic features"]
    }
  };

  const prompt = prompts[feature];
  const IconComponent = prompt.icon;

  return (
    <Card className={`bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 ${className}`}>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
              <IconComponent className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {prompt.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {prompt.description}
            </p>
          </div>

          <div className="space-y-2 text-sm text-gray-700">
            {prompt.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-500 mr-2 flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link href="/signup" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <Sparkles className="w-4 h-4 mr-2" />
                Create Account
              </Button>
            </Link>
            <Link href="/login" className="flex-1">
              <Button variant="outline" className="w-full border-purple-200 hover:bg-purple-50">
                Sign In
              </Button>
            </Link>
          </div>

          <p className="text-xs text-gray-500 pt-2">
            Or try our demo with: <strong>test@example.com</strong> / <strong>testpass</strong>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}