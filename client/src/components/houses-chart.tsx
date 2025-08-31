import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Home, Eye, MessageCircle, Heart, Star, Briefcase, Users, Skull, GraduationCap, Mountain, TreePine, Sparkles } from 'lucide-react';

interface HousesChartProps {
  birthDate?: string;
  birthTime?: string;
  birthLocation?: string;
  userName?: string;
}

interface HouseData {
  number: number;
  name: string;
  description: string;
  icon: any;
  keywords: string[];
  sign?: string;
  planets?: string[];
}

const houseDefinitions: Omit<HouseData, 'sign' | 'planets'>[] = [
  {
    number: 1,
    name: "House of Self",
    description: "Your identity, appearance, and first impressions",
    icon: Eye,
    keywords: ["Identity", "Appearance", "First Impressions", "Self-Image"]
  },
  {
    number: 2,
    name: "House of Values",
    description: "Money, possessions, self-worth, and material security",
    icon: Star,
    keywords: ["Money", "Possessions", "Self-Worth", "Material Security"]
  },
  {
    number: 3,
    name: "House of Communication",
    description: "Communication, siblings, short trips, daily life",
    icon: MessageCircle,
    keywords: ["Communication", "Siblings", "Short Trips", "Learning"]
  },
  {
    number: 4,
    name: "House of Home",
    description: "Home, family, roots, and emotional foundation",
    icon: Home,
    keywords: ["Home", "Family", "Roots", "Private Life"]
  },
  {
    number: 5,
    name: "House of Creativity",
    description: "Romance, creativity, children, and self-expression",
    icon: Heart,
    keywords: ["Romance", "Creativity", "Children", "Fun"]
  },
  {
    number: 6,
    name: "House of Service",
    description: "Work, health, daily routines, and service to others",
    icon: Briefcase,
    keywords: ["Work", "Health", "Daily Routines", "Service"]
  },
  {
    number: 7,
    name: "House of Partnerships",
    description: "Marriage, partnerships, open enemies, contracts",
    icon: Users,
    keywords: ["Marriage", "Partnerships", "Contracts", "Others"]
  },
  {
    number: 8,
    name: "House of Transformation",
    description: "Shared resources, transformation, death, and rebirth",
    icon: Skull,
    keywords: ["Transformation", "Shared Resources", "Mysteries", "Rebirth"]
  },
  {
    number: 9,
    name: "House of Philosophy",
    description: "Higher education, philosophy, long journeys, spirituality",
    icon: GraduationCap,
    keywords: ["Philosophy", "Higher Learning", "Travel", "Spirituality"]
  },
  {
    number: 10,
    name: "House of Career",
    description: "Career, reputation, public image, and life direction",
    icon: Mountain,
    keywords: ["Career", "Reputation", "Public Image", "Authority"]
  },
  {
    number: 11,
    name: "House of Friendships",
    description: "Friends, groups, hopes, dreams, and social networks",
    icon: TreePine,
    keywords: ["Friends", "Groups", "Hopes", "Dreams"]
  },
  {
    number: 12,
    name: "House of Subconscious",
    description: "Subconscious, hidden enemies, spirituality, karma",
    icon: Sparkles,
    keywords: ["Subconscious", "Spirituality", "Hidden Things", "Karma"]
  }
];

