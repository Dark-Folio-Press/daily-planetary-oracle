import { nanoid } from 'nanoid';
import { type SharedContent, type InsertSharedContent, type SocialInteraction, type InsertSocialInteraction } from '@shared/schema';

export interface ShareablePlaylist {
  id: string;
  name: string;
  description: string;
  songs: any[];
  weekStart: string;
  weekEnd: string;
  sunSign?: string;
  astrologicalSummary?: string;
}

export interface ShareableConversation {
  sessionId: string;
  title: string;
  messages: Array<{
    role: string;
    content: string;
    timestamp: Date;
  }>;
  playlistData?: ShareablePlaylist;
}

export class SocialService {
  /**
   * Generate a shareable link for a playlist
   */
  generatePlaylistShare(playlist: ShareablePlaylist, userId: string): InsertSharedContent {
    const shareId = nanoid(12); // Generate short, URL-friendly ID
    
    // Create curated metadata for sharing
    const shareableMetadata = {
      type: 'playlist',
      playlist: {
        name: playlist.name,
        description: playlist.description,
        weekStart: playlist.weekStart,
        weekEnd: playlist.weekEnd,
        songCount: playlist.songs.length,
        sunSign: playlist.sunSign,
        astrologicalSummary: playlist.astrologicalSummary,
        preview: playlist.songs.slice(0, 3).map(song => ({
          title: song.title,
          artist: song.artist,
          dayOfWeek: song.dayOfWeek,
          astrologicalInfluence: song.astrologicalInfluence
        }))
      }
    };

    return {
      shareId,
      userId,
      contentType: 'playlist',
      contentId: playlist.id,
      title: `🌟 ${playlist.name}`,
      description: `A cosmic playlist curated for ${playlist.sunSign} energy from ${playlist.weekStart} to ${playlist.weekEnd}. ${playlist.songs.length} songs aligned with planetary transits.`,
      isPublic: true,
      allowComments: false,
      metadata: shareableMetadata,
      expiresAt: null // Permanent share
    };
  }

  /**
   * Generate a shareable link for a conversation
   */
  generateConversationShare(conversation: ShareableConversation, userId: string): InsertSharedContent {
    const shareId = nanoid(12);
    
    // Create conversation highlights with full content for sharing
    const highlights = conversation.messages
      .filter(msg => msg.role === 'assistant' && msg.content.length > 50)
      .map(msg => ({
        content: msg.content.substring(0, 200) + (msg.content.length > 200 ? '...' : ''), // Preview for social media
        fullContent: msg.content, // Full content for the shared page
        timestamp: msg.timestamp
      }));

    const shareableMetadata = {
      type: 'conversation',
      conversation: {
        title: conversation.title,
        messageCount: conversation.messages.length,
        highlights,
        hasPlaylist: !!conversation.playlistData,
        playlistPreview: conversation.playlistData ? {
          name: conversation.playlistData.name,
          songCount: conversation.playlistData.songs.length,
          weekStart: conversation.playlistData.weekStart
        } : null
      }
    };

    return {
      shareId,
      userId,
      contentType: 'conversation',
      contentId: conversation.sessionId,
      title: `✨ ${conversation.title}`,
      description: `An astrological conversation with ${conversation.messages.length} messages${conversation.playlistData ? ` and a personalized cosmic playlist` : ''}.`,
      isPublic: true,
      allowComments: true,
      metadata: shareableMetadata,
      expiresAt: null
    };
  }

  /**
   * Generate social media sharing text
   */
  generateSocialText(sharedContent: SharedContent): {
    twitter: string;
    facebook: string;
    general: string;
  } {
    const baseUrl = process.env.REPLIT_DOMAINS ? 
      `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 
      'https://your-app.replit.app';
    
    const shareUrl = `${baseUrl}/share/${sharedContent.shareId}`;
    
    if (sharedContent.contentType === 'playlist') {
      const metadata = sharedContent.metadata as any;
      const playlist = metadata?.playlist;
      
      return {
        twitter: `🌟 Check out my cosmic playlist "${playlist?.name}" curated by AI based on astrological transits! ${playlist?.songCount} songs aligned with ${playlist?.sunSign} energy. ${shareUrl} #CosmicMusic #Astrology`,
        facebook: `I just discovered this amazing cosmic playlist generator that creates personalized music based on astrological transits! My playlist "${playlist?.name}" has ${playlist?.songCount} songs perfectly aligned with my ${playlist?.sunSign} energy. Check it out!`,
        general: `🎵 Discover "${playlist?.name}" - a cosmic playlist with ${playlist?.songCount} songs curated by AI based on astrological transits for ${playlist?.sunSign} energy. ${shareUrl}`
      };
    } else {
      const metadata = sharedContent.metadata as any;
      const conversation = metadata?.conversation;
      
      return {
        twitter: `✨ Had an fascinating astrological conversation that generated${conversation?.hasPlaylist ? ' a personalized cosmic playlist and' : ''} amazing insights! ${shareUrl} #Astrology #CosmicChat`,
        facebook: `I just had the most insightful astrological conversation with AI that${conversation?.hasPlaylist ? ' created a personalized cosmic playlist and' : ''} provided deep cosmic wisdom. The future of astrology is here!`,
        general: `✨ Explore this cosmic conversation with ${conversation?.messageCount} astrological insights${conversation?.hasPlaylist ? ' and a personalized playlist' : ''}. ${shareUrl}`
      };
    }
  }

  /**
   * Create social interaction (like, comment, save)
   */
  createInteraction(shareId: string, userId: string | null, type: 'like' | 'comment' | 'save', content?: string): InsertSocialInteraction {
    return {
      shareId,
      userId: userId || null,
      interactionType: type,
      content: content || null,
      metadata: {
        timestamp: new Date().toISOString(),
        userAgent: 'web-app'
      }
    };
  }

  /**
   * Generate Open Graph meta tags for shared content
   */
  generateOpenGraphTags(sharedContent: SharedContent): Record<string, string> {
    const baseUrl = process.env.REPLIT_DOMAINS ? 
      `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 
      'https://your-app.replit.app';
    
    const shareUrl = `${baseUrl}/share/${sharedContent.shareId}`;
    
    const baseTags = {
      'og:url': shareUrl,
      'og:type': 'website',
      'og:site_name': 'Cosmic Playlist Generator',
      'twitter:card': 'summary_large_image',
      'twitter:site': '@CosmicMusicApp'
    };

    if (sharedContent.contentType === 'playlist') {
      const metadata = sharedContent.metadata as any;
      const playlist = metadata?.playlist;
      
      return {
        ...baseTags,
        'og:title': sharedContent.title,
        'og:description': sharedContent.description || 'Check out this content',
        'og:image': `${baseUrl}/api/share/${sharedContent.shareId}/image`, // Dynamic playlist image
        'twitter:title': sharedContent.title || 'Cosmic Playlist',
        'twitter:description': sharedContent.description || 'AI-curated cosmic music',
        'twitter:image': `${baseUrl}/api/share/${sharedContent.shareId}/image`
      };
    } else {
      return {
        ...baseTags,
        'og:title': sharedContent.title,
        'og:description': sharedContent.description || 'Check out this content',
        'og:image': `${baseUrl}/api/share/${sharedContent.shareId}/conversation-image`,
        'twitter:title': sharedContent.title || 'Cosmic Conversation',
        'twitter:description': sharedContent.description || 'Astrological insights with AI',
        'twitter:image': `${baseUrl}/api/share/${sharedContent.shareId}/conversation-image`
      };
    }
  }
}

export const socialService = new SocialService();