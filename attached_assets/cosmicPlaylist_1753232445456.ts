import OpenAI from "openai";
import type { User } from "@shared/schema";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required");
}

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export interface TrackRecommendation {
  artist: string;
  title: string;
  genre: string;
  astrologyReasoning: string;
  mood: string;
  energy: "high" | "medium" | "low";
}

export interface PlaylistData {
  title: string;
  description: string;
  mood: string;
  genres: string[];
  tracks: TrackRecommendation[];
  astrologyContext: string;
  planetaryInfluence: string;
}

export async function generateCosmicPlaylist(user: User): Promise<PlaylistData> {
  const today = new Date();
  const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
  const currentMonth = today.toLocaleDateString('en-US', { month: 'long' });
  
  // Create astrological context
  const userSigns = {
    sun: user.sunSign || 'Aries',
    moon: user.moonSign || 'Cancer', 
    rising: user.risingSign || 'Leo'
  };

  const prompt = `You are a cosmic music curator with deep knowledge of both astrology and music. Create a personalized playlist for someone with these astrological placements:

Sun Sign: ${userSigns.sun}
Moon Sign: ${userSigns.moon}
Rising Sign: ${userSigns.rising}

Today is ${dayOfWeek} in ${currentMonth}.

Based on their astrological profile and current planetary energies, recommend 8-10 songs that match their cosmic mood today. Consider:

1. Their Sun sign's core energy and preferred musical expression
2. Their Moon sign's emotional needs in music
3. Their Rising sign's outward musical preferences
4. Current astrological transits and planetary influences for ${dayOfWeek}

For each song recommendation, provide:
- Artist name
- Song title
- Genre
- Brief astrological reasoning (2-3 sentences max)
- Mood descriptor (energetic, calming, romantic, introspective, etc.)
- Energy level (high/medium/low)

Also provide:
- Overall playlist title (creative and astrologically themed)
- Playlist description (2-3 sentences)
- Primary mood theme
- 3-4 recommended genres
- Overall astrological context explaining the playlist's cosmic significance
- Primary planetary influence driving today's recommendations

Respond in JSON format with this structure:
{
  "title": "playlist title",
  "description": "playlist description", 
  "mood": "primary mood",
  "genres": ["genre1", "genre2", "genre3"],
  "tracks": [
    {
      "artist": "artist name",
      "title": "song title",
      "genre": "genre",
      "astrologyReasoning": "why this song fits their chart",
      "mood": "song mood",
      "energy": "high/medium/low"
    }
  ],
  "astrologyContext": "overall astrological explanation",
  "planetaryInfluence": "primary planet/influence"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert astrologer and music curator who creates personalized playlists based on astrological charts and current cosmic energies. Respond only with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result as PlaylistData;
  } catch (error) {
    console.error("Error generating cosmic playlist:", error);
    
    // Fallback playlist based on sun sign
    return createFallbackPlaylist(userSigns.sun, dayOfWeek);
  }
}

function createFallbackPlaylist(sunSign: string, dayOfWeek: string): PlaylistData {
  const signPlaylists: Record<string, Partial<PlaylistData>> = {
    'Aries': {
      mood: 'energetic',
      genres: ['Rock', 'Electronic', 'Pop'],
      planetaryInfluence: 'Mars - Warrior Energy'
    },
    'Taurus': {
      mood: 'grounding',
      genres: ['Folk', 'Soul', 'Blues'],
      planetaryInfluence: 'Venus - Sensual Harmony'
    },
    'Gemini': {
      mood: 'curious',
      genres: ['Indie Pop', 'Alternative', 'Jazz'],
      planetaryInfluence: 'Mercury - Mental Agility'
    },
    'Cancer': {
      mood: 'nostalgic',
      genres: ['Ambient', 'Singer-Songwriter', 'Classical'],
      planetaryInfluence: 'Moon - Emotional Depths'
    },
    'Leo': {
      mood: 'confident',
      genres: ['Pop', 'R&B', 'Dance'],
      planetaryInfluence: 'Sun - Creative Expression'
    },
    'Virgo': {
      mood: 'focused',
      genres: ['Instrumental', 'Classical', 'Lo-Fi'],
      planetaryInfluence: 'Mercury - Analytical Precision'
    },
    'Libra': {
      mood: 'harmonious',
      genres: ['Jazz', 'Bossa Nova', 'Classical'],
      planetaryInfluence: 'Venus - Aesthetic Beauty'
    },
    'Scorpio': {
      mood: 'intense',
      genres: ['Alternative Rock', 'Dark Electronic', 'Blues'],
      planetaryInfluence: 'Pluto - Transformative Power'
    },
    'Sagittarius': {
      mood: 'adventurous',
      genres: ['World Music', 'Rock', 'Folk'],
      planetaryInfluence: 'Jupiter - Expansive Spirit'
    },
    'Capricorn': {
      mood: 'determined',
      genres: ['Classical', 'Ambient', 'Instrumental'],
      planetaryInfluence: 'Saturn - Structured Ambition'
    },
    'Aquarius': {
      mood: 'innovative',
      genres: ['Electronic', 'Experimental', 'Indie'],
      planetaryInfluence: 'Uranus - Revolutionary Change'
    },
    'Pisces': {
      mood: 'dreamy',
      genres: ['Ambient', 'Dream Pop', 'Neo-Soul'],
      planetaryInfluence: 'Neptune - Mystical Inspiration'
    }
  };

  const signData = signPlaylists[sunSign] || signPlaylists['Aries'];

  return {
    title: `${sunSign} ${dayOfWeek} Cosmic Mix`,
    description: `A personalized playlist crafted for your ${sunSign} energy this ${dayOfWeek}`,
    mood: signData.mood || 'balanced',
    genres: signData.genres || ['Pop', 'Alternative'],
    tracks: [
      {
        artist: "Cosmic Playlist",
        title: "Generated Recommendation",
        genre: signData.genres?.[0] || 'Pop',
        astrologyReasoning: `This cosmic playlist is tailored for ${sunSign} energy`,
        mood: signData.mood || 'balanced',
        energy: 'medium'
      }
    ],
    astrologyContext: `This playlist is designed to align with ${sunSign} energy and current cosmic influences for ${dayOfWeek}`,
    planetaryInfluence: signData.planetaryInfluence || 'Mixed Planetary Influences'
  };
}