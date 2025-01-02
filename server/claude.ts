import Anthropic from '@anthropic-ai/sdk';
import { z } from "zod";
import { recipePreviewSchema } from "./perplexity";
import { log } from "./vite";

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("Missing ANTHROPIC_API_KEY environment variable");
}

// the newest Anthropic model is "claude-3-5-sonnet-20241022" which was released October 22, 2024
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function formatRecipeResponse(text: string) {
  try {
    // Include the schema instructions in the user message instead of system message
    const systemInstructions = "You are a helpful assistant that converts recipe text into properly formatted JSON. Extract recipe details and return a JSON object with the following structure: { title: string, description: string, ingredients: string[], instructions: string[], prepTime: number, cookTime: number, servings: number }";

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `${systemInstructions}\n\nPlease convert this recipe text into JSON format:\n\n${text}`
        }
      ],
    });

    // Access the content safely
    const formattedJson = response.content[0].type === 'text' ? response.content[0].text : '';
    log("Claude formatted response:", formattedJson);

    // Parse and validate the formatted JSON
    const parsed = JSON.parse(formattedJson);
    const result = recipePreviewSchema.safeParse(parsed);

    if (!result.success) {
      throw new Error("Invalid recipe format after Claude processing");
    }

    return result.data;
  } catch (error) {
    log("Error formatting recipe with Claude:", error instanceof Error ? error.message : 'Unknown error');
    throw new Error("Failed to format recipe data");
  }
}

export async function analyzeRecipeImage(base64Image: string) {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: "text",
              text: "Please analyze this recipe image and extract the recipe details. Format the response as JSON with the following structure: { title: string, description: string, ingredients: string[], instructions: string[], prepTime: number, cookTime: number, servings: number }"
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }
      ],
    });

    // Access the content safely
    const formattedJson = response.content[0].type === 'text' ? response.content[0].text : '';
    log("Claude image analysis response:", formattedJson);

    // Parse and validate the formatted JSON
    const parsed = JSON.parse(formattedJson);
    const result = recipePreviewSchema.safeParse(parsed);

    if (!result.success) {
      throw new Error("Invalid recipe format after image analysis");
    }

    return result.data;
  } catch (error) {
    log("Error analyzing recipe image:", error instanceof Error ? error.message : 'Unknown error');
    throw new Error("Failed to analyze recipe image");
  }
}