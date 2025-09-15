import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Home, Eye, MessageCircle, Heart, Star, Briefcase, Users, Skull, GraduationCap, Mountain, TreePine, Sparkles } from 'lucide-react';

// Helper function to get proper ordinal numbers
function getOrdinal(num: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const value = num % 100;
  return num + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
}

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
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mt-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">🏠 Astrological Houses</h3>
          <p className="text-sm text-gray-600">
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
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 text-white font-semibold text-sm"
            >
              {isGenerating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span className="font-semibold">Calculating...</span>
                </div>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-1" />
                  <span className="font-semibold">Get My Houses</span>
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={resetToGeneral}
              variant="outline" 
              size="sm"
              className="bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700 font-semibold text-sm"
            >
              <span className="font-semibold">Show General</span>
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
              className="bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors group shadow-sm"
            >
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">{getOrdinal(house.number)} House</h4>
                  <p className="text-xs text-gray-600">{house.name}</p>
                </div>
              </div>

              {showPersonalized && (
                <div className="mb-3 p-2 bg-purple-50 rounded-lg border border-purple-200">
                  {house.sign && house.sign !== 'Calculating...' ? (
                    <p className="text-xs text-purple-700 font-medium">
                      🌟 {house.sign} on the cusp
                    </p>
                  ) : (
                    <p className="text-xs text-purple-700 font-medium">
                      ⏳ Calculating sign placement...
                    </p>
                  )}
                  {house.planets && house.planets.length > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      Planets: {house.planets.join(', ')}
                    </p>
                  )}
                  {showPersonalized && house.planets && house.planets.length === 0 && house.sign && house.sign !== 'Calculating...' && (
                    <p className="text-xs text-gray-600 mt-1">
                      No planets in this house
                    </p>
                  )}
                </div>
              )}

              <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                {house.description}
              </p>
              
              <div className="flex flex-wrap gap-1">
                {house.keywords.slice(0, 2).map((keyword, idx) => (
                  <span 
                    key={idx}
                    className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full"
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
        <div className="mt-6 text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
          <Sparkles className="w-6 h-6 mx-auto mb-2 text-purple-600" />
          <p className="text-sm text-purple-700 mb-3">
            Generate your personalized house placements to see which zodiac signs rule your life areas
          </p>
        </div>
      )}

      {!birthDate && (
        <div className="mt-6 text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
          <Home className="w-6 h-6 mx-auto mb-2 text-gray-500" />
          <p className="text-sm text-gray-600">
            Complete your birth information in your profile to get personalized house placements
          </p>
        </div>
      )}
    </div>
  );
}