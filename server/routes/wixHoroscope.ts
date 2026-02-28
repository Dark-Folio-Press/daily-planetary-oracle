import { Router, Request, Response, NextFunction } from "express";
import { wixHoroscopeService } from "../services/wixHoroscope";
import { z } from "zod";
import Stripe from "stripe";
import OpenAI from "openai";
import { exec } from "child_process";
import { promisify } from "util";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY
});

const execAsync = promisify(exec);

const router = Router();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Wix-Api-Key");
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
};

router.use(corsMiddleware);

const optionalWixApiKeyAuth = async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers["x-wix-api-key"] as string;
  
  if (apiKey) {
    const isValid = await wixHoroscopeService.validateWixApiKey(apiKey);
    (req as any).hasValidWixApiKey = isValid;
  } else {
    (req as any).hasValidWixApiKey = false;
  }
  
  next();
};

router.use(optionalWixApiKeyAuth);

router.get("/daily", async (req: Request, res: Response) => {
  try {
    const date = req.query.date as string | undefined;
    const horoscopes = await wixHoroscopeService.getDailyHoroscopes(date);
    
    res.json({
      success: true,
      date: date || new Date().toISOString().split('T')[0],
      horoscopes: horoscopes.map(h => ({
        sign: h.zodiacSign,
        horoscope: h.horoscope,
        luckyNumber: h.luckyNumber,
        luckyColor: h.luckyColor,
        moodSummary: h.moodSummary,
        compatibility: h.compatibility
      }))
    });
  } catch (error) {
    console.error("Error fetching daily horoscopes:", error);
    res.status(500).json({ success: false, error: "Failed to fetch horoscopes" });
  }
});

router.get("/sign/:sign", async (req: Request, res: Response) => {
  try {
    const { sign } = req.params;
    const date = req.query.date as string | undefined;
    
    const horoscope = await wixHoroscopeService.getHoroscopeBySign(sign, date);
    
    if (!horoscope) {
      return res.status(404).json({ 
        success: false, 
        error: "Invalid zodiac sign. Use: aries, taurus, gemini, cancer, leo, virgo, libra, scorpio, sagittarius, capricorn, aquarius, pisces" 
      });
    }
    
    res.json({
      success: true,
      date: date || new Date().toISOString().split('T')[0],
      sign: horoscope.zodiacSign,
      horoscope: horoscope.horoscope,
      luckyNumber: horoscope.luckyNumber,
      luckyColor: horoscope.luckyColor,
      moodSummary: horoscope.moodSummary,
      compatibility: horoscope.compatibility
    });
  } catch (error) {
    console.error("Error fetching horoscope by sign:", error);
    res.status(500).json({ success: false, error: "Failed to fetch horoscope" });
  }
});

const personalizedSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Birth date must be in YYYY-MM-DD format"),
  birthTime: z.string().optional(),
  birthLocation: z.string().optional()
});

router.post("/personalized", async (req: Request, res: Response) => {
  try {
    const validation = personalizedSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid input",
        details: validation.error.errors 
      });
    }
    
    const { birthDate, birthTime, birthLocation } = validation.data;
    
    const horoscope = await wixHoroscopeService.generatePersonalizedHoroscope(
      birthDate,
      birthTime,
      birthLocation
    );
    
    res.json({
      success: true,
      ...horoscope
    });
  } catch (error) {
    console.error("Error generating personalized horoscope:", error);
    res.status(500).json({ success: false, error: "Failed to generate personalized horoscope" });
  }
});

router.post("/generate", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const adminKey = process.env.ADMIN_API_KEY;
    
    if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    
    const date = req.body.date as string | undefined;
    await wixHoroscopeService.generateDailyHoroscopes(date);
    
    res.json({ 
      success: true, 
      message: `Horoscopes generated for ${date || new Date().toISOString().split('T')[0]}`
    });
  } catch (error) {
    console.error("Error generating horoscopes:", error);
    res.status(500).json({ success: false, error: "Failed to generate horoscopes" });
  }
});

router.get("/vapid-public-key", (req: Request, res: Response) => {
  res.json({
    success: true,
    publicKey: process.env.VAPID_PUBLIC_KEY || null
  });
});

const pushSubscriptionSchema = z.object({
  userId: z.string(),
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string()
    })
  })
});

router.post("/push/subscribe", async (req: Request, res: Response) => {
  try {
    const validation = pushSubscriptionSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid subscription data",
        details: validation.error.errors 
      });
    }
    
    const { userId, subscription } = validation.data;
    
    await wixHoroscopeService.savePushSubscription(userId, subscription);
    
    res.json({ success: true, message: "Push subscription saved" });
  } catch (error) {
    console.error("Error saving push subscription:", error);
    res.status(500).json({ success: false, error: "Failed to save subscription" });
  }
});

