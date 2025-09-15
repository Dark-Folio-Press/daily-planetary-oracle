// Mood Tracking Module - Exports for mood analytics, correlation analysis, and lunar integration
export { correlationService } from './services/correlation';
export { LunarService } from './services/lunar';

// Re-export mood tracking components
export { default as MoodTracker } from './components/mood-tracker';
export { default as MoodHistory } from './components/mood-history';
export { default as MoodTransitDashboard } from './components/mood-transit-dashboard';
export { default as MoodAnalysisPage } from './components/mood-analysis';

// Types
export type {
  DailyMood,
  DailyTransit,
  InsertDailyMood,
  InsertDailyTransit,
  MoodTransitCorrelation,
  CorrelationAnalysis,
  LunarData,
  MoonPhaseCorrelation
} from './services/correlation';