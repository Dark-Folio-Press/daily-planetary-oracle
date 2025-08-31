import type { DailyMood, DailyTransit } from "@shared/schema";
import { LunarService, type LunarData, type MoonPhaseCorrelation } from "./lunar";

export interface MoodTransitCorrelation {
  date: string;
  mood: DailyMood;
  transit: DailyTransit;
  correlationScore: number;
  significantCorrelations: string[];
  insights: string[];
  planetaryAspects: PlanetaryAspect[];
}

export interface PlanetaryAspect {
  planet: string;
  aspect: string;
  natalPlanet: string;
  orb: number;
  significance: 'high' | 'medium' | 'low';
  interpretation: string;
  emotionalInfluence: 'positive' | 'negative' | 'neutral';
}

export interface CorrelationAnalysis {
  totalEntries: number;
  correlationPeriod: string;
  overallCorrelationScore: number;
  strongCorrelations: Array<{
    pattern: string;
    strength: number;
    frequency: number;
    description: string;
  }>;
  weeklyPatterns: Array<{
    weekday: string;
    avgMood: number;
    avgEnergy: number;
    commonTransits: string[];
    planetaryInfluences: Array<{
      planet: string;
      aspectType: string;
      frequency: number;
      avgCorrelation: number;
      influence: string;
    }>;
    dominantPlanet: string;
    weeklyInsight: string;
    lunarPatterns: {
      dominantPhase: string;
      phaseFrequencies: Array<{
        phase: string;
        frequency: number;
        avgMood: number;
        avgEnergy: number;
      }>;
      lunarInsight: string;
    };
  }>;
  planetaryInfluences: {
    dominantPlanet: string;
    dominantCorrelation: number;
    influences: Array<{
      planet: string;
      correlation: number;
      aspectTypes: string[];
      avgMoodImpact: number;
      significantDays: number;
    }>;
    insights: string[];
  };
  lunarInfluences: {
    overallLunarSensitivity: number;
    dominantMoonPhase: string;
    moonPhaseCorrelations: Array<{
      phase: string;
      phaseName: string;
      avgMood: number;
      avgEnergy: number;
      frequency: number;
      significance: 'high' | 'medium' | 'low';
    }>;
    currentMoonData: {
      phase: string;
      phaseName: string;
      illumination: number;
      sign: string;
      influence: string;
    };
    lunarPlanetaryHarmony: number;
    insights: string[];
  };
  dailyEntries: MoodTransitCorrelation[];
  insights: string[];
  recommendations: string[];
}

export class CorrelationService {
  private lunarService = new LunarService();
  /**
   * Analyze correlations between mood and transit data
   */
  async analyzeMoodTransitCorrelations(
    moods: DailyMood[],
    transits: DailyTransit[]
  ): Promise<CorrelationAnalysis> {
    // Create a map of dates to mood and transit data
    const dataMap = this.createDateMap(moods, transits);
    const correlations = this.calculateCorrelations(dataMap);
    
    // Analyze planetary influences for enhanced insights
    const planetaryAnalysis = this.analyzePlanetaryInfluences(moods, transits);
    
    // Analyze lunar influences and patterns
    const lunarAnalysis = this.analyzeLunarInfluences(moods, transits);
    
    return {
      totalEntries: correlations.length,
      correlationPeriod: this.getAnalysisPeriod(moods),
      overallCorrelationScore: this.calculateOverallCorrelation(correlations),
      strongCorrelations: this.identifyStrongCorrelations(correlations),
      weeklyPatterns: this.analyzeWeeklyPatternsEnhanced(correlations, transits),
      planetaryInfluences: {
        dominantPlanet: planetaryAnalysis.dominantPlanet,
        dominantCorrelation: planetaryAnalysis.dominantCorrelation,
        influences: planetaryAnalysis.planetaryInfluences,
        insights: planetaryAnalysis.insights
      },
      lunarInfluences: lunarAnalysis,
      dailyEntries: correlations,
      insights: this.generateInsights(correlations),
      recommendations: this.generateRecommendations(correlations)
    };
  }

  /**
   * Create a map linking dates to both mood and transit data
   */
  private createDateMap(moods: DailyMood[], transits: DailyTransit[]): Map<string, {mood: DailyMood, transit: DailyTransit}> {
    const moodMap = new Map(moods.map(mood => [mood.date, mood]));
    const transitMap = new Map(transits.map(transit => [transit.date, transit]));
    const dataMap = new Map();

    // Only include dates where we have both mood and transit data
    for (const [date, mood] of Array.from(moodMap)) {
      const transit = transitMap.get(date);
      if (transit) {
        dataMap.set(date, { mood, transit });
      }
    }

    return dataMap;
  }

