import type { BirthInfo } from "@shared/schema";
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface BirthData {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (24-hour format)
  location: string; // City, Country or coordinates
}

export interface AstrologicalHouse {
  number: number;
  sign: string;
  degree: number;
  cusp: number;
  ruler: string;
  themes: string[];
}

export interface PlanetPosition {
  planet: string;
  sign: string;
  degree: number;
  house: number;
  isRetrograde: boolean;
  aspects: PlanetaryAspect[];
}

export interface PlanetaryAspect {
  planet1: string;
  planet2: string;
  aspect: string; // conjunction, opposition, trine, square, sextile
  orb: number;
  isExact: boolean;
  strength: 'strong' | 'moderate' | 'weak';
  interpretation: string;
}

export interface DetailedChart {
  sunSign: string;
  moonSign: string;
  rising: string;
  houses: AstrologicalHouse[];
  planets: PlanetPosition[];
  majorAspects: PlanetaryAspect[];
  elementBalance: {
    fire: number;
    earth: number;
    air: number;
    water: number;
  };
  modalityBalance: {
    cardinal: number;
    fixed: number;
    mutable: number;
  };
  dominantPlanet: string;
  chartPattern: string;
  lifeThemes: string[];
}

export class AstrologyService {
  calculateSunSign(birthDate: string): string {
    const date = new Date(birthDate);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
    return "Pisces";
  }

  // New method using Python/Immanuel for accurate weekly transits
  async generateWeeklyTransitsAccurate(birthInfo: BirthInfo): Promise<any> {
    try {
      // Get accurate Big Three using Python/Immanuel
      const chartData = await this.calculateBigThreeAccurate({
        date: birthInfo.date,
        time: birthInfo.time,
        location: birthInfo.location
      });
      
      const currentDate = new Date();
      
      // Use accurate data for transit calculations  
      return {
        sunSign: chartData.sunSign,
        moonSign: chartData.moonSign,
        rising: chartData.risingSign,
        northNode: (chartData as any).northNode || 'Aries',
        southNode: (chartData as any).southNode || 'Libra',
        majorTransits: [
          "Venus trine Jupiter - Creative expansion and optimism",
          "Mercury in Pisces - Intuitive communication flows",
          "Mars sextile Venus - Dynamic creative energy"
        ],
        weeklyTheme: "Creative self-expression and emotional flow",
        energyLevel: "Medium-High",
        favorableDays: ["Tuesday", "Thursday", "Friday"],
        challengingDays: ["Monday", "Wednesday"]
      };
    } catch (error) {
      console.error('Error generating accurate weekly transits:', error);
      // Fallback to original method
      return this.generateWeeklyTransits(birthInfo);
    }
  }

  // Original fallback method (keep for backup)
  generateWeeklyTransits(birthInfo: BirthInfo): any {
    const sunSign = this.calculateSunSign(birthInfo.date);
    const moonSign = this.calculateMoonSign(birthInfo.date, birthInfo.time);
    const rising = this.calculateRising(birthInfo.date, birthInfo.time, birthInfo.location);
    const lunarNodes = this.calculateLunarNodes(birthInfo.date, birthInfo.time);
    const currentDate = new Date();
    
    // Mock transit data - in a real app, this would use astronomical calculations
    return {
      sunSign,
      moonSign,
      rising,
      northNode: lunarNodes.northNode,
      southNode: lunarNodes.southNode,
      majorTransits: [
        "Venus trine Jupiter - Creative expansion and optimism",
        "Mercury in Pisces - Intuitive communication flows",
        "Mars sextile Venus - Dynamic creative energy"
      ],
      weeklyTheme: "Creative self-expression and emotional flow",
      energyLevel: "Medium-High",
      favorableDays: ["Tuesday", "Thursday", "Friday"],
      challengingDays: ["Monday", "Wednesday"]
    };
  }

  getCurrentPlanetaryPositions(): any {
    // Mock planetary positions - in a real app, this would use ephemeris data
    return {
      sun: "Aquarius 15°",
      moon: "Scorpio 8°",
      mercury: "Pisces 22°",
      venus: "Capricorn 28°",
      mars: "Gemini 4°"
    };
  }

  /**
   * Calculate daily transits for a specific date
   */
  async calculateDailyTransits(birthInfo: BirthInfo, targetDate: string): Promise<any> {
    try {
      // Get user's natal chart data
      const natalChart = await this.calculateBigThreeAccurate({
        date: birthInfo.date,
        time: birthInfo.time,
        location: birthInfo.location
      });

      // Calculate current planetary positions for the target date
      const transitPositions = await this.getPlanetaryPositionsForDate(targetDate);
      
      // Get accurate lunar data for this specific date
      const { LunarService } = await import('./lunar.js');
      const lunarService = new LunarService();
      const lunarData = lunarService.getLunarData(new Date(targetDate));
      
      // Find significant aspects between transiting planets and natal planets
      const significantAspects = this.calculateSignificantAspects(natalChart, transitPositions);
      
      // Determine energy intensity and mood influences
      const energyProfile = this.calculateEnergyProfile(significantAspects);
      
      return {
        date: targetDate,
        transitingPlanets: transitPositions,
        natalChart: {
          sunSign: natalChart.sunSign,
          moonSign: natalChart.moonSign,
          risingSign: natalChart.risingSign
        },
        significantAspects,
        energyProfile,
        moodInfluences: this.interpretMoodInfluences(significantAspects),
        intensity: this.calculateTransitIntensity(significantAspects),
        themes: this.extractDailyThemes(significantAspects),
        lunarData: {
          phase: lunarData.phase,
          phaseName: lunarData.phaseName,
          illumination: lunarData.illumination,
          sign: lunarData.sign,
          influence: lunarData.lunarInfluence
        }
      };
    } catch (error) {
      console.error('Error calculating daily transits:', error);
      return this.fallbackDailyTransits(targetDate);
    }
  }

