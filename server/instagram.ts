import axios from "axios";
import { User, InsertInstagramPost } from "@shared/schema";
import { storage } from "./storage";

// Interface for Instagram API responses
interface IGMediaResponse {
  data: Array<{
    id: string;
    caption?: string;
    media_url: string;
    permalink: string;
    like_count?: number;
    comments_count?: number;
    media_type: string;
    timestamp: string;
  }>;
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
  };
}

// Fetch user profile information from Instagram
export async function fetchInstagramUserProfile(accessToken: string): Promise<{
  id: string;
  username: string;
}> {
  try {
    const response = await axios.get(
      'https://graph.instagram.com/me',
      {
        params: {
          fields: 'id,username',
          access_token: accessToken
        }
      }
    );
    
    return {
      id: response.data.id,
      username: response.data.username
    };
  } catch (error) {
    console.error('Error fetching Instagram user profile:', error);
    throw new Error('Failed to fetch Instagram user profile');
  }
}

// Fetch recent media from Instagram
export async function fetchInstagramMedia(accessToken: string, limit = 25): Promise<IGMediaResponse> {
  try {
    const response = await axios.get(
      'https://graph.instagram.com/me/media',
      {
        params: {
          fields: 'id,caption,media_url,permalink,thumbnail_url,timestamp,media_type,like_count,comments_count',
          access_token: accessToken,
          limit
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching Instagram media:', error);
    throw new Error('Failed to fetch Instagram media');
  }
}

// Save Instagram posts to database
export async function saveInstagramPosts(user: User, mediaItems: IGMediaResponse): Promise<void> {
  try {
    if (!mediaItems.data || !Array.isArray(mediaItems.data)) {
      console.warn('No media items to save');
      return;
    }
    
    for (const item of mediaItems.data) {
      // Check if post already exists to avoid duplicates
      const existingPost = await storage.getInstagramPostById(item.id);
      if (existingPost) {
        console.log(`Instagram post ${item.id} already exists, skipping`);
        continue;
      }
      
      const post: InsertInstagramPost = {
        userId: user.id,
        instagramId: item.id,
        caption: item.caption || null,
        mediaUrl: item.media_url,
        permalink: item.permalink,
        likeCount: item.like_count || 0,
        commentCount: item.comments_count || 0,
        mediaType: item.media_type,
        timestamp: new Date(item.timestamp)
      };
      
      await storage.saveInstagramPost(post);
    }
    
    console.log(`Saved ${mediaItems.data.length} Instagram posts for user ${user.id}`);
  } catch (error) {
    console.error('Error saving Instagram posts:', error);
    throw new Error('Failed to save Instagram posts');
  }
}

// Analyze Instagram posts to determine user's style and preferences
export async function analyzeInstagramStyle(userId: number): Promise<{
  captionStyles: string[];
  commonThemes: string[];
  recommendedHashtags: string[];
  engagementInsights: any;
}> {
  try {
    // Get all Instagram posts for this user
    const posts = await storage.getInstagramPosts(userId);
    
    if (posts.length === 0) {
      return {
        captionStyles: [],
        commonThemes: [],
        recommendedHashtags: [],
        engagementInsights: { averageLikes: 0, averageComments: 0 }
      };
    }
    
    // For a real implementation, we would use OpenAI to analyze the captions
    // For now, we'll return a simpler analysis
    
    // Calculate average engagement
    const totalLikes = posts.reduce((sum, post) => sum + (post.likeCount || 0), 0);
    const totalComments = posts.reduce((sum, post) => sum + (post.commentCount || 0), 0);
    const averageLikes = posts.length > 0 ? totalLikes / posts.length : 0;
    const averageComments = posts.length > 0 ? totalComments / posts.length : 0;
    
    // Extract hashtags from captions
    const hashtags = new Set<string>();
    posts.forEach(post => {
      if (!post.caption) return;
      
      const matches = post.caption.match(/#[a-zA-Z0-9_]+/g);
      if (matches) {
        matches.forEach(hashtag => hashtags.add(hashtag));
      }
    });
    
    return {
      captionStyles: ['Informative', 'Conversational'],
      commonThemes: ['Photography', 'Daily Life'],
      recommendedHashtags: Array.from(hashtags).slice(0, 10),
      engagementInsights: {
        averageLikes,
        averageComments,
        totalPosts: posts.length
      }
    };
  } catch (error) {
    console.error('Error analyzing Instagram style:', error);
    throw new Error('Failed to analyze Instagram style');
  }
}

// Enhance AI caption generation with Instagram style insights
export function enhanceCaptionPrompt(basePrompt: string, userId: number, instagramAnalysis: any): string {
  if (!instagramAnalysis || !instagramAnalysis.captionStyles || instagramAnalysis.captionStyles.length === 0) {
    return basePrompt;
  }
  
  // Extend the base prompt with Instagram style information
  return `${basePrompt}

Additionally, consider matching this user's Instagram style:
- Caption Style: ${instagramAnalysis.captionStyles.join(', ')}
- Common Themes: ${instagramAnalysis.commonThemes.join(', ')}
- Popular Hashtags: ${instagramAnalysis.recommendedHashtags.join(' ')}
- The user typically gets around ${Math.round(instagramAnalysis.engagementInsights.averageLikes)} likes and ${Math.round(instagramAnalysis.engagementInsights.averageComments)} comments per post.

Create a caption that maintains their authentic voice while optimizing for engagement.`;
}
