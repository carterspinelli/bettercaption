import OpenAI from "openai";
import sharp from "sharp";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeImage(imageBuffer: Buffer): Promise<{
  description: string;
  suggestedCaption: string;
}> {
  // Convert image to base64
  const base64Image = imageBuffer.toString('base64');

  const visionResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a professional Instagram content creator. Analyze the image and provide a detailed description and a creative, engaging caption that would work well on Instagram. Return the response as JSON with 'description' and 'suggestedCaption' fields."
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

  return JSON.parse(visionResponse.choices[0].message.content);
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
