import { Router, Request, Response, NextFunction } from "express";
import { wixHoroscopeService } from "../services/wixHoroscope";
import { z } from "zod";
import Stripe from "stripe";

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

export default router;