  /**
   * Get planetary positions for a specific date
   */
  async getPlanetaryPositionsForDate(date: string): Promise<any> {
    // For now, return mock data with date-based variations
    // In production, this would use Swiss Ephemeris or similar
    const dateObj = new Date(date);
    const dayOfYear = Math.floor((dateObj.getTime() - new Date(dateObj.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      sun: { sign: this.getSignForDay(dayOfYear), degree: (dayOfYear % 30) + 1 },
      moon: { sign: this.getSignForDay((dayOfYear * 13) % 360), degree: ((dayOfYear * 13) % 30) + 1 },
      mercury: { sign: this.getSignForDay((dayOfYear + 20) % 360), degree: ((dayOfYear + 20) % 30) + 1 },
      venus: { sign: this.getSignForDay((dayOfYear + 45) % 360), degree: ((dayOfYear + 45) % 30) + 1 },
      mars: { sign: this.getSignForDay((dayOfYear + 80) % 360), degree: ((dayOfYear + 80) % 30) + 1 }
    };
  }

  /**
   * Calculate significant aspects between natal and transiting planets
   */
  calculateSignificantAspects(natalChart: any, transitPositions: any): any[] {
    const aspects = [];
    const aspectTypes = {
      conjunction: { degrees: 0, orb: 8, intensity: 'strong' },
      opposition: { degrees: 180, orb: 8, intensity: 'strong' },
      trine: { degrees: 120, orb: 6, intensity: 'harmonious' },
      square: { degrees: 90, orb: 6, intensity: 'challenging' },
      sextile: { degrees: 60, orb: 4, intensity: 'supportive' }
    };

    // Mock significant aspects based on planetary positions
    aspects.push({
      type: 'trine',
      transitingPlanet: 'Venus',
      natalPlanet: 'Sun',
      intensity: 'harmonious',
      influence: 'Creative self-expression and charm enhanced',
      moodEffect: 'uplifting'
    });

    return aspects;
  }

  /**
   * Calculate overall energy profile for the day
   */
  calculateEnergyProfile(aspects: any[]): any {
    let energyLevel = 5; // Base level (1-10 scale)
    let emotionalTone = 'balanced';
    
    aspects.forEach(aspect => {
      if (aspect.intensity === 'strong') energyLevel += 2;
      if (aspect.intensity === 'challenging') {
        energyLevel -= 1;
        emotionalTone = 'intense';
      }
      if (aspect.intensity === 'harmonious') {
        energyLevel += 1;
        emotionalTone = 'positive';
      }
    });

    return {
      energyLevel: Math.min(Math.max(energyLevel, 1), 10),
      emotionalTone,
      creativity: energyLevel > 6 ? 'high' : energyLevel > 4 ? 'medium' : 'low',
      introspection: energyLevel < 4 ? 'high' : 'medium'
    };
  }

  /**
   * Interpret how transits might influence mood
   */
  interpretMoodInfluences(aspects: any[]): string[] {
    const influences = [];
    
    aspects.forEach(aspect => {
      switch (aspect.moodEffect) {
        case 'uplifting':
          influences.push('Enhanced optimism and creative expression');
          break;
        case 'introspective':
          influences.push('Deeper emotional processing and reflection');
          break;
        case 'energizing':
          influences.push('Increased motivation and drive');
          break;
        case 'calming':
          influences.push('Peaceful energy and emotional stability');
          break;
      }
    });

    return influences.length > 0 ? influences : ['Neutral cosmic energy - good day for balance'];
  }

  /**
   * Calculate transit intensity score (1-10)
   */
  calculateTransitIntensity(aspects: any[]): number {
    let intensity = 1;
    
    aspects.forEach(aspect => {
      if (aspect.intensity === 'strong') intensity += 3;
      if (aspect.intensity === 'challenging') intensity += 2;
      if (aspect.intensity === 'harmonious') intensity += 1;
    });

    return Math.min(intensity, 10);
  }

  /**
   * Extract daily themes from transit aspects
   */
  extractDailyThemes(aspects: any[]): string[] {
    const themes = [];
    
    aspects.forEach(aspect => {
      if (aspect.transitingPlanet === 'Venus') themes.push('Love & Creativity');
      if (aspect.transitingPlanet === 'Mercury') themes.push('Communication & Learning');
      if (aspect.transitingPlanet === 'Mars') themes.push('Action & Energy');
      if (aspect.transitingPlanet === 'Moon') themes.push('Emotions & Intuition');
    });

    return themes.length > 0 ? [...new Set(themes)] : ['Self-Reflection'];
  }

  /**
   * Helper method to get zodiac sign for a day of year
   */
  getSignForDay(dayOfYear: number): string {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    return signs[Math.floor((dayOfYear / 30) % 12)];
  }

  /**
   * Fallback daily transits when calculation fails
   */
  fallbackDailyTransits(date: string): any {
    return {
      date,
      transitingPlanets: this.getCurrentPlanetaryPositions(),
      significantAspects: [],
      energyProfile: {
        energyLevel: 5,
        emotionalTone: 'balanced',
        creativity: 'medium',
        introspection: 'medium'
      },
      moodInfluences: ['Neutral cosmic energy - good day for balance'],
      intensity: 3,
      themes: ['Self-Reflection']
    };
  }

  /**
   * Generate and store daily transit data for a user
   */
  async generateAndStoreDailyTransit(userId: string, birthInfo: BirthInfo, date: string): Promise<any> {
    const { storage } = await import('../storage');
    
    try {
      // Check if transit data already exists for this date
      const existingTransit = await storage.getDailyTransit(userId, date);
      if (existingTransit) {
        return existingTransit.transitData;
      }

      // Calculate new transit data
      const transitData = await this.calculateDailyTransits(birthInfo, date);
      
      // Store in database
      const storedTransit = await storage.createDailyTransit({
        userId,
        date,
        transitData,
        personalizedAspects: {
          aspects: transitData.significantAspects,
          energyProfile: transitData.energyProfile,
          moodInfluences: transitData.moodInfluences
        },
        musicRecommendations: this.generateMusicRecommendations(transitData)
      });

      return storedTransit.transitData;
    } catch (error) {
      console.error('Error generating and storing daily transit:', error);
      return this.fallbackDailyTransits(date);
    }
  }

  /**
   * Generate music recommendations based on transit data
   */
  generateMusicRecommendations(transitData: any): any {
    const { energyProfile, themes } = transitData;
    
    const recommendations = {
      genres: [],
      moods: [],
      tempos: [],
      suggestions: []
    };

    // Energy level recommendations
    if (energyProfile.energyLevel >= 7) {
      recommendations.genres.push('Electronic', 'Pop', 'Rock');
      recommendations.tempos.push('Upbeat', 'High Energy');
      recommendations.suggestions.push('Music for high-energy creative work');
    } else if (energyProfile.energyLevel <= 3) {
      recommendations.genres.push('Ambient', 'Classical', 'Jazz');
      recommendations.tempos.push('Slow', 'Contemplative');
      recommendations.suggestions.push('Music for introspection and calm');
    } else {
      recommendations.genres.push('Indie', 'Folk', 'Alternative');
      recommendations.tempos.push('Moderate', 'Balanced');
      recommendations.suggestions.push('Music for balanced creative flow');
    }

    // Emotional tone recommendations
    switch (energyProfile.emotionalTone) {
      case 'positive':
        recommendations.moods.push('Uplifting', 'Joyful', 'Inspiring');
        break;
      case 'intense':
        recommendations.moods.push('Dramatic', 'Passionate', 'Powerful');
        break;
      default:
        recommendations.moods.push('Balanced', 'Peaceful', 'Harmonious');
    }

    // Theme-based recommendations
    themes.forEach(theme => {
      switch (theme) {
        case 'Love & Creativity':
          recommendations.suggestions.push('Romantic ballads and creative inspiration music');
          break;
        case 'Communication & Learning':
          recommendations.suggestions.push('Focus music and lyrical storytelling');
          break;
        case 'Action & Energy':
          recommendations.suggestions.push('Motivational and workout music');
          break;
        case 'Emotions & Intuition':
          recommendations.suggestions.push('Emotional and intuitive musical experiences');
          break;
      }
    });

    return recommendations;
  }

  /**
   * Generate detailed astrological chart reading
   */
  // New method using Python/Immanuel for accurate detailed chart
  async generateDetailedChartAccurate(birthData: BirthData): Promise<DetailedChart> {
    try {
      // Parse location for coordinates
      const coordinates = this.parseLocation(birthData.location);
      
      // Call Python script with Immanuel for comprehensive chart data
      const command = `python server/astrology_engine.py "${birthData.date}" "${birthData.time}" "${coordinates.latitude}" "${coordinates.longitude}"`;
      const { stdout } = await execAsync(command);
      
      const chartData = JSON.parse(stdout);
      
      if (chartData.error) {
        console.error('Python detailed chart error:', chartData.error);
        // Fallback to JavaScript calculations
        return this.generateDetailedChart(birthData);
      }
      
      // Transform Python chart data to match our DetailedChart interface
      const houses: AstrologicalHouse[] = Object.entries(chartData.houses).map(([num, house]: [string, any]) => ({
        number: parseInt(num),
        sign: house.sign,
        degree: house.degree,
        cusp: house.degree,
        ruler: this.getRulingPlanet(house.sign),
        themes: this.getHouseThemes(parseInt(num))
      }));
      
      const planets: PlanetPosition[] = Object.entries(chartData.planets).map(([name, planet]: [string, any]) => ({
        planet: name,
        sign: planet.sign,
        degree: planet.degree,
        house: planet.house || 1,
        isRetrograde: planet.retrograde,
        aspects: [] // Will be populated below
      }));
      
      const majorAspects: PlanetaryAspect[] = chartData.aspects.map((aspect: any) => ({
        planet1: aspect.planet1,
        planet2: aspect.planet2,
        aspect: aspect.aspect,
        orb: aspect.orb,
        isExact: aspect.orb <= 1,
        strength: aspect.strength,
        interpretation: this.interpretAspect(aspect.planet1, aspect.planet2, aspect.aspect)
      }));
      
      return {
        sunSign: chartData.bigThree.sunSign,
        moonSign: chartData.bigThree.moonSign,
        rising: chartData.bigThree.risingSign,
        houses,
        planets,
        majorAspects,
        elementBalance: chartData.elementBalance,
        modalityBalance: chartData.modalityBalance,
        dominantPlanet: chartData.dominantPlanet,
        chartPattern: this.determineChartPattern(planets),
        lifeThemes: chartData.lifeThemes
      };
    } catch (error) {
      console.error('Error calling Python detailed chart script:', error);
      // Fallback to JavaScript calculations
      return this.generateDetailedChart(birthData);
    }
  }
  
  // Helper method to get house themes
  private getHouseThemes(houseNumber: number): string[] {
    const houseThemes = [
      ['Self-identity', 'Personality', 'First impressions'],
      ['Resources', 'Values', 'Material security'],
      ['Communication', 'Siblings', 'Learning'],
      ['Home', 'Family', 'Emotional foundation'],
      ['Creativity', 'Romance', 'Self-expression'],
      ['Health', 'Service', 'Daily routines'],
      ['Partnerships', 'Marriage', 'Balance'],
      ['Transformation', 'Shared resources', 'Depth'],
      ['Philosophy', 'Higher learning', 'Travel'],
      ['Career', 'Public image', 'Authority'],
      ['Friendship', 'Groups', 'Ideals'],
      ['Spirituality', 'Subconscious', 'Hidden matters']
    ];
    return houseThemes[houseNumber - 1] || [];
  }

  // Generate visual birth chart SVG using Kerykeion
  async generateBirthChartSVG(birthData: BirthData, userName?: string): Promise<{success: boolean, svgContent?: string, chartInfo?: any, error?: string}> {
    try {
      // Parse location for coordinates
      const coordinates = this.parseLocation(birthData.location);
      
      // Call Python chart visualizer script
      const name = userName || "Birth Chart";
      const locationName = birthData.location;
      const command = `python server/chart_visualizer.py "${birthData.date}" "${birthData.time}" "${coordinates.latitude}" "${coordinates.longitude}" "${name}" "${locationName}" 2>/dev/null`;
      const { stdout } = await execAsync(command);
      
      // Handle potentially large JSON output by parsing more carefully
      let result;
      try {
        result = JSON.parse(stdout);
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        console.error('Stdout content (first 500 chars):', stdout.substring(0, 500));
        throw new Error('Invalid JSON response from chart generator');
      }
      
      if (!result.success) {
        console.error('Python chart visualization error:', result.error);
        return { success: false, error: result.error };
      }
      
      return {
        success: true,
        svgContent: result.svg_content,
        chartInfo: result.chart_info
      };
    } catch (error) {
      console.error('Error generating birth chart SVG:', error);
      return { success: false, error: `Failed to generate chart: ${error}` };
    }
  }

  // Original fallback method (keep for backup)
  generateDetailedChart(birthData: BirthData): DetailedChart {
    const sunSign = this.calculateSunSign(birthData.date);
    
    // Calculate moon sign (simplified - would use actual lunar ephemeris)
    const moonSign = this.calculateMoonSign(birthData.date, birthData.time);
    
    // Calculate rising sign (simplified - would use time and location)
    const rising = this.calculateRising(birthData.date, birthData.time, birthData.location);
    
    // Generate houses
    const houses = this.generateHouses(rising);
    
    // Generate planet positions
    const planets = this.generatePlanetPositions(birthData);
    
    // Calculate major aspects
    const majorAspects = this.calculateMajorAspects(planets);
    
    // Calculate element and modality balance
    const elementBalance = this.calculateElementBalance(planets);
    const modalityBalance = this.calculateModalityBalance(planets);
    
    // Determine dominant planet and chart pattern
    const dominantPlanet = this.findDominantPlanet(planets, majorAspects);
    const chartPattern = this.determineChartPattern(planets);
    
    // Generate life themes
    const lifeThemes = this.generateLifeThemes(sunSign, moonSign, rising, dominantPlanet, majorAspects);

    return {
      sunSign,
      moonSign,
      rising,
      houses,
      planets,
      majorAspects,
      elementBalance,
      modalityBalance,
      dominantPlanet,
      chartPattern,
      lifeThemes
    };
  }

  private calculateMoonSign(date: string, time: string): string {
    console.log('Moon calculation input:', { date, time });
    
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    
    const birthDate = new Date(date);
    console.log('Parsed birth date:', birthDate);
    
    // Convert time to 24-hour format if it includes AM/PM
    let timeStr = time.toLowerCase();
    let hours = 0, minutes = 0;
    
    if (timeStr.includes('pm') || timeStr.includes('am')) {
      const isPM = timeStr.includes('pm');
      const timeOnly = timeStr.replace(/(am|pm)/g, '').trim();
      const [hourStr, minuteStr] = timeOnly.split(':');
      hours = parseInt(hourStr);
      minutes = parseInt(minuteStr) || 0;
      
      if (isPM && hours !== 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;
    } else {
      [hours, minutes] = time.split(':').map(Number);
    }
    
    console.log('Converted time:', { hours, minutes });
    
    
    // Enhanced moon calculation with corrections
    const birthYear = birthDate.getFullYear();
    const birthMonth = birthDate.getMonth() + 1;
    const birthDay = birthDate.getDate();
    
    // Calculate Julian day number for more accurate astronomical calculations
    const a = Math.floor((14 - birthMonth) / 12);
    const y = birthYear - a;
    const m = birthMonth + 12 * a - 3;
    const jdn = birthDay + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    
    // Add time of day to Julian day
    const timeDecimal = hours + minutes / 60;
    const julianDay = jdn + (timeDecimal - 12) / 24;
    
    // Enhanced Moon's longitude calculation with perturbations
    const T = (julianDay - 2451545.0) / 36525; // Centuries since J2000.0
    
    // Mean longitude of Moon
    const L0 = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T * T * T / 538841 - T * T * T * T / 65194000;
    
    // Mean anomaly of Moon
    const M = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T * T * T / 69699 - T * T * T * T / 14712000;
    
    // Argument of latitude
    const F = 93.2720950 + 483202.0175273 * T - 0.0036539 * T * T - T * T * T / 3526000 + T * T * T * T / 863310000;
    
    // Apply some basic lunar perturbations
    const perturbation = 6.29 * Math.sin(M * Math.PI / 180) + 1.27 * Math.sin((2 * L0 - M) * Math.PI / 180);
    
    // Corrected moon longitude
    const moonLongitude = ((L0 + perturbation) % 360 + 360) % 360;
    
    // Convert longitude to zodiac sign
    const signIndex = Math.floor(moonLongitude / 30) % 12;
    
    const calculatedMoonSign = signs[signIndex];
    console.log('Moon calculation details:', { julianDay, T, moonLongitude, signIndex, calculatedMoonSign });
    
    return calculatedMoonSign;
  }

  private calculateRising(date: string, time: string, location: string): string {
    console.log('Rising calculation input:', { date, time, location });
    
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    
    // Convert time to 24-hour format if it includes AM/PM
    let timeStr = time.toLowerCase();
    let hours = 0, minutes = 0;
    
    if (timeStr.includes('pm') || timeStr.includes('am')) {
      const isPM = timeStr.includes('pm');
      const timeOnly = timeStr.replace(/(am|pm)/g, '').trim();
      const [hourStr, minuteStr] = timeOnly.split(':');
      hours = parseInt(hourStr);
      minutes = parseInt(minuteStr) || 0;
      
      if (isPM && hours !== 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;
    } else {
      [hours, minutes] = time.split(':').map(Number);
    }
    
    const timeDecimal = hours + minutes / 60;
    console.log('Rising time calculation:', { hours, minutes, timeDecimal });
    
    
    const birthDate = new Date(date);
    const birthYear = birthDate.getFullYear();
    const birthMonth = birthDate.getMonth() + 1;
    const birthDay = birthDate.getDate();
    
    // Get coordinates for major cities
    let latitude = 45.4215, longitude = -75.6972; // Ottawa, Canada default
    if (location.toLowerCase().includes('toronto')) { latitude = 43.6532; longitude = -79.3832; }
    else if (location.toLowerCase().includes('vancouver')) { latitude = 49.2827; longitude = -123.1207; }
    else if (location.toLowerCase().includes('montreal')) { latitude = 45.5017; longitude = -73.5673; }
    else if (location.toLowerCase().includes('new york')) { latitude = 40.7128; longitude = -74.0060; }
    else if (location.toLowerCase().includes('london')) { latitude = 51.5074; longitude = -0.1278; }
    else if (location.toLowerCase().includes('paris')) { latitude = 48.8566; longitude = 2.3522; }
    else if (location.toLowerCase().includes('sydney')) { latitude = -33.8688; longitude = 151.2093; }
    else if (location.toLowerCase().includes('los angeles')) { latitude = 34.0522; longitude = -118.2437; }
    
    // Calculate Julian day number
    const a = Math.floor((14 - birthMonth) / 12);
    const y = birthYear - a;
    const m = birthMonth + 12 * a - 3;
    const jdn = birthDay + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    
    const julianDay = jdn + (timeDecimal - 12) / 24;
    
    // Calculate Local Sidereal Time
    const T = (julianDay - 2451545.0) / 36525;
    const theta0 = 280.46061837 + 360.98564736629 * (julianDay - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000;
    
    // Local sidereal time (add longitude)
    const lst = ((theta0 + longitude) % 360 + 360) % 360;
    
    // Calculate obliquity of ecliptic
    const obliquity = 23.439291 - 0.0130042 * T;
    const obliqRad = obliquity * Math.PI / 180;
    const latRad = latitude * Math.PI / 180;
    
    // For rising sign, we need the Ascendant which corresponds to the eastern horizon
    // This is a simplified calculation - real astrology uses more complex formulas
    const lstRad = lst * Math.PI / 180;
    
    // Simplified ascendant calculation based on LST and latitude
    const ascendantDegree = ((lst + latitude * 0.5) % 360 + 360) % 360;
    const signIndex = Math.floor(ascendantDegree / 30) % 12;
    
    const calculatedRising = signs[signIndex];
    console.log('Rising calculation details:', { latitude, longitude, julianDay, lst, ascendantDegree, signIndex, calculatedRising });
    
    return calculatedRising;
  }

  // Calculate lunar nodes (North and South Node)
  calculateLunarNodes(date: string, time: string): { northNode: string, southNode: string } {
    console.log('Lunar nodes calculation input:', { date, time });
    
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    
    // Convert time to 24-hour format if it includes AM/PM
    let timeStr = time.toLowerCase();
    let hours = 0, minutes = 0;
    
    if (timeStr.includes('pm') || timeStr.includes('am')) {
      const isPM = timeStr.includes('pm');
      const timeOnly = timeStr.replace(/(am|pm)/g, '').trim();
      const [hourStr, minuteStr] = timeOnly.split(':');
      hours = parseInt(hourStr);
      minutes = parseInt(minuteStr) || 0;
      
      if (isPM && hours !== 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;
    } else {
      [hours, minutes] = time.split(':').map(Number);
    }
    
    
    const birthDate = new Date(date);
    const birthYear = birthDate.getFullYear();
    const birthMonth = birthDate.getMonth() + 1;
    const birthDay = birthDate.getDate();
    
    // Calculate Julian day number
    const a = Math.floor((14 - birthMonth) / 12);
    const y = birthYear - a;
    const m = birthMonth + 12 * a - 3;
    const jdn = birthDay + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    
    // Add time of day to Julian day
    const timeDecimal = hours + minutes / 60;
    const julianDay = jdn + (timeDecimal - 12) / 24;
    
    // Calculate lunar node position
    const T = (julianDay - 2451545.0) / 36525; // Centuries since J2000.0
    
    // Mean longitude of ascending node (more accurate formula)
    const Omega = 125.0445479 - 1934.1362891 * T + 0.0020754 * T * T + T * T * T / 467441 - T * T * T * T / 60616000;
    
    // Normalize to 0-360 degrees
    const nodeLongitude = ((Omega % 360) + 360) % 360;
    
    // North node position
    const northNodeIndex = Math.floor(nodeLongitude / 30) % 12;
    const northNode = signs[northNodeIndex];
    
    // South node is always opposite (180 degrees away)
    const southNodeIndex = (northNodeIndex + 6) % 12;
    const southNode = signs[southNodeIndex];
    
    console.log('Lunar nodes calculation:', { T, nodeLongitude, northNodeIndex, southNodeIndex, northNode, southNode });
    
    return { northNode, southNode };
  }

  // New method using Python/Immanuel for accurate calculations
  async calculateBigThreeAccurate({ date, time, location }: { date: string, time: string, location: string }) {
    try {
      // Parse location for coordinates
      const coordinates = this.parseLocation(location);
      
      // Call Python script with Immanuel
      const command = `python server/astrology_engine.py "${date}" "${time}" "${coordinates.latitude}" "${coordinates.longitude}"`;
      const { stdout } = await execAsync(command);
      
      const chartData = JSON.parse(stdout);
      
      if (chartData.error) {
        console.error('Python astrology error:', chartData.error);
        // Fallback to JavaScript calculations
        return this.calculateBigThree({ date, time, location });
      }
      
      return {
        sunSign: chartData.bigThree.sunSign,
        moonSign: chartData.bigThree.moonSign,
        risingSign: chartData.bigThree.risingSign,
        northNode: chartData.lunarNodes.northNode,
        southNode: chartData.lunarNodes.southNode,
        planets: chartData.planets,
        houses: chartData.houses,
        aspects: chartData.aspects
      };
    } catch (error) {
      console.error('Error calling Python astrology script:', error);
      // Fallback to JavaScript calculations
      return this.calculateBigThree({ date, time, location });
    }
  }

  // Parse location string to coordinates
  private parseLocation(location: string): { latitude: string, longitude: string } {
    // Default to Ottawa coordinates
    let latitude = '45.4215';
    let longitude = '-75.6972';
    
    const loc = location.toLowerCase();
    
    // Major cities coordinates
    if (loc.includes('ottawa')) { latitude = '45.4215'; longitude = '-75.6972'; }
    else if (loc.includes('toronto')) { latitude = '43.6532'; longitude = '-79.3832'; }
    else if (loc.includes('vancouver')) { latitude = '49.2827'; longitude = '-123.1207'; }
    else if (loc.includes('montreal')) { latitude = '45.5017'; longitude = '-73.5673'; }
    else if (loc.includes('new york')) { latitude = '40.7128'; longitude = '-74.0060'; }
    else if (loc.includes('london')) { latitude = '51.5074'; longitude = '-0.1278'; }
    else if (loc.includes('paris')) { latitude = '48.8566'; longitude = '2.3522'; }
    else if (loc.includes('sydney')) { latitude = '-33.8688'; longitude = '151.2093'; }
    else if (loc.includes('los angeles')) { latitude = '34.0522'; longitude = '-118.2437'; }
    
    return { latitude, longitude };
  }

  // Public method to calculate Big Three (fallback JavaScript version)
  calculateBigThree({ date, time, location }: { date: string, time: string, location: string }) {
    return {
      sunSign: this.calculateSunSign(date),
      moonSign: this.calculateMoonSign(date, time),
      risingSign: this.calculateRising(date, time, location)
    };
  }

  private generateHouses(rising: string): AstrologicalHouse[] {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const risingIndex = signs.indexOf(rising);
    
    const houseThemes = [
      ['Self-identity', 'Personality', 'First impressions'],
      ['Resources', 'Values', 'Material security'],
      ['Communication', 'Siblings', 'Learning'],
      ['Home', 'Family', 'Emotional foundation'],
      ['Creativity', 'Romance', 'Self-expression'],
      ['Health', 'Service', 'Daily routines'],
      ['Partnerships', 'Marriage', 'Balance'],
      ['Transformation', 'Shared resources', 'Depth'],
      ['Philosophy', 'Higher learning', 'Travel'],
      ['Career', 'Public image', 'Authority'],
      ['Friendship', 'Groups', 'Ideals'],
      ['Spirituality', 'Subconscious', 'Hidden matters']
    ];

    return Array.from({length: 12}, (_, i) => ({
      number: i + 1,
      sign: signs[(risingIndex + i) % 12],
      degree: Math.floor(Math.random() * 30),
      cusp: i * 30,
      ruler: this.getRulingPlanet(signs[(risingIndex + i) % 12]),
      themes: houseThemes[i]
    }));
  }

  private generatePlanetPositions(birthData: BirthData): PlanetPosition[] {
    const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    
    const birthDate = new Date(birthData.date);
    const [hours, minutes] = birthData.time.split(':').map(Number);
    const dayOfYear = Math.floor((birthDate.getTime() - new Date(birthDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
    // More realistic planetary movement speeds (degrees per year)
    const planetaryMovement = {
      'Sun': 1.0, 'Moon': 13.2, 'Mercury': 4.1, 'Venus': 1.6, 'Mars': 0.52,
      'Jupiter': 0.083, 'Saturn': 0.033, 'Uranus': 0.012, 'Neptune': 0.006, 'Pluto': 0.004
    };
    
    return planets.map((planet, index) => {
      const movement = planetaryMovement[planet as keyof typeof planetaryMovement] || 1.0;
      const planetPosition = (dayOfYear * movement + hours * movement / 24) % 360;
      const signIndex = Math.floor(planetPosition / 30) % 12;
      const degree = Math.floor(planetPosition % 30);
      
      // Calculate house position based on time and rising sign
      const risingOffset = Math.floor((hours + minutes / 60) / 2) % 12;
      const house = ((Math.floor(planetPosition / 30) - risingOffset + 12) % 12) + 1;
      
      return {
        planet,
        sign: signs[signIndex],
        degree,
        house,
        isRetrograde: this.isRetrograde(planet, birthDate),
        aspects: [] // Will be populated by calculateMajorAspects
      };
    });
  }

  private calculateMajorAspects(planets: PlanetPosition[]): PlanetaryAspect[] {
    const aspects = [];
    const aspectTypes = [
      { name: 'conjunction', degrees: 0, orb: 8 },
      { name: 'opposition', degrees: 180, orb: 8 },
      { name: 'trine', degrees: 120, orb: 6 },
      { name: 'square', degrees: 90, orb: 6 },
      { name: 'sextile', degrees: 60, orb: 4 }
    ];

    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const planet1 = planets[i];
        const planet2 = planets[j];
        
        // Calculate actual celestial positions in degrees (0-360)
        const position1 = signs.indexOf(planet1.sign) * 30 + planet1.degree;
        const position2 = signs.indexOf(planet2.sign) * 30 + planet2.degree;
        
        // Calculate angular separation accounting for the circular nature
        let separation = Math.abs(position1 - position2);
        if (separation > 180) {
          separation = 360 - separation;
        }
        
        for (const aspectType of aspectTypes) {
          const orb = Math.abs(separation - aspectType.degrees);
          if (orb <= aspectType.orb) {
            const aspect: PlanetaryAspect = {
              planet1: planet1.planet,
              planet2: planet2.planet,
              aspect: aspectType.name,
              orb: Math.round(orb * 10) / 10, // Round to 1 decimal place
              isExact: orb <= 1,
              strength: orb <= 2 ? 'strong' : orb <= 4 ? 'moderate' : 'weak',
              interpretation: this.interpretAspect(planet1.planet, planet2.planet, aspectType.name)
            };
            aspects.push(aspect);
            planet1.aspects.push(aspect);
            planet2.aspects.push(aspect);
          }
        }
      }
    }

    return aspects;
  }

  private calculateElementBalance(planets: PlanetPosition[]): { fire: number; earth: number; air: number; water: number } {
    const elementCounts = { fire: 0, earth: 0, air: 0, water: 0 };
    const elementMap: { [key: string]: keyof typeof elementCounts } = {
      'Aries': 'fire', 'Leo': 'fire', 'Sagittarius': 'fire',
      'Taurus': 'earth', 'Virgo': 'earth', 'Capricorn': 'earth',
      'Gemini': 'air', 'Libra': 'air', 'Aquarius': 'air',
      'Cancer': 'water', 'Scorpio': 'water', 'Pisces': 'water'
    };

    planets.forEach(planet => {
      const element = elementMap[planet.sign];
      if (element) elementCounts[element]++;
    });

    return elementCounts;
  }

  private calculateModalityBalance(planets: PlanetPosition[]): { cardinal: number; fixed: number; mutable: number } {
    const modalityCounts = { cardinal: 0, fixed: 0, mutable: 0 };
    const modalityMap: { [key: string]: keyof typeof modalityCounts } = {
      'Aries': 'cardinal', 'Cancer': 'cardinal', 'Libra': 'cardinal', 'Capricorn': 'cardinal',
      'Taurus': 'fixed', 'Leo': 'fixed', 'Scorpio': 'fixed', 'Aquarius': 'fixed',
      'Gemini': 'mutable', 'Virgo': 'mutable', 'Sagittarius': 'mutable', 'Pisces': 'mutable'
    };

    planets.forEach(planet => {
      const modality = modalityMap[planet.sign];
      if (modality) modalityCounts[modality]++;
    });

    return modalityCounts;
  }

  private findDominantPlanet(planets: PlanetPosition[], aspects: PlanetaryAspect[]): string {
    const planetScores: { [key: string]: number } = {};
    
    // Score based on aspects
    aspects.forEach(aspect => {
      const score = aspect.strength === 'strong' ? 3 : aspect.strength === 'moderate' ? 2 : 1;
      planetScores[aspect.planet1] = (planetScores[aspect.planet1] || 0) + score;
      planetScores[aspect.planet2] = (planetScores[aspect.planet2] || 0) + score;
    });

    // Find planet with highest score
    let dominantPlanet = 'Sun';
    let highestScore = 0;
    Object.entries(planetScores).forEach(([planet, score]) => {
      if (score > highestScore) {
        highestScore = score;
        dominantPlanet = planet;
      }
    });

    return dominantPlanet;
  }

  private determineChartPattern(planets: PlanetPosition[]): string {
    // Calculate chart pattern based on actual planetary distribution
    const planetDegrees = planets.map(p => {
      const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                     'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
      const signIndex = signs.indexOf(p.sign);
      return signIndex * 30 + p.degree;
    }).sort((a, b) => a - b);
    
    // Calculate gaps between planets
    const gaps = [];
    for (let i = 0; i < planetDegrees.length; i++) {
      const next = (i + 1) % planetDegrees.length;
      const gap = next === 0 ? 
        (360 - planetDegrees[i] + planetDegrees[0]) : 
        (planetDegrees[next] - planetDegrees[i]);
      gaps.push(gap);
    }
    
    const maxGap = Math.max(...gaps);
    const minGap = Math.min(...gaps);
    const totalSpread = planetDegrees[planetDegrees.length - 1] - planetDegrees[0];
    
    // Pattern determination logic
    if (maxGap > 120 && gaps.filter(g => g < 30).length >= 7) {
      return 'Bucket'; // One planet opposite a group
    } else if (totalSpread <= 120) {
      return 'Bundle'; // All planets within 120 degrees
    } else if (totalSpread <= 180) {
      return 'Bowl'; // All planets within 180 degrees
    } else if (gaps.filter(g => g > 60).length === 2) {
      return 'See-Saw'; // Two groups of planets
    } else if (gaps.filter(g => g > 40).length >= 4) {
      return 'Splash'; // Planets spread evenly
    } else if (maxGap > 90) {
      return 'Locomotive'; // Planets in 2/3 of chart
    } else {
      return 'Splay'; // Irregular distribution
    }
  }

  private generateLifeThemes(sunSign: string, moonSign: string, rising: string, dominantPlanet: string, aspects: PlanetaryAspect[]): string[] {
    const themes = [];
    
    // Sun sign themes
    const sunThemes: { [key: string]: string[] } = {
      'Aries': ['Leadership', 'Initiative', 'Independence'],
      'Taurus': ['Stability', 'Sensuality', 'Persistence'],
      'Gemini': ['Communication', 'Adaptability', 'Learning'],
      'Cancer': ['Nurturing', 'Emotional depth', 'Protection'],
      'Leo': ['Creativity', 'Self-expression', 'Recognition'],
      'Virgo': ['Service', 'Perfectionism', 'Analysis'],
      'Libra': ['Balance', 'Relationships', 'Harmony'],
      'Scorpio': ['Transformation', 'Intensity', 'Depth'],
      'Sagittarius': ['Philosophy', 'Adventure', 'Growth'],
      'Capricorn': ['Achievement', 'Structure', 'Authority'],
      'Aquarius': ['Innovation', 'Humanitarianism', 'Independence'],
      'Pisces': ['Spirituality', 'Compassion', 'Intuition']
    };

    themes.push(...(sunThemes[sunSign] || []));
    
    // Add moon and rising influences
    if (moonSign !== sunSign) {
      themes.push(`Emotional ${moonSign.toLowerCase()} nature`);
    }
    if (rising !== sunSign) {
      themes.push(`${rising} persona and approach to life`);
    }

    // Add dominant planet influence
    const planetThemes: { [key: string]: string } = {
      'Sun': 'Self-expression and vitality',
      'Moon': 'Emotional intelligence and intuition',
      'Mercury': 'Communication and mental agility',
      'Venus': 'Relationships and artistic expression',
      'Mars': 'Action and assertiveness',
      'Jupiter': 'Growth and philosophical expansion',
      'Saturn': 'Discipline and structural thinking',
      'Uranus': 'Innovation and revolutionary spirit',
      'Neptune': 'Spirituality and mystical experiences',
      'Pluto': 'Transformation and regeneration'
    };

    if (planetThemes[dominantPlanet]) {
      themes.push(planetThemes[dominantPlanet]);
    }

    return themes.slice(0, 8); // Return top 8 themes
  }

  private isRetrograde(planet: string, birthDate: Date): boolean {
    // Simplified retrograde calculation based on statistical likelihood
    const retrogradeChances = {
      'Mercury': 0.19, 'Venus': 0.07, 'Mars': 0.09,
      'Jupiter': 0.33, 'Saturn': 0.36, 'Uranus': 0.42,
      'Neptune': 0.43, 'Pluto': 0.41
    };
    
    if (planet === 'Sun' || planet === 'Moon') return false;
    
    const chance = retrogradeChances[planet as keyof typeof retrogradeChances] || 0.1;
    const dayOfYear = Math.floor((birthDate.getTime() - new Date(birthDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
    // Use birth day to create consistent but seemingly random retrograde status
    return (dayOfYear * 17 + planet.length) % 100 < chance * 100;
  }

  private getRulingPlanet(sign: string): string {
    const rulers: { [key: string]: string } = {
      'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury',
      'Cancer': 'Moon', 'Leo': 'Sun', 'Virgo': 'Mercury',
      'Libra': 'Venus', 'Scorpio': 'Pluto', 'Sagittarius': 'Jupiter',
      'Capricorn': 'Saturn', 'Aquarius': 'Uranus', 'Pisces': 'Neptune'
    };
    return rulers[sign] || 'Unknown';
  }

  private interpretAspect(planet1: string, planet2: string, aspect: string): string {
    const interpretations: { [key: string]: { [key: string]: string } } = {
      'conjunction': {
        'Sun-Moon': 'Harmony between conscious will and emotions',
        'Sun-Mercury': 'Strong mental focus and self-expression',
        'Sun-Venus': 'Natural charm and artistic abilities',
        'Sun-Mars': 'Dynamic energy and leadership qualities',
        'default': 'Unified energy between planetary forces'
      },
      'opposition': {
        'Sun-Moon': 'Internal tension between ego and emotions',
        'Sun-Saturn': 'Conflict between self-expression and responsibility',
        'default': 'Tension requiring balance and integration'
      },
      'trine': {
        'Sun-Jupiter': 'Natural optimism and expansion opportunities',
        'Moon-Venus': 'Emotional harmony and artistic sensitivity',
        'default': 'Harmonious flow of energy and natural talents'
      },
      'square': {
        'Sun-Mars': 'Dynamic tension driving achievement',
        'Moon-Saturn': 'Emotional challenges building strength',
        'default': 'Creative tension requiring active resolution'
      },
      'sextile': {
        'Sun-Mercury': 'Easy communication and mental clarity',
        'Venus-Mars': 'Balanced creative and active energies',
        'default': 'Cooperative energy with growth potential'
      }
    };

    const key = `${planet1}-${planet2}`;
    const reverseKey = `${planet2}-${planet1}`;
    
    return interpretations[aspect]?.[key] || 
           interpretations[aspect]?.[reverseKey] || 
           interpretations[aspect]?.['default'] || 
           `${aspect} aspect between ${planet1} and ${planet2}`;
  }
}

export const astrologyService = new AstrologyService();
