// Subscription Module - Exports for tiered pricing, billing, and premium features
// Note: This module will be implemented for the public launch with tiered subscriptions

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  limits: {
    playlists: number | 'unlimited';
    horoscopes: number | 'unlimited';
    chatMessages: number | 'unlimited';
    musicMode: 'personal' | 'both';
  };
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'cosmic-navigator',
    name: 'Cosmic Navigator',
    price: 0,
    features: [
      'Daily transits',
      'Weekly horoscopes', 
      'Basic playlists',
      'Mood journal & analytics'
    ],
    limits: {
      playlists: 1,
      horoscopes: 1,
      chatMessages: 50,
      musicMode: 'personal'
    }
  },
  {
    id: 'cosmic-chat',
    name: 'Cosmic Chat',
    price: 9.99,
    features: [
      'Everything in Cosmic Navigator',
      'Unlimited AI chat',
      'Gamified cosmic academy',
      'Premium astrological insights'
    ],
    limits: {
      playlists: 4,
      horoscopes: 4,
      chatMessages: 'unlimited',
      musicMode: 'both'
    }
  },
  {
    id: 'cosmic-gold',
    name: 'Cosmic Gold',
    price: 19.99,
    features: [
      'Everything in Cosmic Chat',
      'Beta access to new features',
      'Priority support',
      'Advanced birth chart analysis'
    ],
    limits: {
      playlists: 'unlimited',
      horoscopes: 'unlimited', 
      chatMessages: 'unlimited',
      musicMode: 'both'
    }
  }
];

// Placeholder for future subscription service
export class SubscriptionService {
  // To be implemented with Stripe integration
}