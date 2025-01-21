
import { Router } from "express";
import { db } from "@db";
import { recipes, ingredients, recipeIngredients } from "@db/schema";
import { eq } from "drizzle-orm";
import { generateRecipe } from "../perplexity";
import { analyzeRecipeImage } from "../claude";
import { generateRecipeImage } from "../image-generation";
import { z } from "zod";

const router = Router();

const generateRecipeSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
});

router.get("/", async (req, res) => {
  const user = req.user as { id: number } | undefined;
  if (!user?.id) {
    return res.status(401).send("Not authenticated");
  }

  try {
    const userRecipes = await db.query.recipes.findMany({
      where: eq(recipes.userId, user.id),
      with: {
        ingredients: {
          with: {
            ingredient: true,
          },
        },
      },
    });
    res.json(userRecipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).send("Failed to fetch recipes");
  }
});

// Add all other recipe routes here
// Including POST /generate, POST /analyze-image, GET /:id, POST /, etc.

export default router;
