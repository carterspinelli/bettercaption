import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { InstagramPost, InsertInstagramPost } from '@shared/schema';
import { storage } from './storage';

const execAsync = promisify(exec);

// ES modules don't have __dirname, so we need to construct it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMP_DIR = path.join(__dirname, '../temp_insta');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Function to fetch recent posts for a username using Instaloader
export async function fetchPostsByUsername(username: string, userId: number, limit = 10): Promise<void> {
  try {
    // Clean previous downloads
    const userDir = path.join(TEMP_DIR, username);
    if (fs.existsSync(userDir)) {
      fs.rmSync(userDir, { recursive: true, force: true });
    }

    console.log(`Fetching recent posts for Instagram user: ${username}`);

    // Use Instaloader to download recent posts
    // We're just getting metadata (--no-pictures --no-videos) as we only need captions
    const command = `instaloader --no-pictures --no-videos --no-video-thumbnails --no-captions --no-profile-pic --count ${limit} -- ${username}`;

    try {
      const { stdout, stderr } = await execAsync(command, { cwd: TEMP_DIR });

      if (stderr && !stderr.includes('Warning')) {
        console.error('Instaloader error:', stderr);
        // We'll log the error but not throw - we want to continue with whatever posts we found
        if (stderr.includes('401 Unauthorized')) {
          console.warn('Instagram rate limiting detected. Will continue with available data.');
        }
      }

      console.log('Instaloader output:', stdout);
    } catch (error) {
      // Log but continue - we may have partial data
      console.error('Instaloader command failed, but continuing with available data:', error);
    }

    // Process any downloaded files, even if the command failed
    await processDownloadedPosts(username, userId);

    console.log(`Processed posts for ${username}`);
  } catch (error) {
    console.error('Error in fetchPostsByUsername:', error);
    // We don't throw here - we want the calling function to continue
  }
}