router.post("/push/unsubscribe", async (req: Request, res: Response) => {
  try {
    const { userId, endpoint } = req.body;
    
    if (!userId || !endpoint) {
      return res.status(400).json({ success: false, error: "userId and endpoint required" });
    }
    
    await wixHoroscopeService.removePushSubscription(userId, endpoint);
    
    res.json({ success: true, message: "Push subscription removed" });
  } catch (error) {
    console.error("Error removing push subscription:", error);
    res.status(500).json({ success: false, error: "Failed to remove subscription" });
  }
});

router.post("/stripe/create-checkout", async (req: Request, res: Response) => {
  try {
    const { userId, email, successUrl, cancelUrl } = req.body;
    
    if (!userId || !email || !successUrl || !cancelUrl) {
      return res.status(400).json({ 
        success: false, 
        error: "userId, email, successUrl, and cancelUrl are required" 
      });
    }
    
    const checkoutUrl = await wixHoroscopeService.createStripeCheckout(
      userId,
      email,
      successUrl,
      cancelUrl
    );
    
    res.json({ success: true, checkoutUrl });
  } catch (error) {
    console.error("Error creating Stripe checkout:", error);
    res.status(500).json({ success: false, error: "Failed to create checkout session" });
  }
});

router.get("/subscription/status/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const status = await wixHoroscopeService.getUserSubscriptionStatus(userId);
    
    res.json({ success: true, ...status });
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    res.status(500).json({ success: false, error: "Failed to fetch subscription status" });
  }
});

router.post("/stripe/webhook", async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!stripe || !webhookSecret) {
    console.error("Stripe not configured");
    return res.status(500).json({ error: "Stripe not configured" });
  }
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
    
    await wixHoroscopeService.handleStripeWebhook(event);
    
    res.json({ received: true });
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message);
    res.status(400).json({ error: `Webhook Error: ${error.message}` });
  }
});

router.post("/admin/generate-api-key", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const adminKey = process.env.ADMIN_API_KEY;
    
    if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    
    const { siteName } = req.body;
    const apiKey = await wixHoroscopeService.createWixApiKey(siteName);
    
    res.json({ success: true, apiKey });
  } catch (error) {
    console.error("Error generating API key:", error);
    res.status(500).json({ success: false, error: "Failed to generate API key" });
  }
});

router.post("/admin/send-daily-notifications", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const adminKey = process.env.ADMIN_API_KEY;
    
    if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    
    const sentCount = await wixHoroscopeService.sendDailyNotificationsToSubscribers();
    
    res.json({ success: true, sentCount });
  } catch (error) {
    console.error("Error sending daily notifications:", error);
    res.status(500).json({ success: false, error: "Failed to send notifications" });
  }
});

