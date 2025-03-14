import OpenAI from "openai";
import sharp from "sharp";
import { analyzeInstagramStyle, enhanceCaptionPrompt } from "./instagram";
import { analyzeUserStyle } from "./instaloader_service";
import { storage } from "./storage";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeImage(imageBuffer: Buffer, userId?: number): Promise<{
  description: string;
  suggestedCaption: string;
}> {
  // Convert image to base64
  const base64Image = imageBuffer.toString('base64');

  // Create base system message
  let systemMessage = "You are a professional Instagram content creator with expertise in art, architecture, history, and brand recognition. Analyze the image with particular attention to landmarks, historic places, artwork, and company logos. If any of these elements are present, incorporate them naturally into your caption to add context and value. For landmarks and historic places, include their significance. For artwork, reference the style or artist if recognizable. For logos, mention the brand if it adds value to the caption. Return the response as JSON with 'description' and 'suggestedCaption' fields.";

  // If user is connected to Instagram, enhance the prompt with their style
  if (userId) {
    try {
      const user = await storage.getUser(userId);
      if (user && user.instagramConnected) {
        // Use Instaloader-based analysis if the user is connected via username
        if (!user.instagramToken && user.instagramUsername) {
          const instagramAnalysis = await analyzeUserStyle(user.instagramUsername, userId);

          // Check if this is a manual style profile or an automatically analyzed one
          const manualStyle = await storage.getManualStyleProfile(userId);

          // Enhanced prompt with detailed style information
          let styleDetails = `
          Based on the user's Instagram profile analysis:
          - Caption Style: ${instagramAnalysis.captionStyles.join(', ')}
          - Common Themes: ${instagramAnalysis.commonThemes.join(', ')}
          - Preferred Caption Length: ${instagramAnalysis.captionLengthPreference}
          - Emoji Usage: ${instagramAnalysis.emojiUsage}
          - Caption Tone: ${instagramAnalysis.captionTone.join(', ')}
          `;

          // Special handling for hashtags based on user preference
          if (manualStyle && manualStyle.isManual) {
            // If manual style exists, check hashtag preference
            const hashtagsInstruction = manualStyle.hashtagsPerPost > 0 
              ? `Include ${Math.min(5, manualStyle.hashtagsPerPost)} relevant hashtags at the end of the caption.`
              : `DO NOT include any hashtags in the caption as the user has explicitly chosen not to use hashtags.`;

            styleDetails += `
            IMPORTANT HASHTAG INSTRUCTION: ${hashtagsInstruction}
            `;
          } else {
            // Default behavior for auto-analyzed profiles
            styleDetails += `
            - Hashtags Per Post: ${instagramAnalysis.hashtagsPerPost.toFixed(1)}
            If they use hashtags heavily (more than 3 per post), include 3-5 relevant hashtags at the end of the caption.
            `;
          }

          styleDetails += `
          Generate a caption that reflects this personal style. If they use many emojis, include emojis. Match their typical caption length and tone. Incorporate themes they commonly post about if relevant to the image.
          `;

          systemMessage = systemMessage + styleDetails;
        } else {
          // Use original OAuth-based analysis if the user has a token
          const instagramAnalysis = await analyzeInstagramStyle(userId);
          systemMessage = enhanceCaptionPrompt(systemMessage, userId, instagramAnalysis);
        }
      }
    } catch (error) {
      console.error('Error getting Instagram style for caption enhancement:', error);
      // Continue with the basic prompt if there's an error
    }
  }

  const visionResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: systemMessage
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze this image and suggest a caption for Instagram"
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`
            }
          }
        ],
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = visionResponse.choices[0].message.content || '{"description":"Error processing image","suggestedCaption":"Error generating caption"}';
  return JSON.parse(content);
}

export async function enhanceImage(imageBuffer: Buffer): Promise<Buffer> {
  // Use Sharp to enhance the image
  const enhanced = await sharp(imageBuffer)
    .modulate({
      brightness: 1.1,
      saturation: 1.2,
    })
    .sharpen()
    .toBuffer();

  return enhanced;
}