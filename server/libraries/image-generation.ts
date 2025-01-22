
import OpenAI from 'openai';
import { env } from 'process';
import { v4 as uuidv4 } from 'uuid';
import { Client } from '@replit/object-storage';

if (!env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

const storage = new Client();

export async function generateRecipeImage(title: string, description: string, userId: number): Promise<string> {
  try {
    const prompt = `A professional, appetizing food photography style image of ${title}. ${description}. Top-down view, natural lighting, on a clean white surface with minimal props. High-quality food photography style.`;
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "b64_json",
    });

    const imageData = response.data[0].b64_json;
    const buffer = Buffer.from(imageData!, 'base64');
    
    const uuid = uuidv4();
    const objectKey = `recipes/${userId}/${uuid}.png`;
    
    await storage.uploadObject({
      key: objectKey,
      data: buffer,
      contentType: 'image/png'
    });

    const imageUrl = await storage.getSignedDownloadURL({ key: objectKey, expiresIn: 31536000 }); // 1 year expiry
    return imageUrl;
  } catch (error) {
    console.error('Error generating image:', error);
    throw new Error('Failed to generate recipe image');
  }
}