router.get("/planets/sounds", async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    const KEPLER_FREQUENCIES: Record<string, number> = {
      Sun: 126.22, Moon: 210.42, Mercury: 141.27,
      Venus: 221.23, Mars: 144.72, Jupiter: 183.58, Saturn: 147.85
    };

    const MODULATION_RATES: Record<string, number> = {
      Moon: 10, Mercury: 5, Venus: 3.5, Sun: 2,
      Mars: 1.5, Jupiter: 0.8, Saturn: 0.3
    };

    const ORBIT_RADII: Record<string, number> = {
      Sun: 0, Mercury: 70, Venus: 100, Moon: 125,
      Mars: 155, Jupiter: 193, Saturn: 232
    };

    const ORBIT_SPEEDS: Record<string, number> = {
      Moon: 13.0, Mercury: 4.1, Venus: 1.6, Sun: 1.0,
      Mars: 0.53, Jupiter: 0.084, Saturn: 0.034
    };

    const ELEMENT_MAP: Record<string, string> = {
      Aries: 'fire', Leo: 'fire', Sagittarius: 'fire',
      Taurus: 'earth', Virgo: 'earth', Capricorn: 'earth',
      Gemini: 'air', Libra: 'air', Aquarius: 'air',
      Cancer: 'water', Scorpio: 'water', Pisces: 'water'
    };

    const WAVEFORM_MAP: Record<string, string> = {
      fire: 'sawtooth', earth: 'square', air: 'triangle', water: 'sine'
    };

    const PLANET_COLORS: Record<string, string> = {
      Sun: '#FFD700', Moon: '#C0C0C0', Mercury: '#B5B5B5',
      Venus: '#FFA07A', Mars: '#FF4500', Jupiter: '#DEB887', Saturn: '#DAA520'
    };

    const PLANET_SYMBOLS: Record<string, string> = {
      Sun: '☀️', Moon: '🌙', Mercury: '☿', Venus: '♀',
      Mars: '♂', Jupiter: '♃', Saturn: '♄'
    };

    let planetsRaw: Record<string, any> = {};
    let pythonSucceeded = false;

    try {
      const command = `python server/astrology_engine.py "${dateStr}" "12:00" "51.5074" "-0.1278"`;
      const { stdout } = await execAsync(command, { timeout: 15000 });
      const chartData = JSON.parse(stdout);
      if (chartData.planets && !chartData.error) {
        planetsRaw = chartData.planets;
        pythonSucceeded = true;
      }
    } catch (pyError) {
      console.error('Python engine error, using fallback:', pyError);
    }

    if (!pythonSucceeded) {
      const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
      const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
      const mkPlanet = (offset: number, speed: number) => ({
        sign: signs[Math.floor(((dayOfYear * speed) + offset) / 30) % 12],
        degree: Math.floor(((dayOfYear * speed) + offset) % 30),
        retrograde: false
      });
      planetsRaw = {
        Sun: mkPlanet(0, 1), Moon: mkPlanet(0, 13.2),
        Mercury: mkPlanet(20, 1.2), Venus: mkPlanet(45, 0.9),
        Mars: mkPlanet(80, 0.5), Jupiter: mkPlanet(120, 0.08),
        Saturn: mkPlanet(200, 0.03)
      };
    }

    const SIGN_INDEX: Record<string, number> = {
      Aries: 0, Taurus: 1, Gemini: 2, Cancer: 3, Leo: 4, Virgo: 5,
      Libra: 6, Scorpio: 7, Sagittarius: 8, Capricorn: 9, Aquarius: 10, Pisces: 11
    };

    const TARGET_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
    const planets = TARGET_PLANETS.map(name => {
      const raw = planetsRaw[name] || { sign: 'Aries', degree: 0, retrograde: false };
      const sign = raw.sign || 'Aries';
      const degree = raw.degree || 0;
      const retrograde = raw.retrograde || false;
      const element = ELEMENT_MAP[sign] || 'fire';
      const baseFreq = KEPLER_FREQUENCIES[name];
      const freqOffset = ((degree / 30) - 0.5) * 40;
      const modulationDepth = retrograde ? 85 : 40;
      const longitude = (SIGN_INDEX[sign] ?? 0) * 30 + degree;

      return {
        name,
        symbol: PLANET_SYMBOLS[name],
        sign,
        degree,
        longitude,
        retrograde,
        element,
        color: PLANET_COLORS[name],
        orbitRadius: ORBIT_RADII[name],
        orbitSpeed: ORBIT_SPEEDS[name],
        audio: {
          baseFrequency: baseFreq,
          frequency: Math.max(40, baseFreq + freqOffset),
          modulationRate: MODULATION_RATES[name],
          modulationDepth,
          waveform: WAVEFORM_MAP[element] || 'sine',
          volume: 0.4
        }
      };
    });

    res.json({
      success: true,
      date: dateStr,
      source: pythonSucceeded ? 'swiss_ephemeris' : 'calculated',
      planets
    });
  } catch (error) {
    console.error("Error generating planetary sounds data:", error);
    res.status(500).json({ success: false, error: "Failed to generate planetary sound data" });
  }
});

let dailyForecastCache: { date: string; data: Record<string, unknown> } | null = null;

