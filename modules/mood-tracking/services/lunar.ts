/**
 * Lunar Service - Calculate moon phases, illumination, and astrological influence
 */

export interface LunarData {
  phase: string;
  phaseName: string;
  illumination: number; // 0-100 percentage
  sign: string;
  ageInDays: number;
  lunarInfluence: {
    energy: 'building' | 'releasing' | 'stable';
    emotional: 'heightened' | 'calm' | 'introspective';
    manifestation: 'planting' | 'growing' | 'harvesting' | 'releasing';
  };
}

export interface MoonPhaseCorrelation {
  phase: string;
  frequency: number;
  avgMood: number;
  avgEnergy: number;
  significance: 'high' | 'medium' | 'low';
}

export class LunarService {
  /**
   * Calculate lunar data for a given date
   */
  getLunarData(date: Date): LunarData {
    const lunarCycle = 29.53058867; // Average lunar cycle in days
    const knownNewMoon = new Date('2000-01-06T18:14:00Z'); // Known new moon reference
    
    const daysSinceKnownNewMoon = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
    const lunarAge = ((daysSinceKnownNewMoon % lunarCycle) + lunarCycle) % lunarCycle;
    
    const illumination = this.calculateIllumination(lunarAge, lunarCycle);
    const phase = this.getPhaseFromAge(lunarAge, lunarCycle);
    const phaseName = this.getPhaseName(phase);
    const sign = this.getMoonSign(date);
    const lunarInfluence = this.getLunarInfluence(phase, illumination);
    
    return {
      phase,
      phaseName,
      illumination: Math.round(illumination * 100),
      sign,
      ageInDays: Math.round(lunarAge * 10) / 10,
      lunarInfluence
    };
  }

  /**
   * Get moon phase icon for UI display
   */
  getMoonPhaseIcon(phase: string): string {
    const icons: Record<string, string> = {
      'new': '🌑',
      'waxing_crescent': '🌒',
      'first_quarter': '🌓',
      'waxing_gibbous': '🌔',
      'full': '🌕',
      'waning_gibbous': '🌖',
      'last_quarter': '🌗',
      'waning_crescent': '🌘'
    };
    return icons[phase] || '🌙';
  }

  /**
   * Analyze mood correlations with moon phases
   */
  analyzeMoonPhaseCorrelations(moodData: Array<{
    date: string;
    mood: number;
    energy: number;
    moonPhase?: string;
    moonIllumination?: number;
  }>): {
    phaseCorrelations: MoonPhaseCorrelation[];
    insights: string[];
    dominantPhase: string;
    lunarSensitivity: number;
  } {
    // Calculate lunar data for entries missing it
    const enrichedData = moodData.map(entry => {
      if (!entry.moonPhase) {
        const lunarData = this.getLunarData(new Date(entry.date));
        return {
          ...entry,
          moonPhase: lunarData.phase,
          moonIllumination: lunarData.illumination
        };
      }
      return entry;
    });

    // Group by moon phase
    const phaseGroups = new Map<string, Array<{ mood: number; energy: number }>>();
    
    enrichedData.forEach(entry => {
      if (!phaseGroups.has(entry.moonPhase!)) {
        phaseGroups.set(entry.moonPhase!, []);
      }
      phaseGroups.get(entry.moonPhase!)!.push({
        mood: entry.mood,
        energy: entry.energy
      });
    });

    // Calculate correlations for each phase
    const phaseCorrelations: MoonPhaseCorrelation[] = [];
    let highestCorrelation = 0;
    let dominantPhase = '';

    for (const [phase, entries] of phaseGroups) {
      if (entries.length < 1) continue; // Allow single entries for better pattern detection

      const avgMood = entries.reduce((sum, e) => sum + e.mood, 0) / entries.length;
      const avgEnergy = entries.reduce((sum, e) => sum + e.energy, 0) / entries.length;
      const frequency = entries.length / enrichedData.length;
      
      // Calculate significance based on variance from overall average
      const overallAvgMood = enrichedData.reduce((sum, e) => sum + e.mood, 0) / enrichedData.length;
      const overallAvgEnergy = enrichedData.reduce((sum, e) => sum + e.energy, 0) / enrichedData.length;
      
      const moodVariance = Math.abs(avgMood - overallAvgMood);
      const energyVariance = Math.abs(avgEnergy - overallAvgEnergy);
      const significance = this.getSignificance(moodVariance + energyVariance, frequency);
      
      const correlation = (moodVariance + energyVariance) * frequency;
      if (correlation > highestCorrelation) {
        highestCorrelation = correlation;
        dominantPhase = phase;
      }

      phaseCorrelations.push({
        phase,
        frequency,
        avgMood: Number(avgMood.toFixed(1)),
        avgEnergy: Number(avgEnergy.toFixed(1)),
        significance
      });
    }

    // Calculate lunar sensitivity
    const lunarSensitivity = this.calculateLunarSensitivity(phaseCorrelations);
    
    // Generate insights
    const insights = this.generateLunarInsights(phaseCorrelations, dominantPhase, lunarSensitivity);

    return {
      phaseCorrelations: phaseCorrelations.sort((a, b) => b.frequency - a.frequency),
      insights,
      dominantPhase,
      lunarSensitivity
    };
  }

