
import { z } from "zod";

export const createRecipeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable(),
  instructions: z.array(z.string()).min(1, "At least one instruction is required"),
  prepTime: z.number().nullable(),
  cookTime: z.number().nullable(),
  servings: z.number().nullable(),
  image: z.string().nullable(),
  sources: z.array(z.string()).nullable(),
});

export const updateRecipeSchema = createRecipeSchema.partial();

export const generateRecipeSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
});

export const analyzeImageSchema = z.object({
  image: z.string().min(1, "Image is required"),
  mediaType: z.string().min(1, "Media type is required"),
});
