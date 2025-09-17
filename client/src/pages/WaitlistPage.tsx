import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Users, Calendar, Share2, Copy, Heart, Star, Music, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface WaitlistStats {
  totalSignups: number;
  totalInvited: number;
  totalAccepted: number;
  spotsRemaining: number;
}

interface WaitlistEntry {
  position: number;
  referralCode: string;
  referralCount: number;
  socialShares: number;
  positionBoost: number;
  effectivePosition: number;
}

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [joinedWaitlist, setJoinedWaitlist] = useState<WaitlistEntry | null>(null);
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [userEmail, setUserEmail] = useState(''); // Store user's email for sharing
  const { toast } = useToast();

  // Get waitlist stats
  const { data: stats } = useQuery<WaitlistStats>({
    queryKey: ['/api/waitlist/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Join waitlist mutation
  const joinMutation = useMutation({
    mutationFn: async ({ email, referralCode }: { email: string; referralCode?: string }) => {
      return apiRequest('POST', '/api/waitlist/signup', { email, referralCode });
    },
    onSuccess: (data: any) => {
      setUserEmail(email); // Store user's email for sharing
      const position = Number(data.position) || 1; // Ensure it's a number
      setJoinedWaitlist({
        position: position,
        referralCode: data.referralCode,
        referralCount: 0,
        socialShares: 0,
        positionBoost: 0,
        effectivePosition: position,
      });
      toast({
        title: 'Welcome to the Cosmic Journey!',
        description: `You're #${data.position} on the waitlist. Share with friends to boost your position!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Join',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Social share mutation
  const shareMutation = useMutation({
    mutationFn: async (userEmail: string) => {
      return apiRequest('POST', '/api/waitlist/share', { email: userEmail });
    },
    onSuccess: () => {
      toast({
        title: 'Share Recorded!',
        description: 'Your position has been boosted. Keep sharing to move up faster!',
      });
      // Update the joinedWaitlist state with new position
      if (joinedWaitlist) {
        setJoinedWaitlist({
          ...joinedWaitlist,
          socialShares: joinedWaitlist.socialShares + 1,
          positionBoost: joinedWaitlist.positionBoost + 5,
          effectivePosition: Math.max(1, joinedWaitlist.position - (joinedWaitlist.positionBoost + 5))
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Share Failed',
        description: error.message || 'Failed to record your share. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleJoin = () => {
    if (!email) return;
    joinMutation.mutate({ email, referralCode: referralCode || undefined });
  };

  const copyReferralLink = () => {
    if (joinedWaitlist) {
      const referralUrl = `${window.location.origin}?ref=${joinedWaitlist.referralCode}`;
      navigator.clipboard.writeText(referralUrl);
      toast({
        title: 'Link Copied!',
        description: 'Share this link to help friends skip the line.',
      });
    }
  };

  const shareOnSocial = (platform: 'twitter' | 'facebook') => {
    if (!joinedWaitlist) return;

    const referralUrl = `${window.location.origin}?ref=${joinedWaitlist.referralCode}`;
    const text = `🌟 I just joined the waitlist for Cosmic Music Curator - AI-powered playlists based on astrology! Join me and skip the line: ${referralUrl}`;

    let shareUrl = '';
    if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    } else if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}&quote=${encodeURIComponent(text)}`;
    }

    window.open(shareUrl, '_blank');
    shareMutation.mutate(userEmail);
  };

  // Check for referral code in URL
  useState(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      setShowReferralInput(true);
    }
  });

  if (joinedWaitlist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">You're In!</h1>
            <p className="text-purple-200 text-lg">Welcome to the cosmic waitlist</p>
          </motion.div>

          <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-white mb-2">
                  #{joinedWaitlist.effectivePosition}
                </div>
                <p className="text-purple-200">Your position in line</p>
                {joinedWaitlist.positionBoost > 0 && (
                  <Badge className="mt-2 bg-green-500/20 text-green-300">
                    +{joinedWaitlist.positionBoost} boost from sharing!
                  </Badge>
                )}
              </div>

              <Separator className="my-6 bg-white/20" />

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white mb-4">
                  🚀 Skip the Line - Share with Friends!
                </h3>
                
                <div className="flex gap-2 p-3 bg-white/5 rounded-lg">
                  <Input 
                    value={`${window.location.origin}?ref=${joinedWaitlist.referralCode}`}
                    readOnly 
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <Button 
                    onClick={copyReferralLink}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => shareOnSocial('twitter')}
                    className="flex-1 bg-blue-500 hover:bg-blue-600"
                    data-testid="button-twitter-share"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share on Twitter
                  </Button>
                  <Button 
                    onClick={() => shareOnSocial('facebook')}
                    className="flex-1 bg-blue-700 hover:bg-blue-800"
                    data-testid="button-facebook-share"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share on Facebook
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 p-4 bg-white/5 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {joinedWaitlist.referralCount}
                    </div>
                    <div className="text-sm text-purple-200">Friends Referred</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {joinedWaitlist.socialShares}
                    </div>
                    <div className="text-sm text-purple-200">Social Shares</div>
                  </div>
                </div>

                <p className="text-sm text-purple-200 text-center mt-4">
                  💡 Get 10 positions ahead for each friend who joins + 5 for each social share
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Hero Section */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
                <Music className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Cosmic Music
              <br />
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Curator
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-purple-200 mb-4 max-w-3xl mx-auto">
              AI-powered playlists perfectly aligned with your astrological energy
            </p>
            <p className="text-lg text-purple-300 mb-8">
              Get personalized weekly playlists, daily horoscopes, and cosmic insights
            </p>

            {/* Features Preview */}
            <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
              <div className="text-center">
                <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-white mb-1">Astrological AI</h3>
                <p className="text-purple-200 text-sm">Music curated by your birth chart</p>
              </div>
              <div className="text-center">
                <Calendar className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-white mb-1">Daily Insights</h3>
                <p className="text-purple-200 text-sm">Personalized horoscopes & transits</p>
              </div>
              <div className="text-center">
                <Zap className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-white mb-1">Spotify Ready</h3>
                <p className="text-purple-200 text-sm">Export directly to your account</p>
              </div>
            </div>
          </motion.div>

          {/* Waitlist Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-lg max-w-md mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="text-white text-2xl">
                  <Heart className="w-6 h-6 text-red-400 inline mr-2" />
                  Join the Beta Waitlist
                </CardTitle>
                <CardDescription className="text-purple-200">
                  {stats ? (
                    <>
                      <span className="font-semibold text-white">{stats.spotsRemaining}</span> beta spots remaining
                      <br />
                      <span className="text-sm">
                        {stats.totalSignups} cosmic souls already waiting
                      </span>
                    </>
                  ) : (
                    'Be among the first to experience cosmic music curation'
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder-white/60"
                  data-testid="input-email"
                />

                {showReferralInput && (
                  <Input
                    placeholder="Referral code (optional)"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder-white/60"
                    data-testid="input-referral"
                  />
                )}

                {!showReferralInput && (
                  <Button
                    variant="ghost"
                    onClick={() => setShowReferralInput(true)}
                    className="text-purple-300 hover:text-white w-full"
                    data-testid="button-show-referral"
                  >
                    Have a referral code?
                  </Button>
                )}

                <Button
                  onClick={handleJoin}
                  disabled={!email || joinMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3"
                  data-testid="button-join-waitlist"
                >
                  {joinMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Joining...
                    </div>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Reserve My Cosmic Spot
                    </>
                  )}
                </Button>

                <p className="text-xs text-purple-200 text-center">
                  🎯 Refer friends to skip ahead in line • Limited beta access • Free forever
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Section */}
          {stats && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-12 text-center"
            >
              <div className="flex justify-center items-center gap-8 text-white">
                <div>
                  <Users className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                  <div className="text-2xl font-bold">{stats.totalSignups}</div>
                  <div className="text-sm text-purple-200">In Line</div>
                </div>
                <div>
                  <Sparkles className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                  <div className="text-2xl font-bold">{stats.totalInvited}</div>
                  <div className="text-sm text-purple-200">Invited</div>
                </div>
                <div>
                  <Star className="w-6 h-6 text-green-400 mx-auto mb-1" />
                  <div className="text-2xl font-bold">{stats.spotsRemaining}</div>
                  <div className="text-sm text-purple-200">Spots Left</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}