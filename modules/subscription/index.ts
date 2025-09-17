// Subscription Module - Exports for tiered pricing, billing, and premium features
// Note: This module will be implemented for the public launch with tiered subscriptions

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  limits: {
    playlists: number | 'unlimited';
    spotifyExports?: number | 'unlimited';
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
  };
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'vibes',
    name: 'Vibes',
    price: 0,
    features: [
      'Personalized weekly/daily playlists based on astrological data',
      'Basic astrological insight for each day of the week',
      'Spotify integration (1 export, 3 generations)',
      'No history/saving'
    ],
    limits: {
      playlists: 3, // 3 generations
      spotifyExports: 1,
      horoscopes: 7, // Daily insights for week
      chatMessages: 0,
      historyAccess: false,
      musicMode: 'personal'
    }
  },
  {
    id: 'stardust',
    name: 'Stardust',
    price: 9.99,
    features: [
      'All of Vibes PLUS',
      'Daily personal transit push notifications',
      'Weekly personal horoscope push notifications', 
      'Weekly playlist notification',
      'Unlimited birth chart readings'
    ],
    limits: {
      playlists: 'unlimited',
      spotifyExports: 'unlimited',
      horoscopes: 'unlimited',
      birthCharts: 'unlimited',
      pushNotifications: true,
      chatMessages: 0,
      historyAccess: true,
      musicMode: 'personal'
    }
  },
  {
    id: 'cosmic',
    name: 'Cosmic',
    price: 14.99,
    features: [
      'All of Stardust PLUS',
      '90 min AI chat per month',
      'Daily Astro Weather and Lunar Phases',
      'Mood tracking, journal, analytics dashboard',
      'Monthly cosmic report centered on your astrological data',
      'Upgrade path to unlimited chat at $9.99/month'
    ],
    limits: {
      playlists: 'unlimited',
      spotifyExports: 'unlimited', 
      horoscopes: 'unlimited',
      birthCharts: 'unlimited',
      pushNotifications: true,
      chatMessages: 5400, // 90 min = ~5400 seconds of chat
      moodTracking: true,
      astroWeather: true,
      lunarPhases: true,
      monthlyReports: true,
      historyAccess: true,
      musicMode: 'both'
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