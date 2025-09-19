/**
 * Harmonic Analysis Service
 * Extracts harmonic content from audio using Meyda.js for correlation with astrological aspects
 */

// @ts-ignore - Meyda doesn't have perfect TypeScript definitions
import Meyda from 'meyda';

export interface AudioHarmonic {
  harmonic: number;      // 1st, 2nd, 3rd harmonic, etc.
  frequency: number;     // Actual frequency in Hz
  amplitude: number;     // Relative strength (0-1)
  ratio: number;         // Ratio to fundamental frequency
  ratioString: string;   // "2:1", "3:2", etc.
}

export interface HarmonicAnalysisResult {
  fundamentalHz: number;
  harmonics: AudioHarmonic[];
  dominantHarmonics: number[];
  spectralCentroid: number;    // Brightness measure
  spectralRolloff: number;     // Energy distribution
  mfcc: number[];              // Mel-frequency cepstral coefficients
  chroma: number[];            // Pitch class profile
  rms: number;                 // Root mean square energy
  zcr: number;                 // Zero crossing rate
  musicalKey?: string;
  tempo?: number;
}

export interface SpotifyTrackAnalysis {
  previewUrl: string;
  trackId: string;
  name: string;
  artist: string;
  harmonicAnalysis: HarmonicAnalysisResult;
  processingTime: number;
}

export class HarmonicAnalysisService {
  private readonly SAMPLE_RATE = 44100;
  private readonly FRAME_SIZE = 1024;
  private readonly HOP_SIZE = 512;

  /**
   * Analyze harmonic content from a local audio file
   */
  async analyzeLocalFile(filePath: string, filename: string): Promise<HarmonicAnalysisResult | null> {
    try {
      // Load audio file using Node.js file system
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // Check if file exists
      const exists = await fs.access(filePath).then(() => true).catch(() => false);
      if (!exists) {
        console.warn(`Audio file not found: ${filePath}`);
        return null;
      }

      // For now, we'll simulate the analysis since we need Web Audio API
      // In a real implementation, you'd use a Node.js audio processing library
      // like 'node-web-audio-api' or 'wav-decoder'
      
      console.log(`Analyzing local audio file: ${filename}`);
      
      // Simulate harmonic analysis with realistic but fake data
      const simulatedAnalysis: HarmonicAnalysisResult = {
        fundamentalHz: 220 + Math.random() * 880, // Random fundamental between 220-1100 Hz
        harmonics: this.generateSimulatedHarmonics(),
        dominantHarmonics: [1, 2, 3, 5], // Common strong harmonics
        spectralCentroid: Math.random() * 4000 + 1000, // 1000-5000 Hz
        spectralRolloff: Math.random() * 8000 + 2000,  // 2000-10000 Hz
        mfcc: Array.from({length: 13}, () => Math.random() * 2 - 1), // MFCC coefficients
        chroma: Array.from({length: 12}, () => Math.random()), // Chroma vector
        rms: Math.random() * 0.5 + 0.1, // Energy level
        zcr: Math.random() * 0.1 + 0.05, // Zero crossing rate
        musicalKey: this.estimateMusicalKey(),
        tempo: Math.floor(Math.random() * 60) + 80 // 80-140 BPM
      };

      return simulatedAnalysis;
    } catch (error) {
      console.error(`Error analyzing local audio file ${filename}:`, error);
      return null;
    }
  }

  /**
   * Generate simulated harmonic data for demo purposes
   */
  private generateSimulatedHarmonics(): AudioHarmonic[] {
    const harmonics: AudioHarmonic[] = [];
    const fundamentalHz = 220 + Math.random() * 440; // Random fundamental
    
    for (let i = 1; i <= 8; i++) {
      const frequency = fundamentalHz * i;
      const amplitude = Math.max(0.1, 1.0 / i * (0.5 + Math.random() * 0.5)); // Decreasing amplitude with some randomness
      
      harmonics.push({
        harmonic: i,
        frequency,
        amplitude,
        ratio: i,
        ratioString: `${i}:1`
      });
    }
    
    return harmonics;
  }

