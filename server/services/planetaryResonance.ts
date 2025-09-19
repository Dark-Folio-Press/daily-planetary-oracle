/**
 * Planetary Resonance Service
 * Calculates real-time planetary orbital periods and resonance ratios
 * for correlation with musical harmonics
 */

import { execAsync } from '../db';
import path from 'path';

export interface PlanetaryData {
  name: string;
  orbitalPeriodDays: number;
  orbitalPeriodYears: number;
  currentPosition: number; // degrees in zodiac
  angularVelocity: number; // degrees per day
}

export interface ResonanceRatio {
  planets: [string, string];
  ratio: number;
  ratioString: string; // e.g., "3:2"
  strength: 'strong' | 'moderate' | 'weak';
  type: 'harmonic' | 'overtone';
}

export interface PlanetaryResonanceData {
  timestamp: Date;
  planets: PlanetaryData[];
  resonanceRatios: ResonanceRatio[];
  fundamentalFrequency: number; // Earth year as base frequency
}

export class PlanetaryResonanceService {
  // Accurate orbital periods in Earth days (sidereal periods)
  private static readonly ORBITAL_PERIODS = {
    'Mercury': 87.97,
    'Venus': 224.70,
    'Earth': 365.25,
    'Mars': 686.98,
    'Jupiter': 4332.59,
    'Saturn': 10759.22,
    'Uranus': 30688.5,
    'Neptune': 60182,
    'Pluto': 90560
  };

  /**
   * Get current planetary positions and calculate resonance ratios
   */
  async getCurrentPlanetaryResonance(): Promise<PlanetaryResonanceData> {
    try {
      const currentDate = new Date();
      const planets = await this.calculateCurrentPlanetaryData(currentDate);
      const resonanceRatios = this.calculateResonanceRatios(planets);
      
      return {
        timestamp: currentDate,
        planets,
        resonanceRatios,
        fundamentalFrequency: this.calculateFundamentalFrequency()
      };
    } catch (error) {
      console.error('Error calculating planetary resonance:', error);
      // Return fallback data based on known orbital periods
      return this.getFallbackResonanceData();
    }
  }

  /**
   * Calculate planetary data for a specific date using Swiss Ephemeris
   */
  private async calculateCurrentPlanetaryData(date: Date): Promise<PlanetaryData[]> {
    try {
      // Use existing Python script to get current planetary positions
      const dateStr = date.toISOString().split('T')[0];
      const timeStr = '12:00'; // Noon for consistent daily calculation
      
      // Call the existing astrology engine to get planetary positions
      const scriptPath = path.join(process.cwd(), 'server/astrology_engine.py');
      const command = `python3 "${scriptPath}" "${dateStr}" "${timeStr}" "0" "0"`;
      
      const result = await execAsync(command);
      const astronomicalData = JSON.parse(result);
      
      const planets: PlanetaryData[] = [];
      
      // Extract planetary data from the astronomical calculation
      for (const [planetName, planetData] of Object.entries(astronomicalData.planets || {})) {
        const data = planetData as any;
        const orbitalPeriod = PlanetaryResonanceService.ORBITAL_PERIODS[planetName as keyof typeof PlanetaryResonanceService.ORBITAL_PERIODS];
        
        if (orbitalPeriod && data.degree !== undefined) {
          planets.push({
            name: planetName,
            orbitalPeriodDays: orbitalPeriod,
            orbitalPeriodYears: orbitalPeriod / 365.25,
            currentPosition: data.degree,
            angularVelocity: 360 / orbitalPeriod // degrees per day
          });
        }
      }
      
      return planets;
    } catch (error) {
      console.error('Error getting astronomical data:', error);
      // Fallback to theoretical positions
      return this.getTheoreticalPlanetaryData();
    }
  }

