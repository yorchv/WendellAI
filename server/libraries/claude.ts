
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { recipePreviewSchema } from "./perplexity";
import { log } from "../vite";

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("Missing ANTHROPIC_API_KEY environment variable");
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function formatRecipeResponse(text: string) {
  try {
    const systemInstructions = 
      "You are a JSON formatting assistant. Your responses must contain ONLY valid JSON, with no additional text or explanation. Format the recipe into this structure, ensuring all fields are present: { title: string, description: string, ingredients: [{ name: string, quantity: number | null, unit: string | null, notes: string | null }], instructions: string[], prepTime: number | null, cookTime: number | null, servings: number | null }";

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `${systemInstructions}\n\nPlease convert this recipe text into JSON format:\n\n${text}`,
        },
      ],
    });

    const formattedJson =
      response.content[0].type === "text" ? response.content[0].text : "";
    log("Claude formatted response:", formattedJson);

    const parsed = JSON.parse(formattedJson);
    const recipeData = Array.isArray(parsed) ? parsed[0] : parsed;
    const result = recipePreviewSchema.safeParse(recipeData);

    if (!result.success) {
      const errorMessage = result.error.errors
        .map((err) => err.message)
        .join(", ");
      throw new Error(`Invalid recipe format: ${errorMessage}`);
    }

    return result.data;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    log("Error formatting recipe with Claude:", errorMessage);

    if (error instanceof Anthropic.APIError) {
      throw new Error(
        `Claude API error: ${error.message} (Status: ${error.status})`,
      );
    } else if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON response from Claude: ${errorMessage}`);
    }

    throw new Error(`Recipe formatting failed: ${errorMessage}`);
  }
}

export async function analyzeRecipeImage(base64Image: string, mediaType: string) {
  try {
    const formattedBase64 = base64Image.includes("base64,")
      ? base64Image.split("base64,")[1]
      : base64Image;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this recipe image and return only a JSON object with this exact structure: { title: string, description: string, ingredients: [{ name: string, quantity: number | null, unit: string | null, notes: string | null }], instructions: string[], prepTime: number | null, cookTime: number | null, servings: number | null, sources: string[] | null }",
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: formattedBase64,
              },
            },
          ],
        },
      ],
    });

    const formattedJson =
      response.content[0].type === "text" ? response.content[0].text : "";
    log("Claude image analysis response:", formattedJson);

    const parsed = JSON.parse(formattedJson);
    const rawData = Array.isArray(parsed) ? parsed[0] : parsed;
    
    const recipeData = {
      ...rawData,
      ingredients: Array.isArray(rawData.ingredients) 
        ? rawData.ingredients.map(ing => 
            typeof ing === 'string' 
              ? { name: ing, quantity: null, unit: null, notes: null }
              : ing
          )
        : [],
      prepTime: rawData.prepTime || null,
      cookTime: rawData.cookTime || null,
      servings: rawData.servings || null,
      sources: rawData.sources || null
    };

    const result = recipePreviewSchema.safeParse(recipeData);

    if (!result.success) {
      console.error("Validation error:", result.error);
      throw new Error("Invalid recipe format after image analysis");
    }

    return result.data;
  } catch (error) {
    log(
      "Error analyzing recipe image:",
      error instanceof Error ? error.message : "Unknown error",
    );
    throw new Error("Failed to analyze recipe image");
  }
}
