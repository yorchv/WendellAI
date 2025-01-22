
import OpenAI from 'openai';
import { env } from 'process';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';

if (!env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}
if (!env.SUPABASE_URL || !env.SUPABASE_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_KEY environment variables are required');
}

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

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
    
    const { data, error } = await supabase.storage
      .from('recipes')
      .upload(`${userId}/${uuid}.png`, buffer, {
        contentType: 'image/png',
        cacheControl: '31536000'
      });
      
    if (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('recipes')
      .getPublicUrl(`${userId}/${uuid}.png`);
      
    return publicUrl;
  } catch (error) {
    console.error('Error generating image:', error);
    throw new Error('Failed to generate recipe image');
  }
}
