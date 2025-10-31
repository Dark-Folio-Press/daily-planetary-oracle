// Subscription Module - Exports for tiered pricing, billing, and premium features
// SPOTIFY COMPLIANCE NOTE: 
// - Spotify export is FREE for ALL users (guest, free, paid) - we do NOT charge for this
// - We charge for: AI curation, astrology analysis, personalization, and premium features
// - Spotify personalization (reading user's music taste) is a paid feature for better recommendations
// - This keeps us compliant with Spotify Developer Policy for Extended Quota Mode (25+ users)

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  limits: {
    playlists: number | 'unlimited';
    horoscopes: number | 'unlimited';
    birthCharts?: number | 'unlimited';
    chatMessages: number | 'unlimited';
    pushNotifications?: boolean;
    moodTracking?: boolean;
    astroWeather?: boolean;
    lunarPhases?: boolean;
    monthlyReports?: boolean;
    historyAccess?: boolean;
    musicMode: 'personal' | 'both';
    spotifyPersonalization?: boolean; // Paid feature: Read user's Spotify data for better recommendations
    requiresLogin?: boolean; // Whether this tier requires account creation
  };
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'vibes',
    name: 'Vibes',
    price: 0,
    features: [
      'Guest mode - no login required',
      '3 AI-generated cosmic playlists per week',
      'Basic astrological insights',
      'Free Spotify export for all playlists',
      'No history/saving (browser-only sessions)'
    ],
    limits: {
      playlists: 3, // 3 AI generations per week
      horoscopes: 7, // Daily insights for week
      chatMessages: 0,
      historyAccess: false,
      musicMode: 'personal',
      spotifyPersonalization: false, // Cannot read Spotify data
      requiresLogin: false // Guest mode enabled
    }
  },
  {
    id: 'stardust',
    name: 'Stardust',
    price: 9.99,
    features: [
      'All of Vibes PLUS',
      'Unlimited AI-generated playlists',
      'Spotify personalization (connect your account for better recommendations)',
      'Unlimited birth chart readings',
      'Daily personal transit push notifications',
      'Weekly personal horoscope push notifications', 
      'Weekly playlist notification',
      'Save and access playlist history',
      'Free Spotify export (same as free tier)'
    ],
    limits: {
      playlists: 'unlimited',
      horoscopes: 'unlimited',
      birthCharts: 'unlimited',
      pushNotifications: true,
      chatMessages: 0,
      historyAccess: true,
      musicMode: 'personal',
      spotifyPersonalization: true, // Can connect Spotify to read music taste
      requiresLogin: true // Requires account
    }
  },
  {
    id: 'cosmic',
    name: 'Cosmic',
    price: 14.99,
    features: [
      'All of Stardust PLUS',
      '90 min AI chat per month',
      'Spotify personalization with Discovery Mode (explore new music)',
      'Daily Astro Weather and Lunar Phases',
      'Mood tracking, journal, analytics dashboard',
      'Monthly cosmic report centered on your astrological data',
      'Planetary frequency resonance analysis',
      'Free Spotify export (same as free tier)',
      'Upgrade path to unlimited chat at $9.99/month'
    ],
    limits: {
      playlists: 'unlimited',
      horoscopes: 'unlimited',
      birthCharts: 'unlimited',
      pushNotifications: true,
      chatMessages: 5400, // 90 min = ~5400 seconds of chat
      moodTracking: true,
      astroWeather: true,
      lunarPhases: true,
      monthlyReports: true,
      historyAccess: true,
      musicMode: 'both', // Personal + Discovery
      spotifyPersonalization: true, // Can connect Spotify to read music taste
      requiresLogin: true // Requires account
    }
  }
];

// Add-on subscriptions
export const ADD_ON_SUBSCRIPTIONS = [
  {
    id: 'cosmic-chat',
    name: 'CosmicChat',
    price: 9.99,
    description: 'Unlimited AI chat',
    feature: 'unlimitedChat'
  },
  {
    id: 'cosmic-academy',
    name: 'CosmicAcademy', 
    price: 9.99,
    description: 'Learn at your own pace, cancel anytime',
    courses: [
      'Master Your Chart - Learn Astrology by Mastering Your Chart',
      'Charting For Two - Synastry Charts for Relationships',
      'Predictive Astrology - Techniques, Forming a question, Choosing a technique, Recording observations, repeatable observations'
    ]
  }
];

// Future tier (not implemented yet)
export const FUTURE_TIER = {
  id: 'mystic',
  name: 'Mystic',
  price: 39.99,
  features: [
    'Everything in Cosmic',
    'Enhanced Journaling Features',
    'Lunar Rituals',
    'Personal grimoire AI assistant',
    'Custom astrological reports',
    'Future tarot readings',
    'Runes divination',
    'Priority support'
  ]
};

// Placeholder for future subscription service
export class SubscriptionService {
  // To be implemented with Stripe integration
}