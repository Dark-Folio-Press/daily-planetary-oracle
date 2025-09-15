# Cosmic Music Curator - Modular Architecture

This directory contains the modular organization of the Cosmic Music Curator application, designed to support a tiered subscription service with clean separation of concerns.

## Module Structure

### 🤖 AI Chat (`/ai-chat`)
**Purpose:** Handles all AI-powered chat functionality and OpenAI integration
- `services/openai.ts` - OpenAI GPT-4o integration for cosmic conversations
- `components/chat-input.tsx` - User message input interface
- `components/chat-message.tsx` - Message display and formatting
- `components/chat.tsx` - Main chat page component

### 🌟 Astrology (`/astrology`) 
**Purpose:** Comprehensive astrological calculations and chart generation
- `services/astrology.ts` - Core astrological calculations and transit analysis
- `python-engines/astrology_engine.py` - Swiss Ephemeris birth chart calculations
- `python-engines/chart_visualizer.py` - SVG chart generation with themes
- `components/birth-chart-generator.tsx` - Interactive birth chart creation
- `components/enhanced-vintage-chart.tsx` - Styled chart displays
- `components/houses-chart.tsx` - Astrological houses visualization

### 🎵 Music (`/music`)
**Purpose:** Spotify integration and cosmic playlist generation  
- `services/spotify.ts` - Full Spotify Web API integration with OAuth
- `components/cosmic-loading.tsx` - Music-specific loading animations

### 📊 Mood Tracking (`/mood-tracking`)
**Purpose:** Daily mood tracking with astrological correlation analysis
- `services/correlation.ts` - Advanced mood-transit correlation analysis
- `services/lunar.ts` - Moon phase calculations and lunar influence tracking
- `components/mood-tracker.tsx` - Daily mood entry interface
- `components/mood-history.tsx` - Historical mood calendar and analytics
- `components/mood-transit-dashboard.tsx` - Comprehensive correlation dashboard
- `components/mood-analysis.tsx` - Mood analysis page wrapper

### 👤 Auth & User (`/auth-user`)
**Purpose:** Authentication, user management, and profile functionality
- `services/auth.ts` - Authentication middleware and session management
- `services/replitAuth.ts` - Legacy Replit authentication (being phased out)
- `services/useAuth.ts` - React hook for authentication state
- `services/useOAuthAvailable.ts` - OAuth provider availability detection
- `components/avatar-selector.tsx` - User avatar selection interface
- `components/avatar-display.tsx` - Avatar display component
- `components/login.tsx` - Login page
- `components/signup.tsx` - User registration
- `components/profile-setup.tsx` - Birth data collection and profile completion

### 💎 Subscription (`/subscription`)
**Purpose:** Tiered subscription management and billing (for public launch)
- Defines three subscription tiers:
  - **Cosmic Navigator** (Free): Basic features with weekly limits
  - **Cosmic Chat** ($9.99): Unlimited chat + gamified academy
  - **Cosmic Gold** ($19.99): Everything + beta access + premium features
- Ready for Stripe integration and feature gating

### 🔗 Shared (`/shared`)
**Purpose:** Common utilities, types, and cross-module dependencies
- Database schemas and storage interfaces
- Common UI utilities and React hooks
- API request handling and query client configuration

## Module Benefits

1. **Clean Separation**: Each module has clear responsibilities and boundaries
2. **Subscription Ready**: Easy to implement feature gating by subscription tier
3. **Scalable**: Individual modules can be developed and deployed independently
4. **Maintainable**: Easier to debug and extend specific functionality
5. **Team Development**: Multiple developers can work on different modules simultaneously

## Next Steps for Public Launch

1. **Subscription Integration**: Implement Stripe payment processing in subscription module
2. **Feature Gating**: Add subscription tier checks to limit access based on user plan
3. **Module Deployment**: Each module can potentially be deployed as separate services
4. **API Gateway**: Centralized routing and authentication for all module endpoints

## Usage

Each module exports its main functionality through an `index.ts` file, making imports clean and predictable:

```typescript
// Import from specific modules
import { OpenAIService } from '@modules/ai-chat';
import { AstrologyService } from '@modules/astrology'; 
import { SpotifyService } from '@modules/music';
import { MoodTracker } from '@modules/mood-tracking';
import { useAuth } from '@modules/auth-user';
import { SUBSCRIPTION_TIERS } from '@modules/subscription';
```