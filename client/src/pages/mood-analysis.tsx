import { MoodTransitDashboard } from '@/components/mood-transit-dashboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

export function MoodAnalysisPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl" data-testid="mood-analysis-page">
      {/* Navigation Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/')}
          className="mb-4"
          data-testid="button-back-to-chat"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Chat
        </Button>
        
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            Mood & Transit Analysis
          </h1>
          <p className="text-lg text-muted-foreground" data-testid="text-page-description">
            Discover how cosmic energies influence your emotional patterns and daily mood.
          </p>
        </div>
      </div>

      {/* Main Dashboard Component */}
      <MoodTransitDashboard />
    </div>
  );
}