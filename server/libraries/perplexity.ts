
import { z } from "zod";
import { formatRecipeResponse } from "./claude";

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  citations: string[];
}

export const recipeIngredientSchema = z.object({
  name: z.string(),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  notes: z.string().optional(),
});

export const recipePreviewSchema = z.object({
  title: z.string(),
  description: z.string().nullable(),
  ingredients: z.array(z.object({
    name: z.string(),
    quantity: z.number().nullable(),
    unit: z.string().nullable(),
    notes: z.string().nullable()
  })),
  instructions: z.array(z.string()),
  prepTime: z.number().nullable(),
  cookTime: z.number().nullable(),
  servings: z.number().nullable(),
  image: z.string().optional(),
  sources: z.array(z.string()).nullable().optional()
});

export type RecipePreview = z.infer<typeof recipePreviewSchema>;

export async function generateRecipe(prompt: string): Promise<RecipePreview> {
  if (!PERPLEXITY_API_KEY) {
    throw new Error("Missing PERPLEXITY_API_KEY environment variable");
  }

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-sonar-small-128k-online",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful cooking assistant. Generate detailed recipes based on user requests. Include structured ingredient information with quantities, units, and optional notes. Make it concise.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate recipe");
  }

  const data: PerplexityResponse = await response.json();
  const content = data.choices[0].message.content;

  const formattedRecipe = await formatRecipeResponse(content);
  return {
    ...formattedRecipe,
    sources: data.citations,
  };
}