  /**
   * Calculate individual correlations for each day
   */
  private calculateCorrelations(dataMap: Map<string, any>): MoodTransitCorrelation[] {
    const correlations: MoodTransitCorrelation[] = [];

    for (const [date, { mood, transit }] of Array.from(dataMap)) {
      const correlation = this.calculateDayCorrelation(mood, transit);
      const planetaryAspects = this.extractPlanetaryAspects(transit);
      
      correlations.push({
        date,
        mood,
        transit,
        correlationScore: correlation.score,
        significantCorrelations: correlation.patterns,
        insights: correlation.insights,
        planetaryAspects
      });
    }

    return correlations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * Extract planetary aspects from transit data
   */
  private extractPlanetaryAspects(transit: DailyTransit): PlanetaryAspect[] {
    const aspects: PlanetaryAspect[] = [];
    
    // Check personalizedAspects first, then transitData
    let aspectData: any[] = [];
    
    try {
      if (transit.personalizedAspects && typeof transit.personalizedAspects === 'object') {
        const personalizedData = transit.personalizedAspects as any;
        if (personalizedData.aspects && Array.isArray(personalizedData.aspects)) {
          aspectData = personalizedData.aspects;
        }
      }
      
      // If no personalized aspects, check transitData
      if (aspectData.length === 0 && transit.transitData && typeof transit.transitData === 'object') {
        const transitDataObj = transit.transitData as any;
        if (transitDataObj.aspects && Array.isArray(transitDataObj.aspects)) {
          aspectData = transitDataObj.aspects;
        } else if (transitDataObj.significantAspects && Array.isArray(transitDataObj.significantAspects)) {
          aspectData = transitDataObj.significantAspects;
        }
      }
    } catch (error) {
      console.warn('Error parsing transit data:', error);
      return aspects;
    }
    
    if (aspectData.length === 0) {
      return aspects;
    }

    // Parse the aspects from the transit data
    for (const aspect of aspectData) {
      try {
        let aspectStr = '';
        
        // Handle different aspect data formats
        if (typeof aspect === 'string') {
          aspectStr = aspect;
        } else if (typeof aspect === 'object' && aspect.description) {
          aspectStr = aspect.description;
        } else if (typeof aspect === 'object' && (aspect.aspect || aspect.type)) {
          // Handle structured aspect data
          const aspectType = aspect.aspect || aspect.type || 'conjunction';
          const transitingPlanet = aspect.planet || aspect.transitingPlanet || 'Unknown';
          const natalPlanet = aspect.natalPlanet || 'Unknown';
          const interpretation = aspect.influence || this.getAspectInterpretation(transitingPlanet, aspectType, natalPlanet);
          
          aspects.push({
            planet: transitingPlanet,
            aspect: aspectType,
            natalPlanet: natalPlanet,
            orb: aspect.orb || 0,
            significance: this.getAspectSignificance(aspectType, aspect.orb || 0),
            interpretation: interpretation,
            emotionalInfluence: this.getEmotionalInfluence(transitingPlanet, aspectType, natalPlanet)
          });
          continue;
        }
        
        if (!aspectStr) continue;
        
        // Parse aspect string format like "Mars square natal Moon (orb: 2.5°)"
        const match = aspectStr.match(/(\\w+)\\s+(\\w+)\\s+natal\\s+(\\w+)\\s*(?:\\(orb:\\s*([0-9.]+)°\\))?/i);
        
        if (match) {
          const [, planet, aspectType, natalPlanet, orbStr] = match;
          const orb = orbStr ? parseFloat(orbStr) : 0;
          
          aspects.push({
            planet: planet.charAt(0).toUpperCase() + planet.slice(1),
            aspect: aspectType.toLowerCase(),
            natalPlanet: natalPlanet.charAt(0).toUpperCase() + natalPlanet.slice(1),
            orb,
            significance: this.getAspectSignificance(aspectType, orb),
            interpretation: this.getAspectInterpretation(planet, aspectType, natalPlanet),
            emotionalInfluence: this.getEmotionalInfluence(planet, aspectType, natalPlanet)
          });
        }
      } catch (error) {
        console.warn('Failed to parse aspect:', aspect, error);
      }
    }

    return aspects;
  }

  /**
   * Determine aspect significance based on type and orb
   */
  private getAspectSignificance(aspectType: string, orb: number): 'high' | 'medium' | 'low' {
    const majorAspects = ['conjunction', 'opposition', 'square', 'trine', 'sextile'];
    const isMajor = majorAspects.includes(aspectType.toLowerCase());
    
    if (isMajor && orb <= 3) return 'high';
    if (isMajor && orb <= 6) return 'medium';
    return 'low';
  }

  /**
   * Get astrological interpretation for planet-aspect-natal planet combination
   */
  private getAspectInterpretation(planet: string, aspect: string, natalPlanet: string): string {
    const interpretations: Record<string, Record<string, Record<string, string>>> = {
      mars: {
        square: {
          moon: "Emotional tension and impulsive reactions may surface",
          sun: "Conflicts between will and ego, increased assertiveness", 
          venus: "Friction in relationships, passionate but challenging energy"
        },
        conjunction: {
          moon: "Heightened emotional intensity and decisive action",
          sun: "Surge of energy, motivation, and leadership drive"
        },
        trine: {
          moon: "Harmonious flow of emotional and physical energy",
          sun: "Confident action and positive self-expression"
        }
      },
      venus: {
        trine: {
          moon: "Emotional harmony and appreciation for beauty",
          sun: "Enhanced charm, creativity, and social connections"
        },
        square: {
          moon: "Emotional indulgence or relationship tensions"
        }
      },
      saturn: {
        square: {
          moon: "Emotional restrictions and feelings of limitation",
          sun: "Challenges to authority and self-confidence"
        },
        trine: {
          moon: "Emotional stability and practical wisdom"
        }
      }
    };

    const planetKey = planet.toLowerCase();
    const aspectKey = aspect.toLowerCase();
    const natalKey = natalPlanet.toLowerCase();
    
    return interpretations[planetKey]?.[aspectKey]?.[natalKey] || 
           `${planet} ${aspect} natal ${natalPlanet} brings significant energy to your day`;
  }

  /**
   * Determine emotional influence of planetary aspect
   */
  private getEmotionalInfluence(planet: string, aspect: string, natalPlanet: string): 'positive' | 'negative' | 'neutral' {
    const harmonious = ['trine', 'sextile', 'conjunction'];
    const challenging = ['square', 'opposition'];
    
    if (harmonious.includes(aspect.toLowerCase())) {
      return 'positive';
    } else if (challenging.includes(aspect.toLowerCase())) {
      return 'negative';
    }
    
    return 'neutral';
  }

  /**
   * Calculate correlation score and patterns for a single day
   */
  private calculateDayCorrelation(mood: DailyMood, transit: DailyTransit): {
    score: number;
    patterns: string[];
    insights: string[];
  } {
    let score = 0;
    const patterns: string[] = [];
    const insights: string[] = [];
    
    const transitData = transit.transitData as any;
    const energyProfile = transitData?.energyProfile || {};
    const themes = transitData?.themes || [];
    const moodInfluences = transitData?.moodInfluences || [];

    // Energy level correlation
    if (energyProfile.energyLevel) {
      const energyDiff = Math.abs(mood.energy - energyProfile.energyLevel);
      const energyCorrelation = Math.max(0, 1 - (energyDiff / 10));
      score += energyCorrelation * 0.4; // 40% weight for energy

      if (energyCorrelation > 0.7) {
        patterns.push(`Energy alignment: ${energyCorrelation.toFixed(2)}`);
        insights.push(`Your energy level (${mood.energy}) closely matched the cosmic energy (${energyProfile.energyLevel})`);
      }
    }

    // Mood correlation with emotional tone
    if (energyProfile.emotionalTone) {
      const moodToneCorrelation = this.calculateMoodToneCorrelation(mood.mood, energyProfile.emotionalTone);
      score += moodToneCorrelation * 0.3; // 30% weight for emotional tone

      if (moodToneCorrelation > 0.7) {
        patterns.push(`Emotional tone alignment: ${moodToneCorrelation.toFixed(2)}`);
        insights.push(`Your mood aligned with the cosmic emotional tone: ${energyProfile.emotionalTone}`);
      }
    }

    // Theme correlation with emotions
    const emotionArray = Array.isArray(mood.emotions) ? mood.emotions : 
                        typeof mood.emotions === 'string' ? (mood.emotions as string).split(',') : [];
    
    const themeCorrelation = this.calculateThemeEmotionCorrelation(themes, emotionArray);
    score += themeCorrelation * 0.3; // 30% weight for themes

    if (themeCorrelation > 0.5) {
      patterns.push(`Theme-emotion alignment: ${themeCorrelation.toFixed(2)}`);
      insights.push(`Your emotions resonated with the cosmic themes: ${themes.join(', ')}`);
    }

    return {
      score: Math.min(1, score), // Cap at 1.0
      patterns,
      insights
    };
  }

  /**
   * Calculate correlation between mood number and emotional tone
   */
  private calculateMoodToneCorrelation(moodLevel: number, emotionalTone: string): number {
    const moodMappings: { [key: string]: number[] } = {
      'positive': [7, 8, 9, 10],
      'balanced': [4, 5, 6, 7],
      'intense': [3, 4, 8, 9],
      'introspective': [2, 3, 4, 5],
      'challenging': [1, 2, 3, 4]
    };

    const expectedRange = moodMappings[emotionalTone] || [4, 5, 6];
    const isInRange = expectedRange.includes(moodLevel);
    
    if (isInRange) {
      return 0.8 + (Math.random() * 0.2); // 0.8-1.0 for direct matches
    } else {
      const minDistance = Math.min(...expectedRange.map(level => Math.abs(level - moodLevel)));
      return Math.max(0, 1 - (minDistance / 5)); // Decreasing correlation with distance
    }
  }

  /**
   * Calculate correlation between cosmic themes and emotions
   */
  private calculateThemeEmotionCorrelation(themes: string[], emotions: string[]): number {
    if (emotions.length === 0 || themes.length === 0) return 0;

    const themeEmotionMappings: { [key: string]: string[] } = {
      'Love & Creativity': ['happy', 'inspired', 'creative', 'loving', 'joyful'],
      'Communication & Learning': ['curious', 'focused', 'excited', 'engaged'],
      'Action & Energy': ['motivated', 'energetic', 'confident', 'determined'],
      'Emotions & Intuition': ['intuitive', 'sensitive', 'emotional', 'reflective'],
      'Self-Reflection': ['contemplative', 'peaceful', 'introspective', 'calm']
    };

    let matches = 0;
    let totalComparisons = 0;

    for (const theme of themes) {
      const themeEmotions = themeEmotionMappings[theme] || [];
      for (const emotion of emotions) {
        totalComparisons++;
        if (themeEmotions.some(te => te.toLowerCase().includes(emotion.toLowerCase()) || 
                                    emotion.toLowerCase().includes(te.toLowerCase()))) {
          matches++;
        }
      }
    }

    return totalComparisons > 0 ? matches / totalComparisons : 0;
  }

  /**
   * Calculate overall correlation score across all days
   */
  private calculateOverallCorrelation(correlations: MoodTransitCorrelation[]): number {
    if (correlations.length === 0) return 0;
    
    const totalScore = correlations.reduce((sum, corr) => sum + corr.correlationScore, 0);
    return totalScore / correlations.length;
  }

  /**
   * Identify strong correlation patterns with detailed planetary analysis
   */
  private identifyStrongCorrelations(correlations: MoodTransitCorrelation[]): Array<{
    pattern: string;
    strength: number;
    frequency: number;
    description: string;
  }> {
    const patternCounts = new Map<string, number>();
    const patternScores = new Map<string, number[]>();
    const patternAspects = new Map<string, PlanetaryAspect[]>();

    // Count pattern occurrences and collect scores with planetary context
    correlations.forEach(corr => {
      corr.significantCorrelations.forEach(pattern => {
        patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);
        if (!patternScores.has(pattern)) {
          patternScores.set(pattern, []);
          patternAspects.set(pattern, []);
        }
        patternScores.get(pattern)!.push(corr.correlationScore);
        
        // Collect planetary aspects for this pattern
        const relevantAspects = corr.planetaryAspects.filter(aspect => 
          aspect.significance === 'high' || 
          (aspect.significance === 'medium' && aspect.emotionalInfluence !== 'neutral')
        );
        patternAspects.get(pattern)!.push(...relevantAspects);
      });
    });

    // Convert to result format with enhanced descriptions
    const strongCorrelations = [];
    for (const [pattern, count] of patternCounts) {
      const scores = patternScores.get(pattern) || [];
      const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      const frequency = count / correlations.length;
      const aspects = patternAspects.get(pattern) || [];

      if (frequency > 0.2 || avgScore > 0.7) { // Appears in 20%+ of days or high correlation
        // Generate enhanced pattern name with planetary context
        const enhancedPattern = this.generateEnhancedPatternName(pattern, aspects);
        
        strongCorrelations.push({
          pattern: enhancedPattern,
          strength: avgScore,
          frequency,
          description: this.generateDetailedPatternDescription(pattern, frequency, avgScore, aspects)
        });
      }
    }

    return strongCorrelations.sort((a, b) => b.strength - a.strength);
  }

