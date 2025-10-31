import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/useTheme";
import { isUnauthorizedError } from "@/lib/authUtils";
import { getChatSessionId } from "@/lib/guestSession";
import ChatMessage from "@/components/chat-message";
import ChatInput from "@/components/chat-input";
import QuickActions from "@/components/quick-actions";
import ShareButton from "@/components/share-button";
import MoodTrackerModal from "@/components/mood-feedback-modal";
import { SiSpotify } from "react-icons/si";
import { SpotifyCardContent } from "@/components/spotify-card-content";
import { UserProfileCard } from "@/components/user-profile-card";
import { StarryNightToggle } from "@/components/starry-night-toggle";
import { AvatarDisplay } from "@/components/avatar-display";
import { GuestExitModal, useGuestExitModal } from "@/components/guest-exit-modal";

import { Music, Sparkles, MoreHorizontal, LogOut, X, BarChart3, MessageSquare, TrendingUp, BookOpen, Gauge, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function ChatPage() {
  // Use stable sessionId from sessionStorage to prevent infinite loops on component remounts
  const [sessionId] = useState(() => getChatSessionId());
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [showSpotifyCard, setShowSpotifyCard] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [moodModalTab, setMoodModalTab] = useState<'mood' | 'history'>('mood');
  

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { isDarkMode, toggleTheme } = useTheme();
  const { isModalOpen, closeModal } = useGuestExitModal();

  // Fetch user's astrological data
  const { data: astrologyData } = useQuery({
    queryKey: ['/api/user/big-three'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/user/big-three');
      return response.json();
    },
    enabled: !!user,
  });

  // Fetch messages (session is created server-side if it doesn't exist)
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['/api/chat', sessionId, 'messages'],
    queryFn: async () => {
      //  Initialize session and fetch messages in one request
      await apiRequest('POST', '/api/chat/session', { sessionId });
      const response = await apiRequest('GET', `/api/chat/${sessionId}/messages`);
      return response.json();
    },
    staleTime: Infinity, // Don't refetch automatically
    refetchOnMount: false, // Don't refetch on remount
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', `/api/chat/${sessionId}/message`, { content });
      return response.json();
    },
    onSuccess: (newMessages) => {
      queryClient.setQueryData(['/api/chat', sessionId, 'messages'], newMessages);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to continue.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  });

  const generatePlaylistMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/chat/${sessionId}/generate-playlist`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat', sessionId, 'messages'] });
    },
    onError: (error: any) => {
      // Check for rate limit error
      if (error.status === 429) {
        const errorData = error.body || {};
        const resetIn = errorData.resetIn || 60;
        toast({
          title: "🌟 Guest Limit Reached - Try 3 for Free!",
          description: `You've used all 3 free guest playlists. Try again in ${resetIn} minutes, or sign up now for unlimited cosmic playlists!`,
          variant: "destructive",
        });
        return;
      }
      
      if (isUnauthorizedError(error)) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to generate playlists.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
        return;
      }
      
      toast({
        title: "Error",
        description: "Failed to generate playlist. Please try again.",
        variant: "destructive",
      });
    }
  });

  const getDailyHoroscopeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/horoscope/${sessionId}/weekly`, {});
      return response.json();
    },
    onSuccess: (newMessages) => {
      queryClient.setQueryData(['/api/chat', sessionId, 'messages'], newMessages);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to access weekly horoscopes.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
        return;
      }
      toast({
        title: "Error",
        description: "Please provide complete birth information including date, time, and location for weekly horoscope.",
        variant: "destructive",
      });
    }
  });

  const detailedChartMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/chart/${sessionId}/detailed`, {});
      return response.json();
    },
    onSuccess: (newMessages) => {
      queryClient.setQueryData(['/api/chat', sessionId, 'messages'], newMessages);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to access detailed chart readings.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
        return;
      }
      toast({
        title: "Error",
        description: "Please provide complete birth information including date, time, and location for detailed chart reading.",
        variant: "destructive",
      });
    }
  });

  const transitDetailsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/transit/${sessionId}/details`, {});
      return response.json();
    },
    onSuccess: (newMessages) => {
      queryClient.setQueryData(['/api/chat', sessionId, 'messages'], newMessages);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to access transit details.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
        return;
      }
      
      // Check if it's a 429 error (weekly limit reached)
      if (error.message.includes("429:") || error.message.includes("Weekly transit details limit reached")) {
        toast({
          title: "Weekly Limit Reached",
          description: "You can only get transit details once per week. Your current transit details are still active.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Error",
        description: "Please provide complete birth information including date, time, and location for transit details.",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check for Spotify connection status
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('spotify') === 'connected') {
      toast({
        title: "Spotify Connected!",
        description: "Your music profile has been analyzed! You can now export personalized playlists directly to your Spotify account.",
        duration: 5000,
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('spotify') === 'error') {
      const reason = urlParams.get('reason');
      toast({
        title: "Spotify Connection Failed",
        description: reason || "Please try connecting your Spotify account again.",
        variant: "destructive",
        duration: 5000,
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Determine session state for dynamic prompts
  const hasPlaylist = messages.some((msg: any) => msg.metadata?.type === 'playlist');
  const hasBirthInfo = messages.length > 1; // Simple heuristic - after welcome message, assume interaction started

  const handleSendMessage = (content: string) => {
    sendMessageMutation.mutate(content);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'Weekly Horoscope':
        getDailyHoroscopeMutation.mutate();
        break;
      case 'Transit Details':
        transitDetailsMutation.mutate();
        break;
      case 'Detailed Birth Chart Reading':
        detailedChartMutation.mutate();
        break;
      case 'Cosmic Playlist Generator':
        generatePlaylistMutation.mutate();
        break;
      case 'Daily Mood Tracker':
        setMoodModalTab('mood');
        setShowMoodModal(true);
        break;
    }
  };

  const handleMoodHistoryClick = () => {
    setMoodModalTab('history');
    setShowMoodModal(true);
  };

  // Auto-scroll to welcome message on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (quickActionsRef.current) {
        // Calculate the ribbon height plus some padding
        const ribbonHeight = 80; // Approximate ribbon height
        const elementTop = quickActionsRef.current.offsetTop;
        const scrollPosition = elementTop - ribbonHeight;
        
        window.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      }
    }, 1000); // Wait 1 second for content to load
    
    return () => clearTimeout(timer);
  }, []); // Only run on initial mount

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 cosmic-gradient rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <p className="text-muted-foreground">Channeling cosmic energies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 cosmic-gradient rounded-full flex items-center justify-center">
                <Music className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Cosmic Vibes</h1>
                <p className="text-xs text-muted-foreground">Your AI Astrology Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 overflow-x-auto overflow-y-visible scrollbar-hide max-w-full min-w-0"
                 style={{
                   msOverflowStyle: 'none',  /* IE and Edge */
                   scrollbarWidth: 'none',   /* Firefox */
                 }}>
              {/* User Profile - First after app logo */}
              {user ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className="flex items-center space-x-2 cursor-pointer hover:bg-white/10 rounded-lg px-2 py-1 transition-colors flex-shrink-0"
                        onClick={() => setShowProfileCard(true)}
                      >
                        <AvatarDisplay
                          avatarType={(user as any)?.avatarType}
                          avatarIcon={(user as any)?.avatarIcon}
                          profileImageUrl={(user as any)?.profileImageUrl}
                          size="md"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">
                            {(user as any)?.username || (user as any)?.email}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {(user as any)?.email}
                          </span>
                          {/* Show sun sign if available */}
                          {astrologyData?.sunSign && (
                            <span className="text-xs text-yellow-400">
                              {astrologyData.sunSign}
                            </span>
                          )}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-gradient-to-br from-purple-500/90 to-pink-500/90 backdrop-blur-md text-white border border-white/20 font-medium">
                      ✨ Vibe Check & Charts ✨
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : null}
              
              {/* Slide-out Profile Card */}
              {showProfileCard && (
                <div 
                  className="fixed top-16 left-0 right-0 bg-black/75 dark:bg-black/75 bg-white/85 backdrop-blur-md border-b border-white/20 dark:border-white/20 border-gray-300/30 p-6 shadow-2xl z-50 transform transition-all duration-200 ease-out"
                >
                  {/* Close button */}
                  <button
                    onClick={() => setShowProfileCard(false)}
                    className="absolute top-4 right-4 text-white/60 dark:text-white/60 text-gray-600/60 hover:text-white dark:hover:text-white hover:text-gray-900 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  
                  <UserProfileCard />
                </div>
              )}
              
              {/* Spotify Integration - Second after profile */}
              {user && (
                <div className="relative flex-shrink-0">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          className="w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-white/10 rounded-lg transition-colors"
                          onClick={() => setShowSpotifyCard(true)}
                        >
                          <SiSpotify className="w-5 h-5 text-green-500 hover:text-green-400 transition-colors" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-gradient-to-br from-purple-500/90 to-pink-500/90 backdrop-blur-md text-white border border-white/20 font-medium">
                        ✨Spotify ✨
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  {/* Spotify Card Popup */}
                  {showSpotifyCard && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-start pt-20 p-4" onClick={() => setShowSpotifyCard(false)}>
                      <div 
                        className="bg-background border border-border rounded-xl shadow-2xl max-w-md w-full max-h-[70vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="p-4 border-b border-border flex items-center justify-between">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <SiSpotify className="w-5 h-5 text-green-500" />
                            Spotify Integration
                          </h3>
                          <button
                            onClick={() => setShowSpotifyCard(false)}
                            className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-red-500/10 hover:text-red-500 border border-border hover:border-red-500/20"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="p-4">
                          <SpotifyCardContent />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mood History Button - Third after Spotify */}
              {user && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMoodHistoryClick}
                        className="text-muted-foreground hover:text-foreground hover:bg-white/10 p-2 rounded-lg transition-colors flex-shrink-0"
                      >
                        <BookOpen className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-gradient-to-br from-purple-500/90 to-pink-500/90 backdrop-blur-md text-white border border-white/20 font-medium">
                      ✨Cosmic Journal✨
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Mood-Transit Correlation Button - After Mood Analytics */}
              {user && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.location.href = '/mood-analysis'}
                        className="text-muted-foreground hover:text-foreground hover:bg-white/10 p-2 rounded-lg transition-colors flex-shrink-0"
                        data-testid="button-mood-analysis"
                      >
                        <TrendingUp className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-gradient-to-br from-purple-500/90 to-pink-500/90 backdrop-blur-md text-white border border-white/20 font-medium">
                      ✨Cosmic Analytics✨
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Learning System Button - After Cosmic Mood Analysis */}
              {user && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.location.href = '/learning'}
                        className="text-muted-foreground hover:text-foreground hover:bg-white/10 p-2 rounded-lg transition-colors flex-shrink-0"
                        data-testid="button-learning"
                      >
                        <GraduationCap className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-gradient-to-br from-purple-500/90 to-pink-500/90 backdrop-blur-md text-white border border-white/20 font-medium">
                      ✨Learn Astrology✨
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Feedback Analytics Button - After Learning */}
              {user && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.location.href = '/feedback-analytics'}
                        className="text-muted-foreground hover:text-foreground hover:bg-white/10 p-2 rounded-lg transition-colors flex-shrink-0"
                        data-testid="button-feedback-analytics"
                      >
                        <Gauge className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-gradient-to-br from-purple-500/90 to-pink-500/90 backdrop-blur-md text-white border border-white/20 font-medium">
                      ✨Accuracy Rate ✨
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {/* Share Button - Fourth after Mood */}
              {(user && messages.length > 0) ? (
                <div className="flex-shrink-0">
                  <ShareButton 
                    type="conversation" 
                    sessionId={sessionId} 
                    variant="ghost" 
                    size="sm" 
                  />
                </div>
              ) : null}
              
              {/* Theme Toggle - Fourth after Share Button */}
              <div className="flex-shrink-0">
                <StarryNightToggle isDarkMode={isDarkMode} onToggle={toggleTheme} />
              </div>
              
              {/* Logout Button - Last */}
              <div className="flex-shrink-0">
                {user ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      try {
                        await apiRequest('POST', '/api/auth/logout');
                        window.location.href = '/';
                      } catch (error) {
                        console.error('Logout error:', error);
                        window.location.href = '/';
                      }
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = '/login'}
                    className="text-sm"
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="max-w-4xl mx-auto px-4 pb-32">
        

        
        {/* Hero Section */}
        <div className="text-center py-12 cosmic-bg rounded-b-3xl mb-8">
          <div className="w-16 h-16 cosmic-gradient rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Master your astrological blueprint through AI guidance
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Engage in personalized conversations about your birth chart, planetary transits, and cosmic influences. Discover the depths of your astrological journey.
          </p>
        </div>


        {/* Chat Messages */}
        <div ref={quickActionsRef} className="space-y-6 mb-8">
          {messages.map((message: any) => (
            <ChatMessage 
              key={message.id} 
              message={{...message, sessionId}} 
            />
          ))}
          {(sendMessageMutation.isPending || getDailyHoroscopeMutation.isPending) && (
            <ChatMessage 
              message={{
                role: 'assistant',
                content: 'Channeling cosmic energies...',
                metadata: { type: 'loading' }
              }}
            />
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <QuickActions 
          onAction={handleQuickAction}
          disabled={sendMessageMutation.isPending || getDailyHoroscopeMutation.isPending}
        />
      </main>

      {/* Chat Input */}
      <ChatInput 
        onSendMessage={handleSendMessage}
        disabled={sendMessageMutation.isPending || getDailyHoroscopeMutation.isPending}
        hasPlaylist={hasPlaylist}
        hasBirthInfo={hasBirthInfo}
      />

      {/* Mood Feedback Modal */}
      <MoodTrackerModal 
        isOpen={showMoodModal}
        onClose={() => setShowMoodModal(false)}
        initialTab={moodModalTab}
      />

      {/* Guest Exit Modal */}
      <GuestExitModal 
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}
