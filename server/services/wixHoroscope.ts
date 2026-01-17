import OpenAI from "openai";
import webpush from "web-push";
import Stripe from "stripe";
import { db } from "../db";
import { 
  dailyHoroscopes, 
  pushSubscriptions, 
  stripeSubscriptions,
  users,
  wixApiKeys
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const ZODIAC_SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

const ZODIAC_DATE_RANGES: Record<string, { start: string; end: string }> = {
  'aries': { start: '03-21', end: '04-19' },
  'taurus': { start: '04-20', end: '05-20' },
  'gemini': { start: '05-21', end: '06-20' },
  'cancer': { start: '06-21', end: '07-22' },
  'leo': { start: '07-23', end: '08-22' },
  'virgo': { start: '08-23', end: '09-22' },
  'libra': { start: '09-23', end: '10-22' },
  'scorpio': { start: '10-23', end: '11-21' },
  'sagittarius': { start: '11-22', end: '12-21' },
  'capricorn': { start: '12-22', end: '01-19' },
  'aquarius': { start: '01-20', end: '02-18' },
  'pisces': { start: '02-19', end: '03-20' }
};

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:horoscope@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export class WixHoroscopeService {
  async generateDailyHoroscopes(date?: string): Promise<void> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    console.log(`Generating dark sardonic horoscopes for ${targetDate}...`);

    const prompt = `Generate 12 daily horoscopes for ${targetDate}, one for each zodiac sign.

VOICE REQUIREMENTS - CRITICAL:
- Write in a DARK, SARDONIC, and CYNICALLY WITTY voice
- Think: a jaded psychic who's seen too much but still has dark humor about it
- Mix genuine cosmic insight with biting observations about human nature
- Include occasional black comedy and gallows humor
- Be entertainingly pessimistic while still offering actual guidance
- Channel energy like: "The stars don't care about your problems, but here's what they're up to anyway"

Example tone:
"Mercury retrograde isn't ruining your life - your choices are. But at least you can blame the cosmos for the next three weeks."

For each sign, provide:
1. A horoscope paragraph (3-4 sentences, dark and sardonic but with genuine insight)
2. Lucky number (1-99)
3. Lucky color
4. Mood summary (2-3 words capturing the day's vibe)
5. Most compatible sign for the day

Respond in this exact JSON format:
{
  "horoscopes": [
    {
      "sign": "aries",
      "horoscope": "Your aggressive optimism meets the brick wall of reality today...",
      "luckyNumber": 13,
      "luckyColor": "blood red",
      "moodSummary": "Aggressively Optimistic",
      "compatibility": "leo"
    }
  ]
}

Include all 12 signs in this order: aries, taurus, gemini, cancer, leo, virgo, libra, scorpio, sagittarius, capricorn, aquarius, pisces.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a darkly sardonic astrologer who delivers cosmic truths with biting wit and gallows humor. Your horoscopes are entertainingly cynical while still offering genuine astrological insight. Think of yourself as the lovechild of a fortune teller and a stand-up comedian who's had a rough life."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const data = JSON.parse(response.choices[0].message.content || "{}");
      
      if (!data.horoscopes || !Array.isArray(data.horoscopes)) {
        throw new Error("Invalid horoscope response format");
      }

      for (const horoscope of data.horoscopes) {
        const existing = await db.select()
          .from(dailyHoroscopes)
          .where(and(
            eq(dailyHoroscopes.date, targetDate),
            eq(dailyHoroscopes.zodiacSign, horoscope.sign.toLowerCase())
          ))
          .limit(1);

        if (existing.length > 0) {
          await db.update(dailyHoroscopes)
            .set({
              horoscope: horoscope.horoscope,
              luckyNumber: horoscope.luckyNumber,
              luckyColor: horoscope.luckyColor,
              moodSummary: horoscope.moodSummary,
              compatibility: horoscope.compatibility
            })
            .where(eq(dailyHoroscopes.id, existing[0].id));
        } else {
          await db.insert(dailyHoroscopes).values({
            date: targetDate,
            zodiacSign: horoscope.sign.toLowerCase(),
            horoscope: horoscope.horoscope,
            luckyNumber: horoscope.luckyNumber,
            luckyColor: horoscope.luckyColor,
            moodSummary: horoscope.moodSummary,
            compatibility: horoscope.compatibility
          });
        }
      }

      console.log(`Successfully generated ${data.horoscopes.length} horoscopes for ${targetDate}`);
    } catch (error) {
      console.error("Error generating daily horoscopes:", error);
      throw error;
    }
  }

  async getDailyHoroscopes(date?: string): Promise<any[]> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const horoscopes = await db.select()
      .from(dailyHoroscopes)
      .where(eq(dailyHoroscopes.date, targetDate))
      .orderBy(dailyHoroscopes.zodiacSign);

    if (horoscopes.length === 0) {
      await this.generateDailyHoroscopes(targetDate);
      return this.getDailyHoroscopes(targetDate);
    }

    return horoscopes;
  }

  async getHoroscopeBySign(sign: string, date?: string): Promise<any | null> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const normalizedSign = sign.toLowerCase();
    
    if (!ZODIAC_SIGNS.includes(normalizedSign)) {
      return null;
    }

    const horoscope = await db.select()
      .from(dailyHoroscopes)
      .where(and(
        eq(dailyHoroscopes.date, targetDate),
        eq(dailyHoroscopes.zodiacSign, normalizedSign)
      ))
      .limit(1);

    if (horoscope.length === 0) {
      await this.generateDailyHoroscopes(targetDate);
      return this.getHoroscopeBySign(sign, targetDate);
    }

    return horoscope[0];
  }

  getZodiacSign(birthDate: string): string {
    const date = new Date(birthDate);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const monthDay = `${month}-${day}`;

    for (const [sign, range] of Object.entries(ZODIAC_DATE_RANGES)) {
      if (sign === 'capricorn') {
        if (monthDay >= '12-22' || monthDay <= '01-19') {
          return sign;
        }
      } else {
        if (monthDay >= range.start && monthDay <= range.end) {
          return sign;
        }
      }
    }
    return 'aries';
  }

  async generatePersonalizedHoroscope(
    birthDate: string,
    birthTime?: string,
    birthLocation?: string
  ): Promise<any> {
    const todayDate = new Date().toISOString().split('T')[0];
    const zodiacSign = this.getZodiacSign(birthDate);
    
    const generalHoroscope = await this.getHoroscopeBySign(zodiacSign, todayDate);
    
    const birthInfo = birthTime && birthLocation 
      ? `born at ${birthTime} in ${birthLocation}` 
      : '';

    const prompt = `Generate a PERSONALIZED daily horoscope for someone born on ${birthDate} ${birthInfo}.
Their sun sign is ${zodiacSign.charAt(0).toUpperCase() + zodiacSign.slice(1)}.

VOICE REQUIREMENTS - CRITICAL:
- Write in a DARK, SARDONIC, and CYNICALLY WITTY voice
- Think: a jaded psychic who's seen too much but still has dark humor about it
- Be entertainingly pessimistic while still offering genuine astrological insight
- The cosmos doesn't coddle, neither should you

Today's date is ${todayDate}.

Provide a personalized horoscope that feels unique to THIS person, not just their sun sign.
Reference specific planetary transits affecting their birth chart today.

Respond in JSON format:
{
  "personalizedHoroscope": "Your personalized dark sardonic reading...",
  "cosmicAdvice": "One piece of sardonic cosmic wisdom",
  "warningFromTheVoid": "Something the cosmos wants you to watch out for",
  "luckyOmen": "An omen that might actually be lucky (expressed sardonically)"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a darkly sardonic personal astrologer. You deliver cosmic truths with biting wit and dark humor, but your readings are genuinely insightful and personalized."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const personalData = JSON.parse(response.choices[0].message.content || "{}");

    return {
      date: todayDate,
      zodiacSign,
      generalHoroscope: generalHoroscope?.horoscope,
      ...personalData,
      luckyNumber: generalHoroscope?.luckyNumber,
      luckyColor: generalHoroscope?.luckyColor,
      moodSummary: generalHoroscope?.moodSummary,
      compatibility: generalHoroscope?.compatibility
    };
  }

  async savePushSubscription(
    userId: string,
    subscription: { endpoint: string; keys: { p256dh: string; auth: string } }
  ): Promise<void> {
    const existing = await db.select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, subscription.endpoint))
      .limit(1);

    if (existing.length > 0) {
      await db.update(pushSubscriptions)
        .set({
          userId,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          isActive: true
        })
        .where(eq(pushSubscriptions.id, existing[0].id));
    } else {
      await db.insert(pushSubscriptions).values({
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        isActive: true
      });
    }
  }

  async removePushSubscription(userId: string, endpoint: string): Promise<void> {
    await db.update(pushSubscriptions)
      .set({ isActive: false })
      .where(and(
        eq(pushSubscriptions.userId, userId),
        eq(pushSubscriptions.endpoint, endpoint)
      ));
  }

  async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    url?: string
  ): Promise<void> {
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      console.warn("VAPID keys not configured, skipping push notification");
      return;
    }

    const subscriptions = await db.select()
      .from(pushSubscriptions)
      .where(and(
        eq(pushSubscriptions.userId, userId),
        eq(pushSubscriptions.isActive, true)
      ));

    const payload = JSON.stringify({
      title,
      body,
      url: url || '/',
      icon: '/horoscope-icon.png'
    });

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth
            }
          },
          payload
        );

        await db.update(pushSubscriptions)
          .set({ lastNotificationSent: new Date() })
          .where(eq(pushSubscriptions.id, sub.id));
      } catch (error: any) {
        console.error(`Failed to send push to ${sub.endpoint}:`, error);
        if (error.statusCode === 410 || error.statusCode === 404) {
          await db.update(pushSubscriptions)
            .set({ isActive: false })
            .where(eq(pushSubscriptions.id, sub.id));
        }
      }
    }
  }

  async sendDailyNotificationsToSubscribers(): Promise<number> {
    const activeSubscribers = await db.select({
      user: users,
      subscription: stripeSubscriptions
    })
    .from(users)
    .innerJoin(stripeSubscriptions, eq(users.id, stripeSubscriptions.userId))
    .where(eq(stripeSubscriptions.status, 'active'));

    let sentCount = 0;

    for (const { user } of activeSubscribers) {
      if (!user.birthDate) continue;

      try {
        const zodiacSign = this.getZodiacSign(user.birthDate);
        const horoscope = await this.getHoroscopeBySign(zodiacSign);
        
        if (horoscope) {
          const title = `${zodiacSign.charAt(0).toUpperCase() + zodiacSign.slice(1)} Daily Horoscope`;
          const body = horoscope.horoscope.substring(0, 100) + '...';
          
          await this.sendPushNotification(user.id, title, body, '/horoscope');
          sentCount++;
        }
      } catch (error) {
        console.error(`Failed to send notification to user ${user.id}:`, error);
      }
    }

    return sentCount;
  }

  async createStripeCheckout(
    userId: string,
    userEmail: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<string> {
    let customer;
    
    const existingSub = await db.select()
      .from(stripeSubscriptions)
      .where(eq(stripeSubscriptions.userId, userId))
      .limit(1);

    if (existingSub.length > 0) {
      customer = await stripe.customers.retrieve(existingSub[0].stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId }
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Daily Horoscope Push Notifications',
              description: 'Get your personalized dark sardonic horoscope delivered daily'
            },
            unit_amount: 200,
            recurring: {
              interval: 'month'
            }
          },
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId }
    });

    return session.url || '';
  }

  async handleStripeWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (userId && subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
          
          await db.insert(stripeSubscriptions).values({
            userId,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            status: subscription.status,
            currentPeriodStart: subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : null,
            currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null
          }).onConflictDoUpdate({
            target: stripeSubscriptions.userId,
            set: {
              stripeSubscriptionId: subscriptionId,
              status: subscription.status,
              currentPeriodStart: subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : null,
              currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
              updatedAt: new Date()
            }
          });
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const customerId = subscription.customer as string;

        const existing = await db.select()
          .from(stripeSubscriptions)
          .where(eq(stripeSubscriptions.stripeCustomerId, customerId))
          .limit(1);

        if (existing.length > 0) {
          await db.update(stripeSubscriptions)
            .set({
              status: subscription.status,
              currentPeriodStart: subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : null,
              currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
              updatedAt: new Date()
            })
            .where(eq(stripeSubscriptions.id, existing[0].id));
        }
        break;
      }
    }
  }

  async getUserSubscriptionStatus(userId: string): Promise<{
    hasActiveSubscription: boolean;
    subscription: any | null;
  }> {
    const sub = await db.select()
      .from(stripeSubscriptions)
      .where(and(
        eq(stripeSubscriptions.userId, userId),
        eq(stripeSubscriptions.status, 'active')
      ))
      .limit(1);

    return {
      hasActiveSubscription: sub.length > 0,
      subscription: sub[0] || null
    };
  }

  async validateWixApiKey(apiKey: string): Promise<boolean> {
    const key = await db.select()
      .from(wixApiKeys)
      .where(and(
        eq(wixApiKeys.apiKey, apiKey),
        eq(wixApiKeys.isActive, true)
      ))
      .limit(1);

    if (key.length > 0) {
      await db.update(wixApiKeys)
        .set({ lastUsed: new Date() })
        .where(eq(wixApiKeys.id, key[0].id));
      return true;
    }

    return false;
  }

  async createWixApiKey(siteName?: string): Promise<string> {
    const apiKey = `wix_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    await db.insert(wixApiKeys).values({
      apiKey,
      siteName: siteName || 'Unknown Site',
      isActive: true
    });

    return apiKey;
  }
}

export const wixHoroscopeService = new WixHoroscopeService();
