import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { updateProfileSchema, insertChatMessageSchema } from "@shared/schema";
import { generateHoroscope, calculateBirthChart } from "./services/astrology";
import { getAstrologyChatResponse } from "./services/openai";
import { premiumReportService } from "./services/premiumReports";
import { generateCosmicPlaylist } from "./services/cosmicPlaylist";
import { SpotifyService } from "./services/spotify";
import { calculateMoonPhase, generateMoonRituals, getMoonPhaseRecommendations } from "./services/moonCalendar";
import { createHash } from "crypto";

// PKCE helper functions for server-side crypto
function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function generateCodeChallenge(codeVerifier: string): string {
  const hash = createHash('sha256').update(codeVerifier).digest('base64');
  return hash.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile routes
  app.patch('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = updateProfileSchema.parse(req.body);
      
      // Calculate birth chart if birth data is provided
      let additionalData = {};
      if (validatedData.dateOfBirth && validatedData.timeOfBirth && validatedData.locationOfBirth) {
        try {
          const birthChart = await calculateBirthChart(
            validatedData.dateOfBirth,
            validatedData.timeOfBirth,
            validatedData.locationOfBirth
          );
          additionalData = {
            sunSign: birthChart.sunSign,
            moonSign: birthChart.moonSign,
            risingSign: birthChart.risingSign,
            birthChartData: birthChart.fullChart,
          };
        } catch (error) {
          console.error("Error calculating birth chart:", error);
        }
      }

      const updatedUser = await storage.updateUserProfile(userId, {
        ...validatedData,
        ...additionalData,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(400).json({ message: "Failed to update profile" });
    }
  });

  // Horoscope routes
  app.get('/api/horoscope/daily', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const today = new Date().toISOString().split('T')[0];
      
      // Check if horoscope already exists for today
      let horoscope = await storage.getUserHoroscopeForDate(userId, today);
      
      if (!horoscope) {
        // Generate new horoscope
        const newHoroscope = await generateHoroscope(user, today);
        horoscope = await storage.saveHoroscope(newHoroscope);
      }
      
      res.json(horoscope);
    } catch (error) {
      console.error("Error fetching daily horoscope:", error);
      res.status(500).json({ message: "Failed to fetch horoscope" });
    }
  });

  // Chat routes
  app.post('/api/chat/message', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get AI response
      const response = await getAstrologyChatResponse(message, user);

      // Save both user message and AI response
      await storage.saveChatMessage({
        userId,
        message,
        response: null,
        isFromUser: 'true',
      });

      await storage.saveChatMessage({
        userId,
        message: response,
        response: null,
        isFromUser: 'false',
      });

      res.json({ response });
    } catch (error) {
      console.error("Error processing chat message:", error);
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  // Enhanced astrology analysis routes
  app.post('/api/astrology/synastry', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { partner } = req.body;
      
      if (!partner?.dateOfBirth) {
        return res.status(400).json({ message: "Partner birth date is required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { analyzeSynastryCompatibility } = await import('./services/openai');
      const analysis = await analyzeSynastryCompatibility(user, partner);
      
      res.json({ analysis });
    } catch (error) {
      console.error("Error analyzing synastry:", error);
      res.status(500).json({ message: "Failed to analyze compatibility" });
    }
  });

  app.post('/api/astrology/transit-analysis', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { startDate, endDate } = req.body;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start and end dates are required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { analyzeTransitsForPeriod } = await import('./services/openai');
      const analysis = await analyzeTransitsForPeriod(user, startDate, endDate);
      
      res.json({ analysis });
    } catch (error) {
      console.error("Error analyzing transits:", error);
      res.status(500).json({ message: "Failed to analyze transits" });
    }
  });

  app.get('/api/chat/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messages = await storage.getUserChatMessages(userId, 50);
      res.json(messages.reverse()); // Return in chronological order
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  // Astrology tools routes
  app.get('/api/astrology/moon-phase', isAuthenticated, async (req: any, res) => {
    try {
      // Calculate current moon phase
      const now = new Date();
      const moonPhase = calculateMoonPhase(now);
      res.json(moonPhase);
    } catch (error) {
      console.error("Error fetching moon phase:", error);
      res.status(500).json({ message: "Failed to fetch moon phase" });
    }
  });

  app.get('/api/astrology/transits', isAuthenticated, async (req: any, res) => {
    try {
      // Get current planetary transits
      const transits = await getCurrentTransits();
      res.json(transits);
    } catch (error) {
      console.error("Error fetching transits:", error);
      res.status(500).json({ message: "Failed to fetch transits" });
    }
  });

  // Premium Reports Routes
  app.post('/api/premium/reports/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { type, parameters } = req.body;
      
      if (!type) {
        return res.status(400).json({ message: "Report type is required" });
      }

      // Check user access and subscription
      const accessCheck = await premiumReportService.checkUserAccess(userId);
      if (!accessCheck.hasAccess) {
        return res.status(403).json({ 
          message: "Premium subscription required",
          plan: accessCheck.plan 
        });
      }

      const reportData = await premiumReportService.generateReport({
        type,
        userId,
        parameters,
      });

      const savedReport = await storage.savePremiumReport(reportData);
      res.json(savedReport);
    } catch (error) {
      console.error("Error generating premium report:", error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  app.get('/api/premium/reports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reports = await premiumReportService.getUserReports(userId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.get('/api/premium/reports/:reportId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { reportId } = req.params;
      
      const report = await premiumReportService.getReport(reportId, userId);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      res.json(report);
    } catch (error) {
      console.error("Error fetching report:", error);
      res.status(500).json({ message: "Failed to fetch report" });
    }
  });

  // Cosmic Playlist Routes
  app.get('/api/cosmic-playlist/daily', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const playlist = await storage.getUserDailyPlaylist(userId);
      res.json(playlist);
    } catch (error) {
      console.error("Error fetching daily cosmic playlist:", error);
      res.status(500).json({ message: "Failed to fetch daily playlist" });
    }
  });

  app.post('/api/cosmic-playlist/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate playlist using AI service
      const playlistData = await generateCosmicPlaylist(user);
      
      // Save to database
      const savedPlaylist = await storage.saveCosmicPlaylist({
        userId,
        title: playlistData.title,
        description: playlistData.description,
        astrologyContext: playlistData.astrologyContext,
        mood: playlistData.mood,
        genres: playlistData.genres,
        tracks: playlistData.tracks,
        planetaryInfluence: playlistData.planetaryInfluence,
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // Valid for 24 hours
      });

      res.json(savedPlaylist);
    } catch (error) {
      console.error("Error generating cosmic playlist:", error);
      res.status(500).json({ message: "Failed to generate cosmic playlist" });
    }
  });

  app.get('/api/cosmic-playlist/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const playlists = await storage.getUserPlaylists(userId);
      res.json(playlists);
    } catch (error) {
      console.error("Error fetching playlist history:", error);
      res.status(500).json({ message: "Failed to fetch playlist history" });
    }
  });

  app.get('/api/premium/access', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const accessInfo = await premiumReportService.checkUserAccess(userId);
      res.json(accessInfo);
    } catch (error) {
      console.error("Error checking premium access:", error);
      res.status(500).json({ message: "Failed to check access" });
    }
  });

  // Subscription management routes
  app.get('/api/subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const subscription = await storage.getUserSubscription(userId);
      res.json(subscription || { plan: 'free', status: 'none' });
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  // Spotify integration routes
  app.get('/api/spotify/auth', isAuthenticated, async (req: any, res) => {
    try {
      const clientId = process.env.SPOTIFY_CLIENT_ID || 'e727323af75c4810983a20c6e8d7eec1';
      if (!clientId) {
        return res.status(500).json({ message: "Spotify integration not configured" });
      }

      const codeVerifier = generateRandomString(128);
      const codeChallenge = generateCodeChallenge(codeVerifier);

      // Store code verifier in user session
      (req.session as any).spotifyCodeVerifier = codeVerifier;

      const redirectUri = `https://${req.hostname}/api/spotify/callback`;
      const scopes = ['playlist-modify-public', 'playlist-modify-private', 'user-read-private'];
      
      const authUrl = new URL('https://accounts.spotify.com/authorize');
      authUrl.searchParams.append('client_id', clientId);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('redirect_uri', redirectUri);
      authUrl.searchParams.append('code_challenge_method', 'S256');
      authUrl.searchParams.append('code_challenge', codeChallenge);
      authUrl.searchParams.append('scope', scopes.join(' '));

      res.json({ authUrl: authUrl.toString() });
    } catch (error) {
      console.error("Error generating Spotify auth URL:", error);
      res.status(500).json({ message: "Failed to generate auth URL" });
    }
  });

  app.get('/api/spotify/callback', async (req: any, res) => {
    try {
      const { code, error } = req.query;
      
      if (error) {
        return res.redirect('/?spotify_error=' + encodeURIComponent(error));
      }

      if (!code || !req.session?.spotifyCodeVerifier) {
        return res.redirect('/?spotify_error=invalid_request');
      }

      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.SPOTIFY_CLIENT_ID || 'e727323af75c4810983a20c6e8d7eec1',
          grant_type: 'authorization_code',
          code: code as string,
          redirect_uri: `https://${req.hostname}/api/spotify/callback`,
          code_verifier: req.session.spotifyCodeVerifier,
        }),
      });

      const tokens = await response.json();
      
      if (!response.ok) {
        console.error('Spotify token exchange failed:', tokens);
        return res.redirect('/?spotify_error=token_exchange_failed');
      }

      // Store tokens in user session
      req.session.spotifyAccessToken = tokens.access_token;
      req.session.spotifyRefreshToken = tokens.refresh_token;
      
      res.redirect('/cosmic-playlist?spotify_connected=true');
    } catch (error) {
      console.error("Error in Spotify callback:", error);
      res.redirect('/?spotify_error=callback_error');
    }
  });



  app.post('/api/spotify/export-playlist', isAuthenticated, async (req: any, res) => {
    try {
      const { playlistId } = req.body;
      let spotifyAccessToken = req.session?.spotifyAccessToken;
      const spotifyRefreshToken = req.session?.spotifyRefreshToken;

      if (!spotifyAccessToken && !spotifyRefreshToken) {
        return res.status(401).json({ 
          message: "Spotify not connected",
          requiresReauth: true 
        });
      }

      const playlist = await storage.getCosmicPlaylist(playlistId);
      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
      }

      // Try with current token first
      let spotifyService = new SpotifyService(spotifyAccessToken);
      let user = await spotifyService.getCurrentUser();
      
      // If token is expired, try to refresh
      if (!user && spotifyRefreshToken) {
        console.log("Access token expired, attempting refresh...");
        try {
          const refreshResponse = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: process.env.SPOTIFY_CLIENT_ID || 'e727323af75c4810983a20c6e8d7eec1',
              grant_type: 'refresh_token',
              refresh_token: spotifyRefreshToken,
            }),
          });

          if (refreshResponse.ok) {
            const tokens = await refreshResponse.json();
            spotifyAccessToken = tokens.access_token;
            req.session.spotifyAccessToken = tokens.access_token;
            if (tokens.refresh_token) {
              req.session.spotifyRefreshToken = tokens.refresh_token;
            }
            
            // Try again with new token
            spotifyService = new SpotifyService(spotifyAccessToken);
            user = await spotifyService.getCurrentUser();
            console.log("Token refreshed successfully");
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
        }
      }

      if (!user) {
        return res.status(401).json({ 
          message: "Spotify authentication expired. Please reconnect to Spotify.",
          requiresReauth: true 
        });
      }

      const result = await spotifyService.exportCosmicPlaylist(
        playlist.tracks,
        playlist.title,
        `${playlist.description} - Generated by AstroBot based on your cosmic energy`
      );

      if (!result) {
        return res.status(500).json({ 
          message: "Failed to export to Spotify. Some tracks may not be available on Spotify." 
        });
      }

      // Update the playlist with Spotify URL
      await storage.updateCosmicPlaylistSpotifyUrl(playlistId, result.playlist.external_urls.spotify);

      res.json({
        success: true,
        spotifyUrl: result.playlist.external_urls.spotify,
        playlistName: result.playlist.name,
        foundTracks: result.foundTracks,
        totalTracks: result.totalTracks,
      });
    } catch (error) {
      console.error("Error exporting playlist to Spotify:", error);
      res.status(500).json({ 
        message: "Failed to export playlist. Please try reconnecting to Spotify." 
      });
    }
  });

  app.get('/api/spotify/status', isAuthenticated, async (req: any, res) => {
    const connected = !!req.session?.spotifyAccessToken;
    res.json({ connected });
  });

  // Moon Calendar Routes
  app.get('/api/moon/calendar/:date', isAuthenticated, async (req: any, res) => {
    try {
      const date = req.params.date;
      const requestDate = new Date(date);
      
      // Check if moon phase exists in database
      let moonPhase = await storage.getMoonPhase(date);
      
      if (!moonPhase) {
        // Calculate and save moon phase data
        const calculation = calculateMoonPhase(requestDate);
        try {
          moonPhase = await storage.saveMoonPhase({
            date,
            phase: calculation.phase,
            illumination: calculation.illumination.toString(),
            moonSign: calculation.moonSign,
            element: calculation.element,
            energy: calculation.energy,
          });
        } catch (insertError) {
          // If insert fails due to conflict, try to get existing
          moonPhase = await storage.getMoonPhase(date);
          if (!moonPhase) {
            // Return calculated data directly if database operations fail
            moonPhase = {
              id: `temp_${Date.now()}`,
              date,
              phase: calculation.phase,
              illumination: calculation.illumination.toString(),
              moonSign: calculation.moonSign,
              element: calculation.element,
              energy: calculation.energy,
              createdAt: new Date(),
            };
          }
        }
      }
      
      // Get recommendations
      const recommendations = getMoonPhaseRecommendations(moonPhase.phase, moonPhase.element || 'Earth');
      
      res.json({
        phase: moonPhase,
        recommendations,
      });
    } catch (error) {
      console.error('Error getting moon calendar data:', error);
      res.status(500).json({ message: 'Failed to get moon calendar data' });
    }
  });

  app.get('/api/moon/rituals/:phase', isAuthenticated, async (req: any, res) => {
    try {
      const phase = req.params.phase;
      const userId = req.user.claims.sub;
      
      // Get user profile for personalization
      const user = await storage.getUser(userId);
      
      // Try to get existing personalized rituals for this user and phase
      let rituals = await storage.getPersonalizedMoonRituals(userId, phase);
      
      if (!rituals || rituals.length === 0) {
        // Generate personalized rituals using AI
        const moonSign = req.query.moonSign || 'Virgo';
        const element = req.query.element || 'Earth';
        
        const { generatePersonalizedMoonRituals } = await import('./services/moonCalendar');
        const generatedRituals = await generatePersonalizedMoonRituals(
          phase, 
          moonSign, 
          element, 
          user
        );
        
        // Save personalized rituals to database
        const savedRituals = [];
        for (const ritual of generatedRituals) {
          const savedRitual = await storage.saveMoonRitual({
            userId,
            title: ritual.title,
            description: ritual.description,
            category: ritual.category,
            duration: ritual.duration,
            materials: ritual.materials,
            steps: ritual.steps,
            intention: ritual.intention,
            isPersonalized: true,
          });
          savedRituals.push(savedRitual);
        }
        rituals = savedRituals;
      }
      
      res.json(rituals);
    } catch (error) {
      console.error('Error getting moon rituals:', error);
      res.status(500).json({ message: 'Failed to get moon rituals' });
    }
  });

  app.post('/api/moon/tracking', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { date, journalEntry, mood, energy, dreams, synchronicities } = req.body;
      
      // Get or create moon phase for the date
      let moonPhase = await storage.getMoonPhase(date);
      if (!moonPhase) {
        const calculation = calculateMoonPhase(new Date(date));
        moonPhase = await storage.saveMoonPhase({
          date,
          phase: calculation.phase,
          illumination: calculation.illumination.toString(),
          moonSign: calculation.moonSign,
          element: calculation.element,
          energy: calculation.energy,
        });
      }
      
      // Save user tracking
      const tracking = await storage.saveUserMoonTracking({
        userId,
        moonPhaseId: moonPhase.id,
        journalEntry,
        mood,
        energy,
        dreams,
        synchronicities,
      });
      
      res.json(tracking);
    } catch (error) {
      console.error('Error saving moon tracking:', error);
      res.status(500).json({ message: 'Failed to save moon tracking' });
    }
  });

  app.get('/api/moon/tracking/:date', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const date = req.params.date;
      
      const tracking = await storage.getUserMoonTracking(userId, date);
      res.json(tracking);
    } catch (error) {
      console.error('Error getting moon tracking:', error);
      res.status(500).json({ message: 'Failed to get moon tracking' });
    }
  });

  // Cosmic Memory Lane API Routes
  app.get('/api/cosmic-memory/timeline', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const filter = req.query.filter as string;
      const range = req.query.range as string || '3months';
      
      // Calculate date range
      const now = new Date();
      let startDate: Date;
      
      switch (range) {
        case '1month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
        case '3months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
          break;
        case '6months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
          break;
        case '1year':
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          break;
        default:
          startDate = new Date(2020, 0, 1); // All time
      }

      const timelineEvents = await storage.getTimelineEvents(userId, filter, startDate, now);
      
      res.json({
        events: timelineEvents,
        range,
        filter: filter || 'all',
        count: timelineEvents.length,
        debug: {
          userId,
          filter,
          startDate: startDate.toISOString(),
          endDate: now.toISOString()
        }
      });
    } catch (error) {
      console.error('Error fetching timeline:', error);
      res.status(500).json({ message: 'Failed to fetch timeline' });
    }
  });

  app.get('/api/cosmic-memory/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const range = req.query.range as string || '3months';
      
      // Get cosmic events for the time range
      const cosmicEvents = await storage.getCosmicEvents(range);
      
      res.json({
        events: cosmicEvents,
        range
      });
    } catch (error) {
      console.error('Error fetching cosmic events:', error);
      res.status(500).json({ message: 'Failed to fetch cosmic events' });
    }
  });

  // Onboarding Journey routes
  app.get("/api/onboarding/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Initialize onboarding steps if they don't exist
      await storage.initializeOnboardingSteps(userId);
      
      // Update progress based on user activity
      await storage.checkAndUpdateOnboardingProgress(userId);
      
      // Get current steps
      const steps = await storage.getOnboardingSteps(userId);
      const completedCount = steps.filter(s => s.isCompleted).length;
      const completionPercentage = (completedCount / steps.length) * 100;
      
      // Determine current phase
      let currentPhase = "Getting Started";
      if (completionPercentage >= 80) currentPhase = "Cosmic Master";
      else if (completionPercentage >= 50) currentPhase = "Explorer";
      else if (completionPercentage >= 30) currentPhase = "Apprentice";
      
      // Generate next recommendations
      const nextSteps = steps.filter(s => !s.isCompleted).slice(0, 2);
      const nextRecommendations = nextSteps.map(step => step.stepTitle);
      
      res.json({
        steps,
        completionPercentage,
        currentPhase,
        nextRecommendations
      });
    } catch (error) {
      console.error("Error fetching onboarding progress:", error);
      res.status(500).json({ message: "Failed to fetch onboarding progress" });
    }
  });

  app.post("/api/onboarding/complete", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { stepKey } = req.body;
      
      if (!stepKey) {
        return res.status(400).json({ message: "stepKey is required" });
      }
      
      await storage.markOnboardingStepComplete(userId, stepKey);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking step complete:", error);
      res.status(500).json({ message: "Failed to mark step complete" });
    }
  });

  // Zodiac Journey routes
  app.get("/api/zodiac-journey/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Initialize zodiac journey if it doesn't exist
      await storage.initializeZodiacJourney(userId);
      
      // Get current progress, milestones, and achievements
      const progress = await storage.getZodiacJourneyProgress(userId);
      const milestones = await storage.getZodiacMilestones(userId);
      const achievements = await storage.getZodiacAchievements(userId);
      
      res.json({
        progress,
        milestones,
        achievements
      });
    } catch (error) {
      console.error("Error fetching zodiac journey progress:", error);
      res.status(500).json({ message: "Failed to fetch zodiac journey progress" });
    }
  });

  app.post("/api/zodiac-journey/complete-milestone", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { milestoneKey } = req.body;
      
      if (!milestoneKey) {
        return res.status(400).json({ message: "milestoneKey is required" });
      }
      
      await storage.completeZodiacMilestone(userId, milestoneKey);
      
      // Check for achievements
      const milestones = await storage.getZodiacMilestones(userId);
      const completedMilestones = milestones.filter(m => m.isCompleted);
      
      // First milestone achievement
      if (completedMilestones.length === 1) {
        await storage.unlockZodiacAchievement(userId, "first_milestone", 50);
      }
      
      // Milestone collector achievement
      if (completedMilestones.length === 10) {
        await storage.unlockZodiacAchievement(userId, "milestone_collector", 200);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error completing milestone:", error);
      res.status(500).json({ message: "Failed to complete milestone" });
    }
  });

  // Journal API Routes
  // AI Journal Suggestion route
  app.get('/api/journal/ai-suggestions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get current moon phase for context
      const moonPhase = calculateMoonPhase(new Date());
      
      const prompt = `As an expert astrologer, create 3 personalized journal prompts for someone with these details:
      - Sun Sign: ${user.sunSign || 'Unknown'}
      - Moon Sign: ${user.moonSign || 'Unknown'} 
      - Rising Sign: ${user.risingSign || 'Unknown'}
      - Current Moon Phase: ${moonPhase.phase}
      - Moon Illumination: ${Math.round(moonPhase.illumination * 100)}%

      Create prompts that help them reflect on:
      1. Current cosmic energies and how they're feeling them
      2. Personal growth aligned with their astrological makeup
      3. Manifestation and intention setting based on the moon phase

      Return as JSON with this structure:
      {
        "suggestions": [
          {
            "title": "Brief title (3-5 words)",
            "prompt": "Detailed reflection prompt (2-3 sentences)",
            "category": "cosmic_energy|personal_growth|manifestation",
            "astrological_focus": "sun|moon|rising|lunar_phase"
          }
        ]
      }

      Make each prompt specific to their signs and current lunar energy. Be inspiring and thoughtful.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert astrologer who creates personalized journal prompts. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
      });

      const suggestions = JSON.parse(response.choices[0].message.content);
      
      res.json({
        ...suggestions,
        user_context: {
          sunSign: user.sunSign,
          moonSign: user.moonSign,
          risingSign: user.risingSign,
          moonPhase: moonPhase.phase,
          illumination: Math.round(moonPhase.illumination * 100)
        }
      });

    } catch (error) {
      console.error("Error generating journal suggestions:", error);
      res.status(500).json({ message: "Failed to generate suggestions" });
    }
  });

  app.get('/api/journal/entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const tag = req.query.tag as string;
      const mood = req.query.mood as string;
      
      const entries = await storage.getUserJournalEntries(userId, limit, tag, mood);
      res.json(entries);
    } catch (error) {
      console.error('Error getting journal entries:', error);
      res.status(500).json({ message: 'Failed to get journal entries' });
    }
  });

  // Get all tags with their frequencies
  app.get('/api/journal/tags', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tagStats = await storage.getUserJournalTags(userId);
      res.json(tagStats);
    } catch (error) {
      console.error('Error getting journal tags:', error);
      res.status(500).json({ message: 'Failed to get journal tags' });
    }
  });

  app.post('/api/journal/entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entryData = {
        ...req.body,
        userId,
      };
      
      const entry = await storage.saveJournalEntry(entryData);
      res.json(entry);
    } catch (error) {
      console.error('Error creating journal entry:', error);
      res.status(500).json({ message: 'Failed to create journal entry' });
    }
  });

  app.get('/api/journal/entries/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entryId = req.params.id;
      
      const entry = await storage.getJournalEntry(entryId, userId);
      if (!entry) {
        return res.status(404).json({ message: 'Journal entry not found' });
      }
      
      res.json(entry);
    } catch (error) {
      console.error('Error getting journal entry:', error);
      res.status(500).json({ message: 'Failed to get journal entry' });
    }
  });

  app.put('/api/journal/entries/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entryId = req.params.id;
      
      const entry = await storage.updateJournalEntry(entryId, userId, req.body);
      res.json(entry);
    } catch (error) {
      console.error('Error updating journal entry:', error);
      res.status(500).json({ message: 'Failed to update journal entry' });
    }
  });

  app.delete('/api/journal/entries/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entryId = req.params.id;
      
      const deleted = await storage.deleteJournalEntry(entryId, userId);
      if (!deleted) {
        return res.status(404).json({ message: 'Journal entry not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      res.status(500).json({ message: 'Failed to delete journal entry' });
    }
  });

  // Personalized Lunar Energy Recommendations API
  app.get('/api/moon/energy-recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get current moon data
      const today = new Date().toISOString().split('T')[0];
      let moonData = await storage.getMoonPhase(today);
      
      if (!moonData) {
        // Generate moon data for today
        const { calculateMoonPhase } = await import('./services/moonCalendar');
        const moonPhaseData = calculateMoonPhase(new Date());
        
        moonData = await storage.saveMoonPhase({
          date: today,
          phase: moonPhaseData.phase,
          illumination: moonPhaseData.illumination.toString(),
          moonSign: moonPhaseData.moonSign,
          element: moonPhaseData.element,
          energy: moonPhaseData.energy,
        });
      }

      // Generate personalized lunar energy recommendations
      const { generateLunarEnergyRecommendations } = await import('./services/moonCalendar');
      const recommendations = await generateLunarEnergyRecommendations(
        moonData.phase,
        moonData.moonSign || 'Virgo',
        moonData.element || 'Earth',
        user
      );

      res.json({
        moonPhase: moonData,
        recommendations,
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error getting lunar energy recommendations:', error);
      res.status(500).json({ message: 'Failed to get lunar energy recommendations' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions

async function getCurrentTransits() {
  // Simplified planetary transits - in production, use astronomical API
  return [
    {
      planet: 'Venus',
      symbol: '♀',
      event: 'Entering Taurus',
      date: 'Today',
      significance: 'Love and relationships focus on stability and sensuality',
    },
    {
      planet: 'Mars',
      symbol: '♂',
      event: 'Conjunct Jupiter',
      date: 'Tomorrow',
      significance: 'Energy and expansion combine for powerful action',
    },
    {
      planet: 'Mercury',
      symbol: '☿',
      event: 'Retrograde ends',
      date: 'Mar 18',
      significance: 'Communication and technology issues resolve',
    },
  ];
}
