import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import ChatPage from "@/pages/chat";
import Landing from "@/pages/landing";
import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";
import ProfileSetupPage from "@/pages/profile-setup";
import ForgotPasswordPage from "@/pages/forgot-password";
import ResetPasswordPage from "@/pages/reset-password";
import FeedbackAnalytics from "@/pages/feedback-analytics";
import { MoodAnalysisPage } from "@/pages/mood-analysis";
import LearningPage from "@/pages/learning";
import LessonPage from "@/pages/lesson";
import WaitlistPage from "@/pages/WaitlistPage";
import HarmonicAnalysisPage from "@/pages/harmonic-analysis";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isLoading } = useAuth();
  

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const hasCompleteProfile = user?.birthDate && user?.birthTime && user?.birthLocation;

  return (
    <Switch>
      {/* Always accessible routes */}
      <Route path="/login"><LoginPage /></Route>
      <Route path="/signup"><SignupPage /></Route>
      <Route path="/forgot-password"><ForgotPasswordPage /></Route>
      <Route path="/reset-password"><ResetPasswordPage /></Route>
      <Route path="/profile-setup"><ProfileSetupPage /></Route>
      <Route path="/waitlist"><WaitlistPage /></Route>
      
      {/* Learning route - accessible to authenticated users */}
      <Route path="/learning">
        {user ? <LearningPage /> : <LoginPage />}
      </Route>
      <Route path="/learning/lesson/:lessonId">
        {user ? <LessonPage /> : <LoginPage />}
      </Route>
      
      {/* Main routes */}
      <Route path="/">
        {!user ? <Landing /> : (!hasCompleteProfile ? <ProfileSetupPage /> : <ChatPage />)}
      </Route>
      
      {/* Chat route - accessible to guests and authenticated users */}
      <Route path="/chat">
        {!user ? <ChatPage /> : (!hasCompleteProfile ? <ProfileSetupPage /> : <ChatPage />)}
      </Route>
      
      {/* Other authenticated routes */}
      <Route path="/feedback-analytics">
        {user && hasCompleteProfile ? <FeedbackAnalytics /> : <LoginPage />}
      </Route>
      <Route path="/mood-analysis">
        {user && hasCompleteProfile ? <MoodAnalysisPage /> : <LoginPage />}
      </Route>
      <Route path="/harmonic-analysis">
        {user && hasCompleteProfile ? <HarmonicAnalysisPage /> : <LoginPage />}
      </Route>
      
      {/* Catch all */}
      <Route><NotFound /></Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
