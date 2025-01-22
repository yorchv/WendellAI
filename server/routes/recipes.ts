
import { Router } from "express";
import { db } from "@db";
import { recipes, ingredients, recipeIngredients } from "@db/schema";
import { eq, and } from "drizzle-orm";
import { generateRecipe } from "../libraries/perplexity";
import { analyzeRecipeImage } from "../libraries/claude";
import { generateRecipeImage } from "../libraries/image-generation";
import { z } from "zod";
import { createRecipeSchema } from "../validators/recipes";

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

router.post("/", async (req, res) => {
  const user = req.user as { id: number } | undefined;
  if (!user?.id) {
    return res.status(401).send("Not authenticated");
  }

  const result = createRecipeSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: "Invalid input",
      details: result.error.issues
    });
  }

  try {
    const { ingredients: ingredientsList, ...recipeData } = result.data;
    
    const [recipe] = await db.transaction(async (tx) => {
      // Create recipe first
      const [newRecipe] = await tx
        .insert(recipes)
        .values({
          ...recipeData,
          userId: user.id,
        })
        .returning();

      // Process ingredients
      const ingredientRows = await Promise.all(
        ingredientsList.map(async (ing) => {
          // Insert or update ingredient first
          const [ingredient] = await tx
            .insert(ingredients)
            .values({
              name: ing.name,
            })
            .onConflictDoUpdate({
              target: ingredients.name,
              set: { name: ing.name },
            })
            .returning();

          // Create the recipe-ingredient relationship
          return {
            recipeId: newRecipe.id,
            ingredientId: ingredient.id,
            quantity: ing.quantity || null,
            unit: ing.unit || null,
            notes: ing.notes || null,
          };
        })
      );

      // Insert all recipe-ingredient relationships
      if (ingredientRows.length > 0) {
        await tx.insert(recipeIngredients).values(ingredientRows);
      }

      return [newRecipe];
    });

    // Fetch the complete recipe with ingredients
    const fullRecipe = await db.query.recipes.findFirst({
      where: eq(recipes.id, recipe.id),
      with: {
        ingredients: {
          with: {
            ingredient: true,
          },
        },
      },
    });

    res.json(fullRecipe);
  } catch (error) {
    console.error("Error creating recipe:", error);
    res.status(500).json({ error: "Failed to create recipe", details: error instanceof Error ? error.message : "Unknown error" });
  }
});

router.get("/:id", async (req, res) => {
  const user = req.user as { id: number } | undefined;
  if (!user?.id) {
    return res.status(401).send("Not authenticated");
  }

  try {
    const recipe = await db.query.recipes.findFirst({
      where: eq(recipes.id, parseInt(req.params.id)),
      with: {
        ingredients: {
          with: {
            ingredient: true,
          },
        },
      },
    });

    if (!recipe) {
      return res.status(404).send("Recipe not found");
    }

    if (recipe.userId !== user.id) {
      return res.status(403).send("Not authorized to view this recipe");
    }

    res.json(recipe);
  } catch (error) {
    console.error("Error fetching recipe:", error);
    res.status(500).send("Failed to fetch recipe");
  }
});

router.post("/generate", async (req, res) => {
  const user = req.user as { id: number } | undefined;
  if (!user?.id) {
    return res.status(401).send("Not authenticated");
  }

  const result = generateRecipeSchema.safeParse(req.body);
  if (!result.success) {
    return res
      .status(400)
      .send(
        "Invalid input: " +
          result.error.issues.map((i) => i.message).join(", "),
      );
  }

  try {
    const preview = await generateRecipe(result.data.prompt);
    res.json(preview);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate recipe";
    console.error("Recipe generation error:", errorMessage);
    res.status(500).send(errorMessage);
  }
});

router.post("/analyze-image", async (req, res) => {
  const user = req.user as { id: number } | undefined;
  if (!user?.id) {
    return res.status(401).send("Not authenticated");
  }

  try {
    const { image, mediaType } = req.body;
    if (!image) {
      return res.status(400).send("No image provided");
    }
    if (!mediaType) {
      return res.status(400).send("No media type provided");
    }

    const recipe = await analyzeRecipeImage(image, mediaType);
    res.json(recipe);
  } catch (error) {
    console.error("Error analyzing recipe image:", error);
    res.status(500).send("Failed to analyze recipe image");
  }
});

router.post("/:id/generate-image", async (req, res) => {
  const user = req.user as { id: number } | undefined;
  if (!user?.id) {
    return res.status(401).send("Not authenticated");
  }

  try {
    const recipe = await db.query.recipes.findFirst({
      where: eq(recipes.id, parseInt(req.params.id)),
    });

    if (!recipe) {
      return res.status(404).send("Recipe not found");
    }

    if (recipe.userId !== user.id) {
      return res.status(403).send("Not authorized to modify this recipe");
    }

    const imageUrl = await generateRecipeImage(
      recipe.title,
      recipe.description || "",
      user.id
    );

    const [updatedRecipe] = await db
      .update(recipes)
      .set({ image: imageUrl })
      .where(eq(recipes.id, parseInt(req.params.id)))
      .returning();

    res.json({ imageUrl: updatedRecipe.image });
  } catch (error) {
    console.error("Error generating recipe image:", error);
    res.status(500).send("Failed to generate recipe image");
  }
});

export default router;