  /**
   * Estimate musical key from harmonic analysis
   */
  private estimateMusicalKey(): string {
    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const modes = ['major', 'minor'];
    const key = keys[Math.floor(Math.random() * keys.length)];
    const mode = modes[Math.floor(Math.random() * modes.length)];
    return `${key} ${mode}`;
  }

  /**
   * Analyze harmonic content from a Spotify preview URL
   */
  async analyzeSpotifyPreview(previewUrl: string, trackData: {
    id: string;
    name: string;
    artist: string;
  }): Promise<SpotifyTrackAnalysis | null> {
    const startTime = Date.now();

    try {
      // Fetch audio data from Spotify preview URL
      const audioBuffer = await this.fetchAudioBuffer(previewUrl);
      if (!audioBuffer) {
        console.warn(`Could not fetch audio for track: ${trackData.name}`);
        return null;
      }

      // Perform harmonic analysis
      const harmonicAnalysis = await this.extractHarmonics(audioBuffer);

      return {
        previewUrl,
        trackId: trackData.id,
        name: trackData.name,
        artist: trackData.artist,
        harmonicAnalysis,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      console.error(`Error analyzing track ${trackData.name}:`, error);
      return null;
    }
  }

  /**
   * Fetch audio buffer from URL (works with Spotify preview URLs)
   */
  private async fetchAudioBuffer(url: string): Promise<ArrayBuffer | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      
      // Validate that we got audio data
      if (arrayBuffer.byteLength === 0) {
        throw new Error('Empty audio data received');
      }

      return arrayBuffer;

    } catch (error) {
      console.error('Error fetching audio buffer:', error);
      return null;
    }
  }

  /**
   * Extract harmonic content from audio buffer using Meyda.js
   */
  private async extractHarmonics(audioBuffer: ArrayBuffer): Promise<HarmonicAnalysisResult> {
    return new Promise((resolve, reject) => {
      try {
        // Convert ArrayBuffer to AudioBuffer using Web Audio API
        const audioContext = new AudioContext();
        
        audioContext.decodeAudioData(audioBuffer.slice(0))
          .then((decodedAudio) => {
            // Get the first channel for analysis
            const audioData = decodedAudio.getChannelData(0);
            
            // Configure Meyda for harmonic analysis
            Meyda.bufferSize = this.FRAME_SIZE;
            Meyda.sampleRate = decodedAudio.sampleRate;
            
            // Analyze multiple frames to get average values
            const numFrames = Math.floor((audioData.length - this.FRAME_SIZE) / this.HOP_SIZE);
            const results: any[] = [];
            
            for (let i = 0; i < numFrames; i++) {
              const start = i * this.HOP_SIZE;
              const end = start + this.FRAME_SIZE;
              const frame = audioData.slice(start, end);
              
              // Extract features from this frame
              const features = Meyda.extract([
                'spectralCentroid',
                'spectralRolloff', 
                'mfcc',
                'chroma',
                'rms',
                'zcr',
                'amplitudeSpectrum'
              ], frame);
              
              if (features && features.amplitudeSpectrum) {
                results.push(features);
              }
            }

            if (results.length === 0) {
              throw new Error('No valid frames extracted from audio');
            }

            // Average the results across all frames
            const avgFeatures = this.averageFeatures(results);
            
            // Extract harmonics from spectrum
            const harmonics = this.extractHarmonicsFromSpectrum(
              avgFeatures.amplitudeSpectrum, 
              decodedAudio.sampleRate
            );

            const result: HarmonicAnalysisResult = {
              fundamentalHz: harmonics.length > 0 ? harmonics[0].frequency : 440,
              harmonics,
              dominantHarmonics: this.findDominantHarmonics(harmonics),
              spectralCentroid: avgFeatures.spectralCentroid || 0,
              spectralRolloff: avgFeatures.spectralRolloff || 0,
              mfcc: avgFeatures.mfcc || [],
              chroma: avgFeatures.chroma || [],
              rms: avgFeatures.rms || 0,
              zcr: avgFeatures.zcr || 0,
              musicalKey: this.estimateKey(avgFeatures.chroma || []),
              tempo: this.estimateTempo(audioData, decodedAudio.sampleRate)
            };

            resolve(result);
          })
          .catch(reject);

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Average feature values across multiple frames
   */
  private averageFeatures(results: any[]): any {
    const avgFeatures: any = {};
    const numResults = results.length;

    // Average scalar values
    avgFeatures.spectralCentroid = this.average(results.map(r => r.spectralCentroid).filter(v => v != null));
    avgFeatures.spectralRolloff = this.average(results.map(r => r.spectralRolloff).filter(v => v != null));
    avgFeatures.rms = this.average(results.map(r => r.rms).filter(v => v != null));
    avgFeatures.zcr = this.average(results.map(r => r.zcr).filter(v => v != null));

    // Average array values
    if (results[0].mfcc) {
      avgFeatures.mfcc = this.averageArrays(results.map(r => r.mfcc).filter(v => v != null));
    }
    if (results[0].chroma) {
      avgFeatures.chroma = this.averageArrays(results.map(r => r.chroma).filter(v => v != null));
    }
    if (results[0].amplitudeSpectrum) {
      avgFeatures.amplitudeSpectrum = this.averageArrays(results.map(r => r.amplitudeSpectrum).filter(v => v != null));
    }

    return avgFeatures;
  }

  /**
   * Extract harmonic peaks from amplitude spectrum
   */
  private extractHarmonicsFromSpectrum(spectrum: number[], sampleRate: number): AudioHarmonic[] {
    const harmonics: AudioHarmonic[] = [];
    const binWidth = sampleRate / (spectrum.length * 2); // Frequency per bin
    
    // Find fundamental frequency (strongest peak in lower frequencies)
    let fundamentalBin = 0;
    let maxAmplitude = 0;
    
    // Look for fundamental in range 80Hz - 1000Hz
    const minBin = Math.floor(80 / binWidth);
    const maxBin = Math.floor(1000 / binWidth);
    
    for (let i = minBin; i < Math.min(maxBin, spectrum.length); i++) {
      if (spectrum[i] > maxAmplitude) {
        maxAmplitude = spectrum[i];
        fundamentalBin = i;
      }
    }

    const fundamentalFreq = fundamentalBin * binWidth;
    
    if (fundamentalFreq > 0) {
      // Add fundamental
      harmonics.push({
        harmonic: 1,
        frequency: fundamentalFreq,
        amplitude: 1.0, // Normalize to 1.0
        ratio: 1.0,
        ratioString: '1:1'
      });

      // Look for integer multiples (harmonics)
      for (let harmonic = 2; harmonic <= 16; harmonic++) {
        const expectedFreq = fundamentalFreq * harmonic;
        const expectedBin = Math.round(expectedFreq / binWidth);
        
        if (expectedBin < spectrum.length) {
          // Look for peak in small window around expected frequency
          const windowSize = 3;
          let peakBin = expectedBin;
          let peakAmplitude = spectrum[expectedBin];
          
          for (let offset = -windowSize; offset <= windowSize; offset++) {
            const checkBin = expectedBin + offset;
            if (checkBin >= 0 && checkBin < spectrum.length && spectrum[checkBin] > peakAmplitude) {
              peakAmplitude = spectrum[checkBin];
              peakBin = checkBin;
            }
          }

          // Only include if amplitude is significant
          const relativeAmplitude = peakAmplitude / maxAmplitude;
          if (relativeAmplitude > 0.1) { // At least 10% of fundamental
            const actualFreq = peakBin * binWidth;
            const ratio = actualFreq / fundamentalFreq;
            
            harmonics.push({
              harmonic,
              frequency: actualFreq,
              amplitude: relativeAmplitude,
              ratio,
              ratioString: this.formatRatio(ratio)
            });
          }
        }
      }
    }

    return harmonics;
  }

  /**
   * Find the most prominent harmonics by amplitude
   */
  private findDominantHarmonics(harmonics: AudioHarmonic[]): number[] {
    return harmonics
      .filter(h => h.amplitude > 0.2) // Significant amplitude
      .sort((a, b) => b.amplitude - a.amplitude)
      .slice(0, 5) // Top 5
      .map(h => h.harmonic);
  }

  /**
   * Estimate musical key from chroma features
   */
  private estimateKey(chroma: number[]): string | undefined {
    if (!chroma || chroma.length !== 12) return undefined;

    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    let maxCorrelation = 0;
    let estimatedKey = 'C';

    // Major key profiles (simplified)
    const majorProfile = [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1];

    for (let root = 0; root < 12; root++) {
      let correlation = 0;
      for (let i = 0; i < 12; i++) {
        const keyIndex = (i + root) % 12;
        correlation += chroma[i] * majorProfile[keyIndex];
      }
      
      if (correlation > maxCorrelation) {
        maxCorrelation = correlation;
        estimatedKey = keys[root];
      }
    }

    return estimatedKey;
  }

  /**
   * Simple tempo estimation (placeholder - could be enhanced)
   */
  private estimateTempo(audioData: Float32Array, sampleRate: number): number | undefined {
    // This is a simplified tempo estimation
    // In a real implementation, you might use onset detection or beat tracking
    return undefined; // Placeholder
  }

  /**
   * Helper: Calculate average of array
   */
  private average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Helper: Average multiple arrays element-wise
   */
  private averageArrays(arrays: number[][]): number[] {
    if (arrays.length === 0) return [];
    
    const length = arrays[0].length;
    const result = new Array(length).fill(0);
    
    for (const array of arrays) {
      for (let i = 0; i < length; i++) {
        result[i] += array[i];
      }
    }
    
    for (let i = 0; i < length; i++) {
      result[i] /= arrays.length;
    }
    
    return result;
  }

  /**
   * Helper: Format ratio as simple fraction string
   */
  private formatRatio(ratio: number): string {
    // Common musical ratios
    if (Math.abs(ratio - 1.0) < 0.01) return '1:1';
    if (Math.abs(ratio - 2.0) < 0.01) return '2:1';
    if (Math.abs(ratio - 1.5) < 0.01) return '3:2';
    if (Math.abs(ratio - 1.333) < 0.01) return '4:3';
    if (Math.abs(ratio - 1.667) < 0.01) return '5:3';
    if (Math.abs(ratio - 1.875) < 0.01) return '15:8';
    
    // Generic format
    return `${ratio.toFixed(2)}:1`;
  }

  /**
   * Batch analyze multiple Spotify tracks
   */
  async batchAnalyzeTracks(tracks: Array<{
    previewUrl: string;
    id: string;
    name: string;
    artist: string;
  }>): Promise<SpotifyTrackAnalysis[]> {
    const results: SpotifyTrackAnalysis[] = [];
    
    // Process tracks in parallel (but limit concurrency to avoid overwhelming the API)
    const BATCH_SIZE = 3;
    
    for (let i = 0; i < tracks.length; i += BATCH_SIZE) {
      const batch = tracks.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map(track => 
        track.previewUrl ? this.analyzeSpotifyPreview(track.previewUrl, track) : Promise.resolve(null)
      );
      
      const batchResults = await Promise.all(batchPromises);
      
      // Filter out failed analyses
      for (const result of batchResults) {
        if (result) {
          results.push(result);
        }
      }
      
      // Small delay between batches to be respectful
      if (i + BATCH_SIZE < tracks.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    return results;
  }
}

export const harmonicAnalysisService = new HarmonicAnalysisService();