  /**
   * Private helper methods
   */
  private calculateIllumination(lunarAge: number, lunarCycle: number): number {
    const phase = (lunarAge / lunarCycle) * 2 * Math.PI;
    return (1 - Math.cos(phase)) / 2;
  }

  private getPhaseFromAge(lunarAge: number, lunarCycle: number): string {
    const percentage = lunarAge / lunarCycle;
    
    if (percentage < 0.0625) return 'new';
    if (percentage < 0.1875) return 'waxing_crescent';
    if (percentage < 0.3125) return 'first_quarter';
    if (percentage < 0.4375) return 'waxing_gibbous';
    if (percentage < 0.5625) return 'full';
    if (percentage < 0.6875) return 'waning_gibbous';
    if (percentage < 0.8125) return 'last_quarter';
    if (percentage < 0.9375) return 'waning_crescent';
    return 'new';
  }

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
   * Get lunar pattern descriptions like planetary patterns
   */
  getLunarPatternDescription(phase: string): { name: string; description: string; energy: string } {
    const patterns: Record<string, { name: string; description: string; energy: string }> = {
      'new': {
        name: 'New Moon Reset',
        description: 'Fresh starts and new intentions manifest most powerfully',
        energy: 'introspective and visionary'
      },
      'waxing_crescent': {
        name: 'Crescent Growth',
        description: 'Building momentum with gentle forward progress',
        energy: 'hopeful and determined'
      },
      'first_quarter': {
        name: 'Quarter Challenge',
        description: 'Pushing through obstacles with decisive action',
        energy: 'focused and assertive'
      },
      'waxing_gibbous': {
        name: 'Gibbous Refinement',
        description: 'Fine-tuning and perfecting your ongoing projects',
        energy: 'productive and detail-oriented'
      },
      'full': {
        name: 'Full Moon Peak',
        description: 'Maximum emotional intensity and manifestation power',
        energy: 'heightened and culminative'
      },
      'waning_gibbous': {
        name: 'Grateful Release',
        description: 'Sharing wisdom and releasing what no longer serves',
        energy: 'generous and reflective'
      },
      'last_quarter': {
        name: 'Quarter Forgiveness',
        description: 'Letting go of past patterns and forgiving limitations',
        energy: 'releasing and cleansing'
      },
      'waning_crescent': {
        name: 'Crescent Wisdom',
        description: 'Quiet contemplation and spiritual insight emerge',
        energy: 'wise and introspective'
      }
    };
    
    return patterns[phase] || { 
      name: 'Unknown Lunar Pattern', 
      description: 'Unique cosmic energy pattern not yet identified',
      energy: 'mysterious and undefined'
    };
  }

