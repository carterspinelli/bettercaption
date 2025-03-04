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

    const { stdout, stderr } = await execAsync(command, { cwd: TEMP_DIR });

    if (stderr && !stderr.includes('Warning')) {
      console.error('Instaloader error:', stderr);
      throw new Error(`Failed to fetch Instagram posts: ${stderr}`);
    }

    console.log('Instaloader output:', stdout);

    // Process the downloaded files
    await processDownloadedPosts(username, userId);

    console.log(`Successfully fetched and processed posts for ${username}`);
  } catch (error) {
    console.error('Error fetching Instagram posts with Instaloader:', error);
    throw new Error(`Failed to fetch Instagram posts for ${username}: ${(error as Error).message}`);
  }
}

// Process the downloaded posts
async function processDownloadedPosts(username: string, userId: number): Promise<void> {
  const userDir = path.join(TEMP_DIR, username);

  // Check if directory exists
  if (!fs.existsSync(userDir)) {
    throw new Error(`No data found for user ${username}`);
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

// Analyze the posts to extract user style
export async function analyzeUserStyle(username: string, userId: number): Promise<{
  captionStyles: string[];
  commonThemes: string[];
  recommendedHashtags: string[];
  engagementInsights: any;
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
          engagementInsights: { averageLikes: 0, averageComments: 0, totalPosts: 0 }
        };
      }
    } catch (error) {
      console.error('Error fetching posts for analysis:', error);
      throw new Error(`Failed to analyze Instagram style: ${(error as Error).message}`);
    }
  }

  // For simplicity, reuse existing analysis function
  // The same logic as in instagram.ts
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
}