router.get("/daily-forecast", async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    if (dailyForecastCache && dailyForecastCache.date === dateStr) {
      return res.json(dailyForecastCache.data);
    }

    const ELEMENT_MAP: Record<string, string> = {
      Aries: 'fire', Leo: 'fire', Sagittarius: 'fire',
      Taurus: 'earth', Virgo: 'earth', Capricorn: 'earth',
      Gemini: 'air', Libra: 'air', Aquarius: 'air',
      Cancer: 'water', Scorpio: 'water', Pisces: 'water'
    };

    const PLANET_SYMBOLS: Record<string, string> = {
      Sun: '☀️', Moon: '🌙', Mercury: '☿', Venus: '♀',
      Mars: '♂', Jupiter: '♃', Saturn: '♄'
    };

    const PLANET_COLORS: Record<string, string> = {
      Sun: '#FFD700', Moon: '#C0C0C0', Mercury: '#B5B5B5',
      Venus: '#FFA07A', Mars: '#FF4500', Jupiter: '#DEB887', Saturn: '#DAA520'
    };

    const PLANET_DOMAINS: Record<string, string> = {
      Sun: 'identity, vitality, life purpose',
      Moon: 'emotions, instincts, subconscious',
      Mercury: 'communication, thought, travel',
      Venus: 'love, beauty, values, money',
      Mars: 'action, desire, conflict, drive',
      Jupiter: 'expansion, luck, wisdom, growth',
      Saturn: 'structure, discipline, karma, limits'
    };

    let planetsRaw: Record<string, any> = {};
    let pythonSucceeded = false;

    try {
      const command = `python server/astrology_engine.py "${dateStr}" "12:00" "51.5074" "-0.1278"`;
      const { stdout } = await execAsync(command, { timeout: 15000 });
      const chartData = JSON.parse(stdout);
      if (chartData.planets && !chartData.error) {
        planetsRaw = chartData.planets;
        pythonSucceeded = true;
      }
    } catch (pyError) {
      console.error('Python engine error for daily forecast, using fallback:', pyError);
    }

    if (!pythonSucceeded) {
      const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
      const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
      const mkP = (offset: number, speed: number) => ({
        sign: signs[Math.floor(((dayOfYear * speed) + offset) / 30) % 12],
        degree: Math.floor(((dayOfYear * speed) + offset) % 30),
        retrograde: false
      });
      planetsRaw = {
        Sun: mkP(0, 1), Moon: mkP(0, 13.2), Mercury: mkP(20, 1.2),
        Venus: mkP(45, 0.9), Mars: mkP(80, 0.5), Jupiter: mkP(120, 0.08), Saturn: mkP(200, 0.03)
      };
    }

    const TARGET_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
    const planetPositions = TARGET_PLANETS.map(name => {
      const raw = planetsRaw[name] || { sign: 'Aries', degree: 0, retrograde: false };
      return {
        name,
        symbol: PLANET_SYMBOLS[name],
        sign: raw.sign || 'Aries',
        degree: Math.round(raw.degree || 0),
        retrograde: raw.retrograde || false,
        element: ELEMENT_MAP[raw.sign] || 'fire',
        color: PLANET_COLORS[name],
        domain: PLANET_DOMAINS[name]
      };
    });

    const planetSummary = planetPositions.map(p =>
      `${p.name} in ${p.sign} at ${p.degree}°${p.retrograde ? ' (retrograde)' : ''} — rules ${p.domain}`
    ).join('\n');

    const prompt = `Today is ${dateStr}. Here are the exact planetary positions from the Swiss Ephemeris:

${planetSummary}

You are a deadpan cosmic realist. Dry, blunt, and accurate. You name planetary energy plainly and let the absurdity speak for itself. No extended metaphors, no cocktail analogies, no clever wordplay. Just what the sky is actually doing — delivered with the flat affect of someone who has seen too many retrogrades to be surprised.

RULES:
- Use no similes or metaphors. Name planets and signs directly.
- Use modal language: "might," "could," "suggests," "may" — not certainties or predictions.
- Describe collective energy as something to work with, not as fate. Insight, not instruction.
- Dry observation is fine. Alarming predictions, doom, or anxiety-inducing statements are not.
- Do not venture into medical, legal, financial, or psychological advice of any kind.
- Dark humour must come from observation of cosmic absurdity — never from predictions of harm.

Write a DAILY ASTROLOGICAL FORECAST for today based precisely on these real planetary positions.

Structure your response as JSON with the following fields:
{
  "overallTheme": "A single blunt sentence stating the dominant energy of the day (max 20 words, direct and dry)",
  "overallInterpretation": "3-4 sentences. Name the actual planets and signs. Describe what they are doing and what that means for collective energy today. Dry and direct. No metaphors.",
  "planets": [
    {
      "name": "Sun",
      "headline": "Short sharp headline for Sun's influence today (max 10 words)",
      "interpretation": "2-3 sentences on what Sun in [sign] means for everyone today. Use the planet's domain (${PLANET_DOMAINS['Sun']}). Be specific about the sign's qualities. Direct and specific. No metaphors.",
      "advice": "One perspective for working with this energy today — framed as possibility, not instruction. Use 'might consider' or 'could be a time to' rather than directives."
    }
    // repeat for all 7 planets
  ],
  "dominantElement": "fire|earth|air|water",
  "elementalMood": "One sentence describing the elemental mood of today",
  "luckyWindow": "The best 2-3 hour window today for important actions (e.g. '2pm - 4pm')",
  "avoidWindow": "The worst window today (e.g. 'early morning until noon')",
  "dailyMantra": "A short mantra for today, darkly cosmic in tone",
  "cosmicNote": "One dry, deadpan observation about today's sky — wry and absurd, not alarming. Not a warning. No predictions of harm or loss."
}

Return ONLY valid JSON, no markdown code fences.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.72,
      max_tokens: 2000
    });

    const raw = completion.choices[0].message.content || '{}';
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const forecast = JSON.parse(cleaned);

    const responseData = {
      success: true,
      date: dateStr,
      source: pythonSucceeded ? 'swiss_ephemeris' : 'calculated',
      planetPositions,
      forecast
    };
    dailyForecastCache = { date: dateStr, data: responseData as Record<string, unknown> };
    res.json(responseData);
  } catch (error) {
    console.error("Error generating daily forecast:", error);
    res.status(500).json({ success: false, error: "Failed to generate daily forecast" });
  }
});

export default router;