  /**
   * Calculate resonance ratios between planets
   */
  private calculateResonanceRatios(planets: PlanetaryData[]): ResonanceRatio[] {
    const ratios: ResonanceRatio[] = [];
    
    // Calculate pairwise ratios for all planet combinations
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const planet1 = planets[i];
        const planet2 = planets[j];
        
        // Calculate orbital period ratio
        const periodRatio = planet2.orbitalPeriodYears / planet1.orbitalPeriodYears;
        
        // Simplify to nearest simple ratio (for harmonic analysis)
        const simplifiedRatio = this.simplifyRatio(periodRatio);
        
        if (simplifiedRatio) {
          ratios.push({
            planets: [planet1.name, planet2.name],
            ratio: periodRatio,
            ratioString: simplifiedRatio.ratioString,
            strength: simplifiedRatio.strength,
            type: simplifiedRatio.type
          });
        }
      }
    }
    
    return ratios.sort((a, b) => {
      // Sort by strength and then by ratio size
      const strengthOrder = { 'strong': 0, 'moderate': 1, 'weak': 2 };
      if (strengthOrder[a.strength] !== strengthOrder[b.strength]) {
        return strengthOrder[a.strength] - strengthOrder[b.strength];
      }
      return a.ratio - b.ratio;
    });
  }

  /**
   * Simplify decimal ratio to nearest simple integer ratio
   */
  private simplifyRatio(decimalRatio: number): {
    ratioString: string;
    strength: 'strong' | 'moderate' | 'weak';
    type: 'harmonic' | 'overtone';
  } | null {
    // Common harmonic ratios (octaves, fifths, fourths, etc.)
    const harmonicRatios = [
      { ratio: 1.0, string: '1:1', strength: 'strong' as const, type: 'harmonic' as const },
      { ratio: 2.0, string: '2:1', strength: 'strong' as const, type: 'harmonic' as const },
      { ratio: 1.5, string: '3:2', strength: 'strong' as const, type: 'harmonic' as const },
      { ratio: 1.333, string: '4:3', strength: 'strong' as const, type: 'harmonic' as const },
      { ratio: 2.5, string: '5:2', strength: 'moderate' as const, type: 'harmonic' as const },
      { ratio: 1.667, string: '5:3', strength: 'moderate' as const, type: 'harmonic' as const },
      { ratio: 1.25, string: '5:4', strength: 'moderate' as const, type: 'harmonic' as const },
      { ratio: 3.0, string: '3:1', strength: 'moderate' as const, type: 'overtone' as const },
      { ratio: 4.0, string: '4:1', strength: 'moderate' as const, type: 'overtone' as const },
      { ratio: 1.2, string: '6:5', strength: 'weak' as const, type: 'harmonic' as const },
      { ratio: 1.125, string: '9:8', strength: 'weak' as const, type: 'harmonic' as const },
      { ratio: 1.067, string: '16:15', strength: 'weak' as const, type: 'harmonic' as const }
    ];
    
    const tolerance = 0.05; // 5% tolerance for matching
    
    for (const harmonic of harmonicRatios) {
      if (Math.abs(decimalRatio - harmonic.ratio) <= tolerance) {
        return {
          ratioString: harmonic.string,
          strength: harmonic.strength,
          type: harmonic.type
        };
      }
    }
    
    // If no close match found, return null
    return null;
  }

  /**
   * Calculate fundamental frequency based on Earth's orbital period
   * Earth year = fundamental tone
   */
  private calculateFundamentalFrequency(): number {
    // Earth's orbital period in seconds
    const earthYearSeconds = 365.25 * 24 * 60 * 60;
    
    // Convert to frequency (Hz) - This is a very low frequency
    // We'll scale it up to audible range for correlation purposes
    const fundamentalHz = 1 / earthYearSeconds;
    
    // Scale to audible range (around 256 Hz = C4)
    const scaleFactor = 256 / fundamentalHz;
    
    return 256; // Base frequency for correlations (C4)
  }

  /**
   * Get theoretical planetary data when real-time calculation fails
   */
  private getTheoreticalPlanetaryData(): PlanetaryData[] {
    const currentDate = new Date();
    const daysFromEpoch = (currentDate.getTime() - new Date('2000-01-01').getTime()) / (1000 * 60 * 60 * 24);
    
    return Object.entries(PlanetaryResonanceService.ORBITAL_PERIODS).map(([name, period]) => ({
      name,
      orbitalPeriodDays: period,
      orbitalPeriodYears: period / 365.25,
      currentPosition: (daysFromEpoch * (360 / period)) % 360,
      angularVelocity: 360 / period
    }));
  }

  /**
   * Get fallback resonance data for error cases
   */
  private getFallbackResonanceData(): PlanetaryResonanceData {
    const planets = this.getTheoreticalPlanetaryData();
    const resonanceRatios = this.calculateResonanceRatios(planets);
    
    return {
      timestamp: new Date(),
      planets,
      resonanceRatios,
      fundamentalFrequency: 256
    };
  }

  /**
   * Get planetary resonance data for a specific birth chart
   * This correlates natal planetary positions with current transits
   */
  async getPlanetaryResonanceForChart(birthData: {
    date: string;
    time: string;
    location: string;
  }): Promise<{
    natal: PlanetaryResonanceData;
    current: PlanetaryResonanceData;
    transitAspects: ResonanceRatio[];
  }> {
    try {
      // Get current planetary resonance
      const current = await this.getCurrentPlanetaryResonance();
      
      // Calculate natal chart resonance (birth time planetary positions)
      const birthDate = new Date(birthData.date);
      const natalPlanets = await this.calculateCurrentPlanetaryData(birthDate);
      const natal: PlanetaryResonanceData = {
        timestamp: birthDate,
        planets: natalPlanets,
        resonanceRatios: this.calculateResonanceRatios(natalPlanets),
        fundamentalFrequency: 256
      };
      
      // Calculate transit aspects (current planets vs natal planets)
      const transitAspects = this.calculateTransitAspects(natalPlanets, current.planets);
      
      return {
        natal,
        current,
        transitAspects
      };
    } catch (error) {
      console.error('Error calculating chart resonance:', error);
      const fallback = this.getFallbackResonanceData();
      return {
        natal: fallback,
        current: fallback,
        transitAspects: []
      };
    }
  }

  /**
   * Calculate resonance aspects between natal and transit planets
   */
  private calculateTransitAspects(natalPlanets: PlanetaryData[], transitPlanets: PlanetaryData[]): ResonanceRatio[] {
    const aspects: ResonanceRatio[] = [];
    
    for (const natalPlanet of natalPlanets) {
      for (const transitPlanet of transitPlanets) {
        if (natalPlanet.name === transitPlanet.name) continue;
        
        // Calculate angular difference
        const angleDiff = Math.abs(transitPlanet.currentPosition - natalPlanet.currentPosition);
        const normalizedAngle = Math.min(angleDiff, 360 - angleDiff);
        
        // Check for major aspects (conjunction, opposition, trine, square, sextile)
        const aspectTolerance = 8; // degrees
        const majorAspects = [
          { angle: 0, name: 'conjunction', strength: 'strong' as const },
          { angle: 60, name: 'sextile', strength: 'moderate' as const },
          { angle: 90, name: 'square', strength: 'strong' as const },
          { angle: 120, name: 'trine', strength: 'strong' as const },
          { angle: 180, name: 'opposition', strength: 'strong' as const }
        ];
        
        for (const aspect of majorAspects) {
          if (Math.abs(normalizedAngle - aspect.angle) <= aspectTolerance) {
            // Calculate harmonic ratio based on aspect
            const harmonicRatio = this.aspectToHarmonicRatio(aspect.angle);
            
            aspects.push({
              planets: [natalPlanet.name, transitPlanet.name],
              ratio: harmonicRatio,
              ratioString: `${aspect.name} (${aspect.angle}°)`,
              strength: aspect.strength,
              type: 'harmonic'
            });
          }
        }
      }
    }
    
    return aspects;
  }

  /**
   * Convert astrological aspect angle to harmonic ratio
   */
  private aspectToHarmonicRatio(angle: number): number {
    // Map astrological aspects to harmonic ratios
    const aspectRatios: Record<number, number> = {
      0: 1.0,    // Conjunction = unison (1:1)
      60: 1.5,   // Sextile = perfect fifth (3:2)
      90: 1.333, // Square = perfect fourth (4:3)
      120: 1.5,  // Trine = perfect fifth (3:2)
      180: 2.0   // Opposition = octave (2:1)
    };
    
    return aspectRatios[angle] || 1.0;
  }
}

export const planetaryResonanceService = new PlanetaryResonanceService();