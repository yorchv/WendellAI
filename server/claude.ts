import Anthropic from "@anthropic-ai/sdk";
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
    const systemInstructions =
      "You are a JSON formatting assistant. Your responses must contain ONLY valid JSON, with no additional text or explanation. Format the recipe into this structure: { title: string, description: string, ingredients: { name: string, quantity?: number, unit?: string, notes?: string }[], instructions: string[], prepTime?: number, cookTime?: number, servings?: number, sources?: string[] }";

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

    // Access the content safely
    const formattedJson =
      response.content[0].type === "text" ? response.content[0].text : "";
    log("Claude formatted response:", formattedJson);

    // Parse and validate the formatted JSON
    const parsed = JSON.parse(formattedJson);
    const result = recipePreviewSchema.safeParse(parsed);

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
    // Ensure proper base64 image format with data URI prefix if not present
    const formattedBase64 = base64Image.includes("base64,")
      ? base64Image.split("base64,")[1]
      : base64Image;

    log(base64Image);
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this recipe image and extract the recipe details. Format the response as JSON with the following structure: { title: string, description: string, ingredients: string[], instructions: string[], prepTime: number, cookTime: number, servings: number }",
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

    // Access the content safely
    const formattedJson =
      response.content[0].type === "text" ? response.content[0].text : "";
    log("Claude image analysis response:", formattedJson);

    // Parse and validate the formatted JSON
    const parsed = JSON.parse(formattedJson);
    // Handle if response is an array by taking first item
    const recipeData = Array.isArray(parsed) ? parsed[0] : parsed;
    const result = recipePreviewSchema.safeParse(recipeData);

    if (!result.success) {
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