  /**
   * Analyze weekly patterns in mood and transits with planetary influences
   */
  /**
   * Enhanced weekly patterns analysis that includes planetary data for all days
   */
  private analyzeWeeklyPatternsEnhanced(correlations: MoodTransitCorrelation[], allTransits: DailyTransit[]): Array<{
    weekday: string;
    avgMood: number;
    avgEnergy: number;
    commonTransits: string[];
    planetaryInfluences: Array<{
      planet: string;
      aspectType: string;
      frequency: number;
      avgCorrelation: number;
      influence: string;
    }>;
    dominantPlanet: string;
    weeklyInsight: string;
    lunarPatterns: {
      dominantPhase: string;
      phaseFrequencies: Array<{
        phase: string;
        frequency: number;
        avgMood: number;
        avgEnergy: number;
      }>;
      lunarInsight: string;
    };
  }> {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Create comprehensive weekday data including ALL transits, not just those with mood data
    const weeklyData = new Map<string, {
      moods: number[], 
      energies: number[], 
      transits: string[],
      aspects: PlanetaryAspect[],
      correlations: number[],
      dates: string[]
    }>();

    // Initialize all weekdays
    weekdays.forEach(weekday => {
      weeklyData.set(weekday, { 
        moods: [], 
        energies: [], 
        transits: [], 
        aspects: [], 
        correlations: [],
        dates: []
      });
    });

    // Add data from correlations (mood + transit data)
    correlations.forEach(corr => {
      const date = new Date(corr.date);
      const weekday = weekdays[date.getDay()];
      const data = weeklyData.get(weekday)!;
      
      data.moods.push(corr.mood.mood);
      data.energies.push(corr.mood.energy);
      data.correlations.push(corr.correlationScore);
      data.aspects.push(...corr.planetaryAspects);
      data.dates.push(corr.date);
      
      const transitData = corr.transit.transitData as any;
      if (transitData?.themes) {
        data.transits.push(...transitData.themes);
      }
    });

    // Add planetary data from ALL transits (including days without mood data)
    allTransits.forEach(transit => {
      const date = new Date(transit.date);
      const weekday = weekdays[date.getDay()];
      const data = weeklyData.get(weekday)!;
      
      // Only add if we don't already have this date (avoid duplicates)
      if (!data.dates.includes(transit.date)) {
        const aspects = this.extractPlanetaryAspects(transit);
        data.aspects.push(...aspects);
        data.dates.push(transit.date);
        
        const transitData = transit.transitData as any;
        if (transitData?.themes) {
          data.transits.push(...transitData.themes);
        }
      }
    });

    // Calculate patterns for each weekday
    return weekdays.map(weekday => {
      const data = weeklyData.get(weekday)!;
      
      const avgMood = data.moods.length > 0 ? data.moods.reduce((sum, mood) => sum + mood, 0) / data.moods.length : 0;
      const avgEnergy = data.energies.length > 0 ? data.energies.reduce((sum, energy) => sum + energy, 0) / data.energies.length : 0;
      const avgCorrelation = data.correlations.length > 0 ? data.correlations.reduce((sum, corr) => sum + corr, 0) / data.correlations.length : 5;
      
      // Analyze planetary influences for this weekday (even without mood data)
      const planetaryStats = new Map<string, {
        aspects: string[],
        correlations: number[],
        influences: string[]
      }>();
      
      data.aspects.forEach(aspect => {
        const key = aspect.planet;
        if (!planetaryStats.has(key)) {
          planetaryStats.set(key, { 
            aspects: [], 
            correlations: [], 
            influences: [] 
          });
        }
        
        const stats = planetaryStats.get(key)!;
        stats.aspects.push(aspect.aspect);
        stats.correlations.push(avgCorrelation);
        stats.influences.push(aspect.interpretation);
      });
      
      // Calculate planetary influences
      const planetaryInfluences = [...planetaryStats.entries()].map(([planet, stats]) => {
        const mostCommonAspect = this.getMostCommon(stats.aspects);
        const avgPlanetCorrelation = stats.correlations.length > 0 ? stats.correlations.reduce((a, b) => a + b, 0) / stats.correlations.length : 5;
        const frequency = data.aspects.length > 0 ? stats.aspects.length / data.aspects.length : 0;
        
        return {
          planet,
          aspectType: mostCommonAspect,
          frequency,
          avgCorrelation: avgPlanetCorrelation,
          influence: stats.influences[0] || `${planet} brings significant energy to your ${weekday}s`
        };
      }).sort((a, b) => b.frequency - a.frequency).slice(0, 3);
      
      const dominantPlanet = planetaryInfluences.length > 0 ? planetaryInfluences[0].planet : '';
      
      // Find most common transits for this weekday
      const transitCounts = new Map<string, number>();
      data.transits.forEach(transit => {
        transitCounts.set(transit, (transitCounts.get(transit) || 0) + 1);
      });
      
      const commonTransits = [...transitCounts.entries()]
        .filter(([_, count]) => count >= 2)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([transit, _]) => transit);

      // Analyze lunar patterns for this weekday
      const lunarPatterns = this.analyzeLunarPatternsForWeekday(data.dates, data.moods, data.energies);
      
      // Generate weekly insight with lunar integration
      const weeklyInsight = this.generateWeeklyInsightWithLunar(weekday, avgMood, avgEnergy, avgCorrelation, dominantPlanet, planetaryInfluences, lunarPatterns);

      return {
        weekday,
        avgMood: Number(avgMood.toFixed(1)),
        avgEnergy: Number(avgEnergy.toFixed(1)),
        commonTransits,
        planetaryInfluences,
        dominantPlanet,
        weeklyInsight,
        lunarPatterns
      };
    });
  }

  private analyzeWeeklyPatterns(correlations: MoodTransitCorrelation[]): Array<{
    weekday: string;
    avgMood: number;
    avgEnergy: number;
    commonTransits: string[];
    planetaryInfluences: Array<{
      planet: string;
      aspectType: string;
      frequency: number;
      avgCorrelation: number;
      influence: string;
    }>;
    dominantPlanet: string;
    weeklyInsight: string;
  }> {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weeklyData = new Map<string, {
      moods: number[], 
      energies: number[], 
      transits: string[],
      aspects: PlanetaryAspect[],
      correlations: number[],
      dates: string[]
    }>();

    // Group data by weekday with planetary aspects
    correlations.forEach(corr => {
      const date = new Date(corr.date);
      const weekday = weekdays[date.getDay()];
      
      if (!weeklyData.has(weekday)) {
        weeklyData.set(weekday, { 
          moods: [], 
          energies: [], 
          transits: [], 
          aspects: [], 
          correlations: [],
          dates: []
        });
      }
      
      const data = weeklyData.get(weekday)!;
      data.moods.push(corr.mood.mood);
      data.energies.push(corr.mood.energy);
      data.correlations.push(corr.correlationScore);
      data.aspects.push(...corr.planetaryAspects);
      data.dates.push(corr.date);
      
      const transitData = corr.transit.transitData as any;
      if (transitData?.themes) {
        data.transits.push(...transitData.themes);
      }
    });

    // Calculate averages, planetary influences, and insights
    return weekdays.map(weekday => {
      const data = weeklyData.get(weekday);
      if (!data || data.moods.length === 0) {
        return {
          weekday,
          avgMood: 0,
          avgEnergy: 0,
          commonTransits: [],
          planetaryInfluences: [],
          dominantPlanet: '',
          weeklyInsight: 'No data available for this day of the week.',
          lunarPatterns: {
            dominantPhase: '',
            phaseFrequencies: [],
            lunarInsight: 'No lunar data available for this day.'
          }
        };
      }

      const avgMood = data.moods.reduce((sum, mood) => sum + mood, 0) / data.moods.length;
      const avgEnergy = data.energies.reduce((sum, energy) => sum + energy, 0) / data.energies.length;
      const avgCorrelation = data.correlations.reduce((sum, corr) => sum + corr, 0) / data.correlations.length;
      
      // Analyze planetary influences for this weekday
      const planetaryStats = new Map<string, {
        aspects: string[],
        correlations: number[],
        influences: string[]
      }>();
      
      data.aspects.forEach(aspect => {
        const key = aspect.planet;
        if (!planetaryStats.has(key)) {
          planetaryStats.set(key, { 
            aspects: [], 
            correlations: [], 
            influences: [] 
          });
        }
        
        const stats = planetaryStats.get(key)!;
        stats.aspects.push(aspect.aspect);
        stats.correlations.push(avgCorrelation);
        stats.influences.push(aspect.interpretation);
      });
      
      // Calculate planetary influences
      const planetaryInfluences = [...planetaryStats.entries()].map(([planet, stats]) => {
        const mostCommonAspect = this.getMostCommon(stats.aspects);
        const avgPlanetCorrelation = stats.correlations.reduce((a, b) => a + b, 0) / stats.correlations.length;
        const frequency = stats.aspects.length / data.aspects.length;
        
        return {
          planet,
          aspectType: mostCommonAspect,
          frequency,
          avgCorrelation: avgPlanetCorrelation,
          influence: stats.influences[0] || `${planet} brings significant energy to your ${weekday}s`
        };
      }).sort((a, b) => b.frequency - a.frequency).slice(0, 3);
      
      const dominantPlanet = planetaryInfluences.length > 0 ? planetaryInfluences[0].planet : '';
      
      // Find most common transits for this weekday
      const transitCounts = new Map<string, number>();
      data.transits.forEach(transit => {
        transitCounts.set(transit, (transitCounts.get(transit) || 0) + 1);
      });
      
      const commonTransits = [...transitCounts.entries()]
        .filter(([_, count]) => count >= 2)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([transit, _]) => transit);

      // Analyze lunar patterns for this weekday
      const lunarPatterns = this.analyzeLunarPatternsForWeekday(data.dates, data.moods, data.energies);
      
      // Generate weekly insight with lunar integration
      const weeklyInsight = this.generateWeeklyInsightWithLunar(weekday, avgMood, avgEnergy, avgCorrelation, dominantPlanet, planetaryInfluences, lunarPatterns);

      return {
        weekday,
        avgMood: Number(avgMood.toFixed(1)),
        avgEnergy: Number(avgEnergy.toFixed(1)),
        commonTransits,
        planetaryInfluences,
        dominantPlanet,
        weeklyInsight,
        lunarPatterns
      };
    });
  }

  /**
   * Generate insights from correlation analysis
   */
  private generateInsights(correlations: MoodTransitCorrelation[]): string[] {
    const insights: string[] = [];
    
    if (correlations.length === 0) {
      insights.push("No correlation data available yet. Track your mood daily to see patterns emerge!");
      return insights;
    }

    const avgCorrelation = this.calculateOverallCorrelation(correlations);
    
    if (avgCorrelation > 0.7) {
      insights.push("🌟 Strong cosmic connection! Your mood patterns closely align with planetary transits.");
    } else if (avgCorrelation > 0.5) {
      insights.push("✨ Moderate cosmic influence detected in your emotional patterns.");
    } else {
      insights.push("🌙 Your mood patterns show some cosmic influence, but personal factors may be stronger.");
    }

    // High energy correlation insights
    const highEnergyDays = correlations.filter(c => c.mood.energy >= 8 && c.correlationScore > 0.6);
    if (highEnergyDays.length > 0) {
      insights.push(`⚡ You tend to have high energy on days with strong cosmic alignment (${highEnergyDays.length} days found).`);
    }

    // Low energy insights
    const lowEnergyDays = correlations.filter(c => c.mood.energy <= 3 && c.correlationScore > 0.6);
    if (lowEnergyDays.length > 0) {
      insights.push(`🌙 Rest days seem to align with introspective cosmic energy (${lowEnergyDays.length} days found).`);
    }

    return insights;
  }

  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(correlations: MoodTransitCorrelation[]): string[] {
    const recommendations: string[] = [];
    
    if (correlations.length < 7) {
      recommendations.push("📊 Track your mood for at least a week to get meaningful cosmic insights.");
      return recommendations;
    }

    const avgCorrelation = this.calculateOverallCorrelation(correlations);
    
    if (avgCorrelation > 0.6) {
      recommendations.push("🔮 Consider checking daily transits in the morning to align your activities with cosmic energy.");
      recommendations.push("🎵 Use cosmic music recommendations when your mood aligns strongly with transits.");
    }

    // Energy management recommendations
    const energyVariance = this.calculateEnergyVariance(correlations);
    if (energyVariance > 4) {
      recommendations.push("⚖️ Your energy levels vary significantly. Use transit insights to plan high and low energy activities.");
    }

    // Weekly pattern recommendations with planetary insights
    const weeklyPatterns = this.analyzeWeeklyPatternsEnhanced(correlations, []); // Use enhanced version
    const bestDays = weeklyPatterns.filter(p => p.avgMood >= 7);
    if (bestDays.length > 0) {
      const bestDayNames = bestDays.map(d => {
        const planetInfo = d.dominantPlanet ? ` (${d.dominantPlanet} influence)` : '';
        return `${d.weekday}${planetInfo}`;
      });
      recommendations.push(`🌟 Your best days tend to be: ${bestDayNames.join(', ')}. Plan important activities accordingly.`);
    }
    
    // Add planetary-specific recommendations
    const planetaryPatterns = weeklyPatterns.filter(p => p.dominantPlanet);
    if (planetaryPatterns.length > 0) {
      const dominantPlanets = [...new Set(planetaryPatterns.map(p => p.dominantPlanet))];
      if (dominantPlanets.length <= 2) {
        recommendations.push(`🪐 Your weekly rhythms are strongly influenced by ${dominantPlanets.join(' and ')}. Consider these planetary energies when planning your week.`);
      }
    }

    return recommendations;
  }

  /**
   * Helper methods
   */
  private getAnalysisPeriod(moods: DailyMood[]): string {
    if (moods.length === 0) return "No data";
    
    const dates = moods.map(m => new Date(m.date)).sort((a, b) => a.getTime() - b.getTime());
    const start = dates[0];
    const end = dates[dates.length - 1];
    
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  }

  private calculateEnergyVariance(correlations: MoodTransitCorrelation[]): number {
    const energies = correlations.map(c => c.mood.energy);
    const avg = energies.reduce((sum, e) => sum + e, 0) / energies.length;
    const variance = energies.reduce((sum, e) => sum + Math.pow(e - avg, 2), 0) / energies.length;
    return variance;
  }

  private generateEnhancedPatternName(pattern: string, aspects: PlanetaryAspect[]): string {
    // Analyze the planetary aspects to create specific pattern names
    const planetCounts = new Map<string, number>();
    const aspectTypes = new Map<string, number>();
    
    aspects.forEach(aspect => {
      planetCounts.set(aspect.planet, (planetCounts.get(aspect.planet) || 0) + 1);
      aspectTypes.set(aspect.aspect, (aspectTypes.get(aspect.aspect) || 0) + 1);
    });
    
    // Find dominant planetary influences (top 2)
    const dominantPlanets = [...planetCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([planet]) => planet);
      
    const dominantAspects = [...aspectTypes.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([aspect]) => aspect);

    // Create enhanced pattern name
    if (dominantPlanets.length > 0) {
      if (pattern.includes('Energy alignment')) {
        let enhancedName = `${dominantPlanets.join(' & ')} Energy Alignment`;
        if (dominantAspects.length > 0) {
          enhancedName += ` (${dominantAspects.join(' & ')} aspects)`;
        }
        return enhancedName;
      } else if (pattern.includes('Emotional tone')) {
        let enhancedName = `${dominantPlanets.join(' & ')} Emotional Resonance`;
        if (dominantAspects.length > 0) {
          enhancedName += ` (${dominantAspects.join(' & ')} aspects)`;
        }
        return enhancedName;
      } else if (pattern.includes('Theme-emotion')) {
        let enhancedName = `${dominantPlanets.join(' & ')} Theme Synchronicity`;
        if (dominantAspects.length > 0) {
          enhancedName += ` (${dominantAspects.join(' & ')} aspects)`;
        }
        return enhancedName;
      } else {
        let enhancedName = `${dominantPlanets.join(' & ')} Cosmic Pattern`;
        if (dominantAspects.length > 0) {
          enhancedName += ` (${dominantAspects.join(' & ')} aspects)`;
        }
        return enhancedName;
      }
    }
    
    // Fallback to original pattern name if no dominant planets found
    return pattern;
  }

  private generateDetailedPatternDescription(pattern: string, frequency: number, strength: number, aspects: PlanetaryAspect[]): string {
    const frequencyDesc = frequency > 0.5 ? "frequently" : frequency > 0.3 ? "often" : "sometimes";
    const strengthDesc = strength > 0.8 ? "very strong" : strength > 0.6 ? "strong" : "moderate";
    
    // Analyze the planetary aspects for specific explanations
    const planetCounts = new Map<string, number>();
    const aspectTypes = new Map<string, number>();
    const influences = { positive: 0, negative: 0, neutral: 0 };
    
    aspects.forEach(aspect => {
      planetCounts.set(aspect.planet, (planetCounts.get(aspect.planet) || 0) + 1);
      aspectTypes.set(aspect.aspect, (aspectTypes.get(aspect.aspect) || 0) + 1);
      influences[aspect.emotionalInfluence]++;
    });
    
    // Find dominant planetary influences
    const dominantPlanets = [...planetCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([planet]) => planet);
      
    const dominantAspects = [...aspectTypes.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([aspect]) => aspect);
    
    // Create detailed explanation (pattern name is already enhanced)
    let description = `This pattern appears ${frequencyDesc} with ${strengthDesc} correlation (${Math.round(frequency * 100)}% of days, ${Math.round(strength * 100)}% match strength). `;
    
    if (dominantPlanets.length > 0) {
      if (pattern.includes('Energy alignment')) {
        description += `Your energy levels consistently align with **${dominantPlanets.join(' and ')} transits**`;
        if (dominantAspects.length > 0) {
          description += `, particularly during **${dominantAspects.join(' and ')} aspects**`;
        }
        description += '. This suggests you naturally attune to these planetary energies, feeling more energized when they activate your birth chart.';
      } else if (pattern.includes('Emotional tone')) {
        description += `Your emotional state resonates strongly with **${dominantPlanets.join(' and ')} influences**`;
        if (influences.positive > influences.negative) {
          description += ', especially during **harmonious aspects** that bring emotional balance and positive feelings.';
        } else if (influences.negative > influences.positive) {
          description += ', including **challenging aspects** that intensify your emotional responses and require conscious navigation.';
        }
      } else if (pattern.includes('Theme-emotion')) {
        description += `The cosmic themes you experience align with **${dominantPlanets.join(' and ')} energies**, indicating these planets significantly influence your daily emotional experience and reactions to life events.`;
      } else {
        description += `This alignment primarily involves **${dominantPlanets.join(' and ')} energies**`;
        if (dominantAspects.length > 0) {
          description += ` through **${dominantAspects.join(' and ')} aspects**`;
        }
        description += ', showing a consistent response pattern to these specific planetary influences.';
      }
    } else {
      description += 'This represents a general alignment with cosmic energies, though the specific planetary influences vary.';
    }
    
    return description;
  }

  /**
   * Helper method to find most common item in array
   */
  private getMostCommon(items: string[]): string {
    if (items.length === 0) return '';
    
    const counts = new Map<string, number>();
    items.forEach(item => {
      counts.set(item, (counts.get(item) || 0) + 1);
    });
    
    let maxCount = 0;
    let mostCommon = '';
    
    for (const [item, count] of counts) {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = item;
      }
    }
    
    return mostCommon;
  }

  /**
   * Generate weekly insight based on planetary influences and mood patterns
   */
  private generateWeeklyInsight(weekday: string, avgMood: number, avgEnergy: number, avgCorrelation: number, dominantPlanet: string, planetaryInfluences: any[]): string {
    if (!dominantPlanet) {
      return `Your ${weekday}s show average mood of ${avgMood.toFixed(1)} and energy of ${avgEnergy.toFixed(1)}, but we need more data to identify planetary patterns.`;
    }
    
    const moodDesc = avgMood >= 7 ? 'excellent' : avgMood >= 5 ? 'balanced' : 'challenging';
    const energyDesc = avgEnergy >= 7 ? 'high' : avgEnergy >= 5 ? 'moderate' : 'low';
    const correlationDesc = avgCorrelation >= 0.7 ? 'strongly aligned' : avgCorrelation >= 0.5 ? 'moderately aligned' : 'loosely aligned';
    
    let insight = `Your ${weekday}s tend to be ${moodDesc} mood days with ${energyDesc} energy levels. `;
    
    if (planetaryInfluences.length > 0) {
      const topInfluence = planetaryInfluences[0];
      insight += `**${dominantPlanet}** is your dominant planetary influence on ${weekday}s, primarily through **${topInfluence.aspectType} aspects**. `;
      
      if (avgCorrelation >= 0.6) {
        insight += `Your cosmic alignment is ${correlationDesc} on these days, suggesting ${dominantPlanet} energy resonates well with your natural rhythms.`;
      } else {
        insight += `While ${dominantPlanet} is active, your alignment varies - this planet may require more conscious attention on ${weekday}s.`;
      }
    }
    
    return insight;
  }

  /**
   * Analyze lunar patterns for a specific weekday
   */
  private analyzeLunarPatternsForWeekday(dates: string[], moods: number[], energies: number[]): {
    dominantPhase: string;
    phaseFrequencies: Array<{
      phase: string;
      frequency: number;
      avgMood: number;
      avgEnergy: number;
    }>;
    lunarInsight: string;
  } {
    if (dates.length === 0) {
      return {
        dominantPhase: '',
        phaseFrequencies: [],
        lunarInsight: 'No lunar data available.'
      };
    }
    
    // Calculate lunar data for each date and group by phase
    const phaseData = new Map<string, { moods: number[], energies: number[] }>();
    
    dates.forEach((dateStr, index) => {
      const lunarData = this.lunarService.getLunarData(new Date(dateStr));
      const phase = lunarData.phase;
      
      if (!phaseData.has(phase)) {
        phaseData.set(phase, { moods: [], energies: [] });
      }
      
      phaseData.get(phase)!.moods.push(moods[index]);
      phaseData.get(phase)!.energies.push(energies[index]);
    });
    
    // Calculate frequencies and averages
    const phaseFrequencies = [...phaseData.entries()].map(([phase, data]) => {
      const avgMood = data.moods.reduce((sum, m) => sum + m, 0) / data.moods.length;
      const avgEnergy = data.energies.reduce((sum, e) => sum + e, 0) / data.energies.length;
      const frequency = data.moods.length / dates.length;
      
      return {
        phase,
        frequency,
        avgMood: Number(avgMood.toFixed(1)),
        avgEnergy: Number(avgEnergy.toFixed(1))
      };
    }).sort((a, b) => b.frequency - a.frequency);
    
    const dominantPhase = phaseFrequencies.length > 0 ? phaseFrequencies[0].phase : '';
    
    // Generate insight
    let lunarInsight = '';
    if (dominantPhase) {
      const dominantData = phaseFrequencies[0];
      const lunarPattern = this.lunarService.getLunarPatternDescription(dominantPhase);
      const phaseName = this.lunarService.getMoonPhaseIcon(dominantPhase) + ' ' + lunarPattern.name;
      lunarInsight = `Most commonly occurs during **${phaseName}** (${Math.round(dominantData.frequency * 100)}% of the time) with avg mood ${dominantData.avgMood}/10.`;
    } else {
      lunarInsight = 'No dominant lunar pattern detected for this day of the week.';
    }
    
    return {
      dominantPhase,
      phaseFrequencies,
      lunarInsight
    };
  }

  /**
   * Generate enhanced weekly insight with lunar integration
   */
  private generateWeeklyInsightWithLunar(
    weekday: string, 
    avgMood: number, 
    avgEnergy: number, 
    avgCorrelation: number, 
    dominantPlanet: string, 
    planetaryInfluences: any[], 
    lunarPatterns: any
  ): string {
    const basicInsight = this.generateWeeklyInsight(weekday, avgMood, avgEnergy, avgCorrelation, dominantPlanet, planetaryInfluences);
    
    if (lunarPatterns.dominantPhase) {
      const moonIcon = this.lunarService.getMoonPhaseIcon(lunarPatterns.dominantPhase);
      const lunarPattern = this.lunarService.getLunarPatternDescription(lunarPatterns.dominantPhase);
      const phaseName = lunarPattern.name;
      
      return `${basicInsight} ${moonIcon} **Lunar Pattern**: Your ${weekday}s most commonly align with **${phaseName}** energy.`;
    }
    
    return basicInsight;
  }

  /**
   * Get phase name from phase key
   */
  private getPhaseName(phase: string): string {
    const names: Record<string, string> = {
      'new': 'New Moon',
      'waxing_crescent': 'Waxing Crescent',
      'first_quarter': 'First Quarter',
      'waxing_gibbous': 'Waxing Gibbous',
      'full': 'Full Moon',
      'waning_gibbous': 'Waning Gibbous',
      'last_quarter': 'Last Quarter',
      'waning_crescent': 'Waning Crescent'
    };
    return names[phase] || 'Unknown';
  }

  /**
   * Analyze lunar influences and patterns for overview display
   */
  private analyzeLunarInfluences(moods: DailyMood[], transits: DailyTransit[]): CorrelationAnalysis['lunarInfluences'] {
    // Prepare mood data with dates for lunar analysis
    const moodData = moods.map(mood => ({
      date: mood.date,
      mood: mood.mood,
      energy: mood.energy,
      moonPhase: mood.moonPhase,
      moonIllumination: mood.moonIllumination
    }));

    // Get comprehensive lunar analysis
    const lunarCorrelations = this.lunarService.analyzeMoonPhaseCorrelations(moodData);
    
    // Get current moon data
    const currentMoonData = this.lunarService.getLunarData(new Date());
    
    // Calculate lunar-planetary harmony
    const lunarPlanetaryHarmony = this.calculateLunarPlanetaryHarmony(moods, transits);
    
    // Map phase correlations to the expected format
    const moonPhaseCorrelations = lunarCorrelations.phaseCorrelations.map(correlation => ({
      phase: correlation.phase,
      phaseName: this.getPhaseName(correlation.phase),
      avgMood: correlation.avgMood,
      avgEnergy: correlation.avgEnergy,
      frequency: correlation.frequency,
      significance: correlation.significance
    }));
    
    // Generate lunar insights
    const insights = [
      ...lunarCorrelations.insights,
      this.generateLunarPlanetaryHarmonyInsight(lunarPlanetaryHarmony),
      this.generateCurrentMoonInsight(currentMoonData)
    ].filter(Boolean);

    return {
      overallLunarSensitivity: lunarCorrelations.lunarSensitivity,
      dominantMoonPhase: lunarCorrelations.dominantPhase,
      moonPhaseCorrelations,
      currentMoonData: {
        phase: currentMoonData.phase,
        phaseName: currentMoonData.phaseName,
        illumination: currentMoonData.illumination,
        sign: currentMoonData.sign,
        influence: this.describeLunarInfluence(currentMoonData.lunarInfluence)
      },
      lunarPlanetaryHarmony,
      insights
    };
  }

  /**
   * Calculate how well lunar and planetary patterns align
   */
  private calculateLunarPlanetaryHarmony(moods: DailyMood[], transits: DailyTransit[]): number {
    if (moods.length < 7) return 0.5; // Default neutral harmony for insufficient data
    
    let harmonyScore = 0;
    let totalDays = 0;
    
    moods.forEach(mood => {
      const transit = transits.find(t => t.date === mood.date);
      if (!transit || !mood.moonPhase) return;
      
      totalDays++;
      
      // Get lunar data for this date
      const lunarData = this.lunarService.getLunarData(new Date(mood.date));
      
      // Check if high mood days align with beneficial lunar-planetary combinations
      if (mood.mood >= 7) {
        // Full moon or new moon with high mood suggests good lunar sensitivity
        if (lunarData.phase === 'full' || lunarData.phase === 'new') {
          harmonyScore += 0.8;
        }
        // Waxing phases with high mood suggest good building energy alignment
        else if (['waxing_crescent', 'first_quarter', 'waxing_gibbous'].includes(lunarData.phase)) {
          harmonyScore += 0.6;
        }
        else {
          harmonyScore += 0.4;
        }
      } else if (mood.mood <= 4) {
        // Low mood during challenging phases is normal
        if (['last_quarter', 'waning_crescent'].includes(lunarData.phase)) {
          harmonyScore += 0.3; // Some harmony in recognizing release phases
        }
      } else {
        // Neutral mood gets neutral harmony
        harmonyScore += 0.5;
      }
    });
    
    return totalDays > 0 ? harmonyScore / totalDays : 0.5;
  }

  /**
   * Describe lunar influence in readable terms
   */
  private describeLunarInfluence(lunarInfluence: any): string {
    if (!lunarInfluence) return 'Balanced cosmic energy';
    
    const { energy, emotional, manifestation } = lunarInfluence;
    
    if (energy === 'building' && emotional === 'heightened') {
      return 'Building energy and heightened emotions';
    } else if (energy === 'releasing' && emotional === 'calm') {
      return 'Releasing energy and calming influence';
    } else if (energy === 'stable' && manifestation === 'harvesting') {
      return 'Stable energy perfect for manifestation';
    } else if (energy === 'stable' && manifestation === 'planting') {
      return 'Stable energy ideal for new beginnings';
    }
    
    return `${energy.charAt(0).toUpperCase() + energy.slice(1)} energy with ${emotional} emotional tone`;
  }

  /**
   * Generate insight about lunar-planetary harmony
   */
  private generateLunarPlanetaryHarmonyInsight(harmony: number): string {
    if (harmony > 0.7) {
      return '🌟 **Excellent Cosmic Harmony**: Your lunar and planetary patterns work together beautifully, amplifying positive influences.';
    } else if (harmony > 0.5) {
      return '⚖️ **Good Cosmic Balance**: Your lunar and planetary energies complement each other well most of the time.';
    } else if (harmony > 0.3) {
      return '🌓 **Mixed Cosmic Energies**: Your lunar and planetary patterns sometimes conflict - awareness can help you navigate these times.';
    } else {
      return '🌑 **Challenging Harmony**: Your lunar and planetary energies often work in different directions - consider tracking patterns for better alignment.';
    }
  }

  /**
   * Generate insight about current moon phase
   */
  private generateCurrentMoonInsight(moonData: any): string {
    const today = new Date().toLocaleDateString();
    const phaseIcon = this.lunarService.getMoonPhaseIcon(moonData.phase);
    
    return `${phaseIcon} **Today's Moon (${today})**: ${moonData.phaseName} in ${moonData.sign} (${moonData.illumination}% illuminated) brings ${moonData.lunarInfluence.energy} energy.`;
  }

  /**
   * Analyze planetary influence patterns to identify dominant influences
   */
  private analyzePlanetaryInfluences(moodData: DailyMood[], transitData: DailyTransit[]): {
    dominantPlanet: string;
    dominantCorrelation: number;
    planetaryInfluences: Array<{
      planet: string;
      correlation: number;
      aspectTypes: string[];
      avgMoodImpact: number;
      significantDays: number;
    }>;
    insights: string[];
  } {
    const planetaryStats: Record<string, {
      correlations: number[];
      aspectTypes: Set<string>;
      moodImpacts: number[];
      dayCount: number;
    }> = {};
    
    const insights: string[] = [];
    
    // Analyze each day for planetary correlations
    for (let i = 0; i < moodData.length; i++) {
      const mood = moodData[i];
      const transit = transitData.find(t => t.date === mood.date);
      
      if (transit) {
        const aspects = this.extractPlanetaryAspects(transit);
        
        for (const aspect of aspects) {
          const planet = aspect.planet;
          
          if (!planetaryStats[planet]) {
            planetaryStats[planet] = {
              correlations: [],
              aspectTypes: new Set(),
              moodImpacts: [],
              dayCount: 0
            };
          }
          
          // Calculate mood impact based on aspect type and user's mood
          const moodImpact = this.calculatePlanetaryMoodImpact(mood, aspect);
          const correlation = this.calculateAspectCorrelation(mood, aspect);
          
          planetaryStats[planet].correlations.push(correlation);
          planetaryStats[planet].aspectTypes.add(aspect.aspect);
          planetaryStats[planet].moodImpacts.push(moodImpact);
          planetaryStats[planet].dayCount++;
        }
      }
    }
    
    // Calculate averages and identify dominant planet
    let dominantPlanet = '';
    let dominantCorrelation = 0;
    
    const planetaryInfluences = Object.entries(planetaryStats).map(([planet, stats]) => {
      const avgCorrelation = stats.correlations.reduce((a, b) => a + b, 0) / stats.correlations.length || 0;
      const avgMoodImpact = stats.moodImpacts.reduce((a, b) => a + b, 0) / stats.moodImpacts.length || 0;
      
      if (avgCorrelation > dominantCorrelation && stats.dayCount >= 1) {
        dominantCorrelation = avgCorrelation;
        dominantPlanet = planet;
      }
      
      return {
        planet,
        correlation: avgCorrelation,
        aspectTypes: Array.from(stats.aspectTypes),
        avgMoodImpact,
        significantDays: stats.dayCount
      };
    }).sort((a, b) => b.correlation - a.correlation);
    
    // Generate insights
    if (dominantPlanet && dominantCorrelation > 0.5) {
      insights.push(`Your moods are most influenced by **${dominantPlanet} transits** (${(dominantCorrelation * 100).toFixed(0)}% correlation)`);
    }
    
    // Find patterns in aspect types
    const mostResponsiveAspects = planetaryInfluences
      .filter(p => p.significantDays >= 1)
      .slice(0, 2);
    
    for (const responsive of mostResponsiveAspects) {
      if (responsive.aspectTypes.includes('trine') || responsive.aspectTypes.includes('sextile')) {
        insights.push(`You tend to feel happiest during **${responsive.planet} harmonious aspects**`);
      }
      if (responsive.aspectTypes.includes('square') || responsive.aspectTypes.includes('opposition')) {
        insights.push(`**${responsive.planet} challenging aspects** correlate with mood shifts`);
      }
    }
    
    return {
      dominantPlanet,
      dominantCorrelation,
      planetaryInfluences,
      insights
    };
  }
  
  /**
   * Calculate how much a planetary aspect impacts mood
   */
  private calculatePlanetaryMoodImpact(mood: DailyMood, aspect: any): number {
    const baseImpact = aspect.significance === 'high' ? 0.8 : 
                      aspect.significance === 'medium' ? 0.5 : 0.3;
    
    // Adjust based on emotional influence
    const emotionalMultiplier = aspect.emotionalInfluence === 'positive' ? 1.2 :
                               aspect.emotionalInfluence === 'negative' ? 0.8 : 1.0;
    
    // Factor in user's actual mood level
    const moodFactor = mood.mood / 5; // Normalize to 0-1
    
    return baseImpact * emotionalMultiplier * moodFactor;
  }
  
  /**
   * Calculate correlation between mood and specific aspect
   */
  private calculateAspectCorrelation(mood: DailyMood, aspect: any): number {
    let correlation = 0;
    
    // Base correlation from aspect type
    if (aspect.emotionalInfluence === 'positive' && mood.mood >= 4) {
      correlation += 0.7;
    } else if (aspect.emotionalInfluence === 'negative' && mood.mood <= 2) {
      correlation += 0.7;
    } else if (aspect.emotionalInfluence === 'neutral') {
      correlation += 0.4;
    }
    
    // Adjust for significance
    if (aspect.significance === 'high') {
      correlation *= 1.3;
    } else if (aspect.significance === 'low') {
      correlation *= 0.7;
    }
    
    return Math.min(correlation, 1.0);
  }
}

export const correlationService = new CorrelationService();