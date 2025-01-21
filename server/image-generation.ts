import OpenAI from 'openai';
import { env } from 'process';

if (!env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export async function generateRecipeImage(title: string, description: string): Promise<string> {
  try {
    const prompt = `A professional, appetizing food photography style image of ${title}. ${description}. Top-down view, natural lighting, on a clean white surface with minimal props. High-quality food photography style.`;
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "url",
    });

    return response.data[0].url;
  } catch (error) {
    console.error('Error generating image:', error);
    throw new Error('Failed to generate recipe image');
  }
}