export function HousesChart({ birthDate, birthTime, birthLocation, userName }: HousesChartProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [houseData, setHouseData] = useState<HouseData[]>([]);
  const [showPersonalized, setShowPersonalized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize with basic house definitions
    setHouseData(houseDefinitions.map(house => ({ ...house })));
  }, []);

  const generatePersonalizedHouses = async () => {
    if (!birthDate || !birthTime || !birthLocation) {
      toast({
        title: "Missing Birth Information",
        description: "Please provide your complete birth date, time, and location for personalized house analysis.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/chart/houses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          birthDate,
          birthTime,
          birthLocation,
        }),
      });

      const data = await response.json();

      if (data.success && data.houses) {
        console.log('Received houses data:', data.houses); // Debug log
        
        // Merge personalized data with house definitions
        const personalizedHouses = houseDefinitions.map(house => {
          const houseInfo = data.houses[`house_${house.number}`];
          return {
            ...house,
            sign: houseInfo?.sign || 'Calculating...',
            planets: houseInfo?.planets || []
          };
        });
        
        console.log('Personalized houses:', personalizedHouses); // Debug log
        setHouseData(personalizedHouses);
        setShowPersonalized(true);
        toast({
          title: "Houses Analysis Complete",
          description: "Your personalized house placements have been calculated.",
        });
      } else {
        throw new Error(data.error || 'Failed to generate house analysis');
      }
    } catch (error) {
      console.error('House analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to generate personalized house analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const resetToGeneral = () => {
    setHouseData(houseDefinitions.map(house => ({ ...house })));
    setShowPersonalized(false);
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mt-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">🏠 Astrological Houses</h3>
          <p className="text-sm text-muted-foreground">
            {showPersonalized ? 'Your personalized house placements' : 'The twelve life areas in astrology'}
          </p>
        </div>
        <div className="flex gap-2">
          {!showPersonalized ? (
            <Button
              onClick={generatePersonalizedHouses}
              disabled={isGenerating || !birthDate || !birthTime || !birthLocation}
              variant="outline"
              size="sm"
              className="bg-purple-600/20 hover:bg-purple-500/30 border-purple-500/30"
            >
              {isGenerating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400 mr-2"></div>
                  Calculating...
                </div>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-1" />
                  Get My Houses
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={resetToGeneral}
              variant="outline" 
              size="sm"
              className="bg-gray-600/20 hover:bg-gray-500/30 border-gray-500/30"
            >
              Show General
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {houseData.map((house) => {
          const IconComponent = house.icon;
          
          return (
            <div 
              key={house.number}
              className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground">{house.number}th House</h4>
                  <p className="text-xs text-purple-300">{house.name}</p>
                </div>
              </div>

              {showPersonalized && (
                <div className="mb-3 p-2 bg-purple-600/10 rounded-lg border border-purple-500/20">
                  {house.sign && house.sign !== 'Calculating...' ? (
                    <p className="text-xs text-purple-200 font-medium">
                      🌟 {house.sign} on the cusp
                    </p>
                  ) : (
                    <p className="text-xs text-purple-200 font-medium">
                      ⏳ Calculating sign placement...
                    </p>
                  )}
                  {house.planets && house.planets.length > 0 && (
                    <p className="text-xs text-purple-300 mt-1">
                      Planets: {house.planets.join(', ')}
                    </p>
                  )}
                  {showPersonalized && house.planets && house.planets.length === 0 && house.sign && house.sign !== 'Calculating...' && (
                    <p className="text-xs text-purple-300 mt-1">
                      No planets in this house
                    </p>
                  )}
                </div>
              )}

              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                {house.description}
              </p>
              
              <div className="flex flex-wrap gap-1">
                {house.keywords.slice(0, 2).map((keyword, idx) => (
                  <span 
                    key={idx}
                    className="text-xs px-2 py-1 bg-purple-600/20 text-purple-200 rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {!showPersonalized && (birthDate && birthTime && birthLocation) && (
        <div className="mt-6 text-center p-4 bg-purple-600/10 rounded-xl border border-purple-500/20">
          <Sparkles className="w-6 h-6 mx-auto mb-2 text-purple-400" />
          <p className="text-sm text-purple-200 mb-3">
            Generate your personalized house placements to see which zodiac signs rule your life areas
          </p>
        </div>
      )}

      {!birthDate && (
        <div className="mt-6 text-center p-4 bg-gray-600/10 rounded-xl border border-gray-500/20">
          <Home className="w-6 h-6 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-300">
            Complete your birth information in your profile to get personalized house placements
          </p>
        </div>
      )}
    </div>
  );
}