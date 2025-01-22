import { Router } from "express";
import { db } from "@db";
import { recipes, ingredients, recipeIngredients } from "@db/schema";
import { eq, and } from "drizzle-orm";
import { generateRecipe } from "../libraries/perplexity";
import { analyzeRecipeImage } from "../libraries/claude";
import { generateRecipeImage } from "../libraries/image-generation";
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
    );

    console.log(imageUrl);

    const [updatedRecipe] = await db
      .update(recipes)
      .set({ imageUrl })
      .where(eq(recipes.id, parseInt(req.params.id)))
      .returning();

    res.json({ imageUrl: updatedRecipe.imageUrl });
  } catch (error) {
    console.error("Error generating recipe image:", error);
    res.status(500).send("Failed to generate recipe image");
  }
});

export default router;