// Process the downloaded posts
async function processDownloadedPosts(username: string, userId: number): Promise<void> {
  const userDir = path.join(TEMP_DIR, username);

  // Check if directory exists
  if (!fs.existsSync(userDir)) {
    console.log(`No data directory found for user ${username}, creating empty one`);
    fs.mkdirSync(userDir, { recursive: true });
    return; // No files to process
  }

  const files = fs.readdirSync(userDir);
  const jsonFiles = files.filter(file => file.endsWith('.json') && !file.includes('profile'));

  console.log(`Found ${jsonFiles.length} post metadata files for processing`);

  for (const file of jsonFiles) {
    try {
      const filePath = path.join(userDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      // Extract relevant data
      const post: InsertInstagramPost = {
        userId,
        instagramId: data.node.id || data.id || `${username}_${Date.now()}`,
        caption: data.node.edge_media_to_caption?.edges[0]?.node?.text || null,
        mediaUrl: data.node.display_url || null,
        permalink: `https://www.instagram.com/p/${data.node.shortcode}/` || null,
        likeCount: data.node.edge_liked_by?.count || data.node.edge_media_preview_like?.count || 0,
        commentCount: data.node.edge_media_to_comment?.count || 0,
        mediaType: data.node.__typename === 'GraphVideo' ? 'VIDEO' : 'IMAGE',
        timestamp: new Date(data.node.taken_at_timestamp * 1000)
      };

      // Save to database
      await storage.saveInstagramPost(post);

    } catch (error) {
      console.error(`Error processing Instagram post file ${file}:`, error);
      // Continue with other files even if one fails
    }
  }
}

// Enhanced Instagram style analysis
export async function analyzeUserStyle(username: string, userId: number): Promise<{
  captionStyles: string[];
  commonThemes: string[];
  recommendedHashtags: string[];
  engagementInsights: any;
  captionLengthPreference: string;
  emojiUsage: string;
  captionTone: string[];
  mentionFrequency: string;
  hashtagsPerPost: number;
}> {
  // First make sure we have the user's posts
  const posts = await storage.getInstagramPosts(userId);

  if (posts.length === 0) {
    try {
      // Try to fetch posts if none found
      await fetchPostsByUsername(username, userId);
      // Get the newly fetched posts
      const refreshedPosts = await storage.getInstagramPosts(userId);
      if (refreshedPosts.length === 0) {
        return {
          captionStyles: ['Informative', 'Conversational'], // Default styles
          commonThemes: ['Photography', 'Daily Life'],      // Default themes
          recommendedHashtags: [],
          engagementInsights: { averageLikes: 0, averageComments: 0, totalPosts: 0 },
          captionLengthPreference: 'Medium',
          emojiUsage: 'Moderate',
          captionTone: ['Friendly', 'Casual'],
          mentionFrequency: 'Low',
          hashtagsPerPost: 0
        };
      }
    } catch (error) {
      console.error('Error fetching posts for analysis:', error);
      throw new Error(`Failed to analyze Instagram style: ${(error as Error).message}`);
    }
  }

  // Caption length analysis
  const captionLengths = posts.map(post => post.caption?.length || 0);
  const avgCaptionLength = captionLengths.reduce((sum, len) => sum + len, 0) / Math.max(1, captionLengths.length);
  let captionLengthPreference = 'Medium';
  if (avgCaptionLength < 50) captionLengthPreference = 'Short';
  else if (avgCaptionLength > 150) captionLengthPreference = 'Long';

  // Emoji detection
  const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
  const totalEmojis = posts.reduce((count, post) => {
    if (!post.caption) return count;
    const matches = post.caption.match(emojiRegex);
    return count + (matches?.length || 0);
  }, 0);
  const emojiPerPost = totalEmojis / Math.max(1, posts.length);
  let emojiUsage = 'Moderate';
  if (emojiPerPost < 1) emojiUsage = 'Low';
  else if (emojiPerPost > 3) emojiUsage = 'High';

  // Engagement analysis
  const totalLikes = posts.reduce((sum, post) => sum + (post.likeCount || 0), 0);
  const totalComments = posts.reduce((sum, post) => sum + (post.commentCount || 0), 0);
  const averageLikes = posts.length > 0 ? totalLikes / posts.length : 0;
  const averageComments = posts.length > 0 ? totalComments / posts.length : 0;

  // Hashtag analysis
  const hashtagCounts: Record<string, number> = {};
  const allHashtags: string[] = [];
  posts.forEach(post => {
    if (!post.caption) return;

    const matches = post.caption.match(/#[a-zA-Z0-9_]+/g);
    if (matches) {
      matches.forEach(hashtag => {
        hashtagCounts[hashtag] = (hashtagCounts[hashtag] || 0) + 1;
        allHashtags.push(hashtag);
      });
    }
  });

  // Sort hashtags by frequency
  const sortedHashtags = Object.entries(hashtagCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);

  // Calculate hashtags per post
  const hashtagsPerPost = allHashtags.length / Math.max(1, posts.length);

  // Mention frequency analysis
  const mentionRegex = /@[a-zA-Z0-9._]+/g;
  const totalMentions = posts.reduce((count, post) => {
    if (!post.caption) return count;
    const matches = post.caption.match(mentionRegex);
    return count + (matches?.length || 0);
  }, 0);
  const mentionsPerPost = totalMentions / Math.max(1, posts.length);
  let mentionFrequency = 'Moderate';
  if (mentionsPerPost < 0.5) mentionFrequency = 'Low';
  else if (mentionsPerPost > 2) mentionFrequency = 'High';

  // Theme detection (simplified approach)
  // In a real app, we would use NLP for more detailed analysis
  const themeKeywords = {
    'Travel': ['travel', 'adventure', 'explore', 'wanderlust', 'destination', 'trip'],
    'Fashion': ['fashion', 'style', 'outfit', 'clothes', 'wear', 'dress'],
    'Food': ['food', 'recipe', 'delicious', 'eat', 'restaurant', 'tasty', 'cooking'],
    'Fitness': ['fitness', 'workout', 'gym', 'exercise', 'training', 'health'],
    'Business': ['business', 'entrepreneur', 'success', 'goals', 'productivity'],
    'Art': ['art', 'creative', 'design', 'artist', 'drawing', 'photography'],
    'Tech': ['technology', 'tech', 'digital', 'innovation', 'software', 'app'],
    'Nature': ['nature', 'outdoors', 'wildlife', 'trees', 'hiking', 'mountain'],
    'Lifestyle': ['lifestyle', 'life', 'balance', 'mindfulness', 'inspiration'],
    'Beauty': ['beauty', 'makeup', 'skincare', 'hair', 'cosmetics']
  };

  const themeScores: Record<string, number> = {};
  posts.forEach(post => {
    if (!post.caption) return;
    const caption = post.caption.toLowerCase();

    Object.entries(themeKeywords).forEach(([theme, keywords]) => {
      keywords.forEach(keyword => {
        if (caption.includes(keyword)) {
          themeScores[theme] = (themeScores[theme] || 0) + 1;
        }
      });
    });
  });

  // Sort themes by score
  const detectedThemes = Object.entries(themeScores)
    .sort((a, b) => b[1] - a[1])
    .map(([theme]) => theme);

  // Default if no themes detected
  const commonThemes = detectedThemes.length > 0 
    ? detectedThemes.slice(0, 3) 
    : ['Photography', 'Daily Life', 'Personal'];

  // Caption tone analysis (simplified)
  // In a real app, we would use sentiment analysis
  const toneKeywords = {
    'Professional': ['professional', 'expert', 'analysis', 'insight', 'research'],
    'Formal': ['formally', 'announce', 'officially', 'statement'],
    'Casual': ['just', 'like', 'so', 'fun', 'cool', 'awesome', 'love'],
    'Humorous': ['lol', 'haha', 'funny', 'laugh', 'joke', '😂', '🤣'],
    'Inspirational': ['inspire', 'motivation', 'success', 'dream', 'achieve'],
    'Educational': ['learn', 'teach', 'tip', 'advice', 'how to', 'guide'],
    'Friendly': ['friend', 'together', 'we', 'us', 'everyone', 'community'],
    'Promotional': ['offer', 'deal', 'discount', 'promo', 'sale', 'limited'],
  };

  const toneScores: Record<string, number> = {};
  posts.forEach(post => {
    if (!post.caption) return;
    const caption = post.caption.toLowerCase();

    Object.entries(toneKeywords).forEach(([tone, keywords]) => {
      keywords.forEach(keyword => {
        if (caption.includes(keyword)) {
          toneScores[tone] = (toneScores[tone] || 0) + 1;
        }
      });
    });
  });

  // Sort tones by score
  const detectedTones = Object.entries(toneScores)
    .sort((a, b) => b[1] - a[1])
    .map(([tone]) => tone);

  // Default if no tones detected
  const captionTone = detectedTones.length > 0 
    ? detectedTones.slice(0, 3) 
    : ['Friendly', 'Casual', 'Personal'];

  // Determine caption styles based on analysis
  const captionStyles = [];

  if (captionLengthPreference === 'Long') {
    captionStyles.push('Detailed');
  } else if (captionLengthPreference === 'Short') {
    captionStyles.push('Concise');
  }

  if (emojiUsage === 'High') {
    captionStyles.push('Emoji-rich');
  }

  if (captionTone.includes('Humorous')) {
    captionStyles.push('Humorous');
  }

  if (captionTone.includes('Inspirational')) {
    captionStyles.push('Inspirational');
  }

  if (captionTone.includes('Educational')) {
    captionStyles.push('Informative');
  }

  if (hashtagsPerPost > 5) {
    captionStyles.push('Hashtag-heavy');
  }

  if (mentionFrequency === 'High') {
    captionStyles.push('Community-focused');
  }

  // Ensure we have at least 2 styles
  if (captionStyles.length < 2) {
    captionStyles.push('Conversational', 'Personal');
  }

  // Limit to top 4 styles
  const finalCaptionStyles = captionStyles.slice(0, 4);

  return {
    captionStyles: finalCaptionStyles,
    commonThemes,
    recommendedHashtags: sortedHashtags.slice(0, 10),
    engagementInsights: {
      averageLikes,
      averageComments,
      totalPosts: posts.length
    },
    captionLengthPreference,
    emojiUsage,
    captionTone,
    mentionFrequency,
    hashtagsPerPost
  };
}