  private getMoonSign(date: Date): string {
    // Moon moves through all 12 signs in ~27.3 days (about 2.3 days per sign)
    const startDate = new Date('2000-01-06'); // Arbitrary start date when moon was in Aries
    const daysDiff = (date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Moon completes a full cycle through all signs every 27.3 days
    const lunarCycleDays = 27.32;
    const daysIntoSign = daysDiff % lunarCycleDays;
    
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    
    // Each sign gets about 2.28 days (27.32 / 12)
    const daysPerSign = lunarCycleDays / 12;
    const signIndex = Math.floor(daysIntoSign / daysPerSign) % 12;
    return signs[signIndex] || 'Aries';
  }

  private getLunarInfluence(phase: string, illumination: number): LunarData['lunarInfluence'] {
    const waxingPhases = ['new', 'waxing_crescent', 'first_quarter', 'waxing_gibbous'];
    const waningPhases = ['waning_gibbous', 'last_quarter', 'waning_crescent'];
    
    let energy: 'building' | 'releasing' | 'stable';
    let emotional: 'heightened' | 'calm' | 'introspective';
    let manifestation: 'planting' | 'growing' | 'harvesting' | 'releasing';
    
    if (phase === 'new') {
      energy = 'stable';
      emotional = 'introspective';
      manifestation = 'planting';
    } else if (waxingPhases.includes(phase)) {
      energy = 'building';
      emotional = 'heightened';
      manifestation = 'growing';
    } else if (phase === 'full') {
      energy = 'stable';
      emotional = 'heightened';
      manifestation = 'harvesting';
    } else {
      energy = 'releasing';
      emotional = 'calm';
      manifestation = 'releasing';
    }
    
    return { energy, emotional, manifestation };
  }

  private getSignificance(variance: number, frequency: number): 'high' | 'medium' | 'low' {
    const significanceScore = variance * frequency;
    // More generous thresholds for small datasets
    if (significanceScore > 0.8) return 'high';
    if (significanceScore > 0.3) return 'medium';
    return 'low';
  }

  private calculateLunarSensitivity(correlations: MoonPhaseCorrelation[]): number {
    if (correlations.length === 0) return 0;
    
    const highSignificanceCount = correlations.filter(c => c.significance === 'high').length;
    const mediumSignificanceCount = correlations.filter(c => c.significance === 'medium').length;
    const lowSignificanceCount = correlations.filter(c => c.significance === 'low').length;
    
    // More realistic sensitivity calculation with credit for low significance too
    const weightedScore = (highSignificanceCount * 1.0 + mediumSignificanceCount * 0.6 + lowSignificanceCount * 0.2);
    const maxPossibleScore = correlations.length * 1.0;
    
    return Math.min(weightedScore / maxPossibleScore, 1.0);
  }

  private generateLunarInsights(
    correlations: MoonPhaseCorrelation[], 
    dominantPhase: string, 
    sensitivity: number
  ): string[] {
    const insights: string[] = [];
    
    if (sensitivity > 0.6) {
      insights.push("🌙 You show strong lunar sensitivity - moon phases significantly influence your mood patterns.");
    } else if (sensitivity > 0.3) {
      insights.push("🌓 You have moderate lunar awareness - certain moon phases affect your energy more than others.");
    } else {
      insights.push("🌑 Your mood patterns appear less influenced by lunar cycles, suggesting other cosmic factors dominate.");
    }
    
    if (dominantPhase) {
      const phaseData = correlations.find(c => c.phase === dominantPhase);
      if (phaseData) {
        const lunarPattern = this.getLunarPatternDescription(dominantPhase);
        insights.push(`✨ Your strongest lunar connection is with **${lunarPattern.name}** - ${lunarPattern.description.toLowerCase()}.`);
      }
    }
    
    // Find extreme phases
    const highestMood = correlations.reduce((max, c) => c.avgMood > max.avgMood ? c : max, correlations[0]);
    const lowestMood = correlations.reduce((min, c) => c.avgMood < min.avgMood ? c : min, correlations[0]);
    
    if (highestMood && lowestMood && highestMood.phase !== lowestMood.phase) {
      const highPattern = this.getLunarPatternDescription(highestMood.phase);
      const lowPattern = this.getLunarPatternDescription(lowestMood.phase);
      insights.push(`🌟 Your mood peaks during **${highPattern.name}** and dips during **${lowPattern.name}**.`);
    }
    
    return insights;
  }
}