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
import LearningSimple from "@/pages/learning-simple";
import LessonPage from "@/pages/lesson";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isLoading } = useAuth();
  
  // Debug logging
  const [location] = useLocation();
  console.log('Router state:', { user: user ? 'authenticated' : 'not authenticated', isLoading, hasProfile: user ? !!(user?.birthDate && user?.birthTime && user?.birthLocation) : false, currentPath: location });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Always accessible routes first */}
      <Route path="/login">
        <LoginPage />
      </Route>
      <Route path="/signup">
        <SignupPage />
      </Route>
      <Route path="/forgot-password">
        <ForgotPasswordPage />
      </Route>
      <Route path="/reset-password">
        <ResetPasswordPage />
      </Route>
      <Route path="/profile-setup">
        <ProfileSetupPage />
      </Route>
      
      {/* User-dependent routes */}
      {user ? (
        <>
          {/* Check if user needs to complete profile */}
          {!user?.birthDate || !user?.birthTime || !user?.birthLocation ? (
            <>
              <Route path="/">
                <ProfileSetupPage />
              </Route>
              <Route path="/learning">
                <LearningSimple />
              </Route>
            </>
          ) : (
            <>
              <Route path="/">
                <ChatPage />
              </Route>
              <Route path="/feedback-analytics">
                <FeedbackAnalytics />
              </Route>
              <Route path="/mood-analysis">
                <MoodAnalysisPage />
              </Route>
              <Route path="/learning">
                <LearningSimple />
              </Route>
              <Route path="/learning/lesson/:lessonId">
                <LessonPage />
              </Route>
            </>
          )}
        </>
      ) : (
        <>
          {/* Guest routes */}
          <Route path="/">
            <Landing />
          </Route>
          <Route path="/chat">
            <LoginPage />
          </Route>
        </>
      )}
      
      {/* Catch all - must be last */}
      <Route>
        <NotFound />
      </Route>
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
