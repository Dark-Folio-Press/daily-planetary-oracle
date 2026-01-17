import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Star, Sun, Sparkles } from "lucide-react";

interface DailyHoroscopesResponse {
  success: boolean;
  date: string;
  horoscopes: Array<{
    sign: string;
    horoscope: string;
    luckyNumber: number;
    luckyColor: string;
    moodSummary: string;
    compatibility: string;
  }>;
}

interface PersonalizedResponse {
  success: boolean;
  date: string;
  zodiacSign: string;
  generalHoroscope: string;
  personalizedHoroscope: string;
  cosmicAdvice: string;
  warningFromTheVoid: string;
  luckyOmen: string;
  luckyNumber: number;
  luckyColor: string;
  moodSummary: string;
  compatibility: string;
}

const ZODIAC_SIGNS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
];

const ZODIAC_ICONS: Record<string, string> = {
  aries: "♈", taurus: "♉", gemini: "♊", cancer: "♋",
  leo: "♌", virgo: "♍", libra: "♎", scorpio: "♏",
  sagittarius: "♐", capricorn: "♑", aquarius: "♒", pisces: "♓"
};

export default function WixTestPage() {
  const [selectedSign, setSelectedSign] = useState<string>("aries");
  const [birthDate, setBirthDate] = useState("1990-07-25");
  const [birthTime, setBirthTime] = useState("14:30");
  const [birthLocation, setBirthLocation] = useState("Los Angeles, CA");

  const { data: dailyHoroscopes, isLoading: dailyLoading } = useQuery<DailyHoroscopesResponse>({
    queryKey: ["/api/wix/horoscope/daily"],
    queryFn: async () => {
      const res = await fetch("/api/wix/horoscope/daily");
      return res.json();
    },
  });

  const { data: signHoroscope, isLoading: signLoading, refetch: refetchSign } = useQuery({
    queryKey: ["/api/wix/horoscope/sign", selectedSign],
    queryFn: async () => {
      const res = await fetch(`/api/wix/horoscope/sign/${selectedSign}`);
      return res.json();
    },
    enabled: !!selectedSign,
  });

  const personalizedMutation = useMutation<PersonalizedResponse>({
    mutationFn: async () => {
      const res = await fetch("/api/wix/horoscope/personalized", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthDate, birthTime, birthLocation }),
      });
      return res.json();
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-2">
            Wix Horoscope API Test
          </h1>
          <p className="text-gray-400">Test the dark sardonic horoscope endpoints</p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
            <TabsTrigger value="all">All 12 Signs</TabsTrigger>
            <TabsTrigger value="single">Single Sign</TabsTrigger>
            <TabsTrigger value="personalized">Personalized</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <Card className="bg-gray-800/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-yellow-400" />
                  Daily Horoscopes for All 12 Signs
                </CardTitle>
                <CardDescription>
                  GET /api/wix/horoscope/daily
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dailyLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                  </div>
                ) : dailyHoroscopes?.horoscopes ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dailyHoroscopes.horoscopes.map((h: any) => (
                      <Card key={h.sign} className="bg-gray-900/50 border-gray-700">
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <span className="text-2xl">{ZODIAC_ICONS[h.sign]}</span>
                            <span className="capitalize">{h.sign}</span>
                          </CardTitle>
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              Lucky #{h.luckyNumber}
                            </Badge>
                            <Badge variant="outline" className="text-xs" style={{ borderColor: h.luckyColor }}>
                              {h.luckyColor}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-300 leading-relaxed">{h.horoscope}</p>
                          <p className="text-xs text-purple-400 mt-2 italic">{h.moodSummary}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No horoscopes available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="single" className="mt-6">
            <Card className="bg-gray-800/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Single Sign Horoscope
                </CardTitle>
                <CardDescription>
                  GET /api/wix/horoscope/sign/:sign
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label>Select Zodiac Sign</Label>
                    <Select value={selectedSign} onValueChange={setSelectedSign}>
                      <SelectTrigger className="bg-gray-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ZODIAC_SIGNS.map(sign => (
                          <SelectItem key={sign} value={sign}>
                            {ZODIAC_ICONS[sign]} {sign.charAt(0).toUpperCase() + sign.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={() => refetchSign()} disabled={signLoading}>
                    {signLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Fetch"}
                  </Button>
                </div>

                {signHoroscope && (
                  <Card className="bg-gray-900/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-3xl">{ZODIAC_ICONS[signHoroscope.sign]}</span>
                        <span className="capitalize">{signHoroscope.sign}</span>
                      </CardTitle>
                      <div className="flex gap-2 flex-wrap">
                        <Badge>Lucky #{signHoroscope.luckyNumber}</Badge>
                        <Badge variant="secondary">{signHoroscope.luckyColor}</Badge>
                        <Badge variant="outline">{signHoroscope.moodSummary}</Badge>
                        <Badge variant="outline">Best Match: {signHoroscope.compatibility}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 leading-relaxed">{signHoroscope.horoscope}</p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personalized" className="mt-6">
            <Card className="bg-gray-800/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Personalized Horoscope
                </CardTitle>
                <CardDescription>
                  POST /api/wix/horoscope/personalized
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Birth Date</Label>
                    <Input 
                      type="date" 
                      value={birthDate} 
                      onChange={e => setBirthDate(e.target.value)}
                      className="bg-gray-900"
                    />
                  </div>
                  <div>
                    <Label>Birth Time</Label>
                    <Input 
                      type="time" 
                      value={birthTime} 
                      onChange={e => setBirthTime(e.target.value)}
                      className="bg-gray-900"
                    />
                  </div>
                  <div>
                    <Label>Birth Location</Label>
                    <Input 
                      value={birthLocation} 
                      onChange={e => setBirthLocation(e.target.value)}
                      className="bg-gray-900"
                      placeholder="City, Country"
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => personalizedMutation.mutate()} 
                  disabled={personalizedMutation.isPending}
                  className="w-full"
                >
                  {personalizedMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Generating Personalized Reading...
                    </>
                  ) : (
                    "Get Personalized Horoscope"
                  )}
                </Button>

                {personalizedMutation.data && (
                  <Card className="bg-gray-900/50 border-purple-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-3xl">{ZODIAC_ICONS[personalizedMutation.data.zodiacSign]}</span>
                        <span className="capitalize">{personalizedMutation.data.zodiacSign}</span>
                        <Badge className="ml-auto">Personalized</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-purple-400 mb-2">Your Personal Reading</h4>
                        <p className="text-gray-300 leading-relaxed">
                          {personalizedMutation.data.personalizedHoroscope}
                        </p>
                      </div>
                      
                      {personalizedMutation.data.cosmicAdvice && (
                        <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
                          <h4 className="font-semibold text-purple-400 mb-1">Cosmic Advice</h4>
                          <p className="text-sm text-gray-300">{personalizedMutation.data.cosmicAdvice}</p>
                        </div>
                      )}
                      
                      {personalizedMutation.data.warningFromTheVoid && (
                        <div className="p-4 bg-red-900/20 rounded-lg border border-red-500/30">
                          <h4 className="font-semibold text-red-400 mb-1">Warning from the Void</h4>
                          <p className="text-sm text-gray-300">{personalizedMutation.data.warningFromTheVoid}</p>
                        </div>
                      )}
                      
                      {personalizedMutation.data.luckyOmen && (
                        <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/30">
                          <h4 className="font-semibold text-green-400 mb-1">Lucky Omen</h4>
                          <p className="text-sm text-gray-300">{personalizedMutation.data.luckyOmen}</p>
                        </div>
                      )}

                      <div className="flex gap-2 flex-wrap pt-2">
                        <Badge>Lucky #{personalizedMutation.data.luckyNumber}</Badge>
                        <Badge variant="secondary">{personalizedMutation.data.luckyColor}</Badge>
                        <Badge variant="outline">{personalizedMutation.data.moodSummary}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-8 bg-gray-800/50 border-blue-500/30">
          <CardHeader>
            <CardTitle>API Documentation</CardTitle>
            <CardDescription>Use these endpoints in your Wix site</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 font-mono text-sm">
              <div className="p-3 bg-gray-900 rounded">
                <span className="text-green-400">GET</span> /api/wix/horoscope/daily
                <p className="text-gray-400 text-xs mt-1">Returns all 12 zodiac horoscopes for today</p>
              </div>
              <div className="p-3 bg-gray-900 rounded">
                <span className="text-green-400">GET</span> /api/wix/horoscope/sign/:sign
                <p className="text-gray-400 text-xs mt-1">Returns horoscope for a specific zodiac sign</p>
              </div>
              <div className="p-3 bg-gray-900 rounded">
                <span className="text-yellow-400">POST</span> /api/wix/horoscope/personalized
                <p className="text-gray-400 text-xs mt-1">Body: {"{ birthDate, birthTime?, birthLocation? }"}</p>
              </div>
              <div className="p-3 bg-gray-900 rounded">
                <span className="text-yellow-400">POST</span> /api/wix/horoscope/stripe/create-checkout
                <p className="text-gray-400 text-xs mt-1">Create $2/month subscription for push notifications</p>
              </div>
              <div className="p-3 bg-gray-900 rounded">
                <span className="text-yellow-400">POST</span> /api/wix/horoscope/push/subscribe
                <p className="text-gray-400 text-xs mt-1">Subscribe to push notifications</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
