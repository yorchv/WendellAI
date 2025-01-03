import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { log } from "./vite";
import { db } from "@db";
import {
  recipes,
  mealPlans,
  shoppingListItems,
  ingredients,
  recipeIngredients,
} from "@db/schema";
import { eq, and, between } from "drizzle-orm";
import { generateRecipe } from "./perplexity";
import { z } from "zod";
import { analyzeRecipeImage } from "./claude";

// Validate date range for shopping list
const dateRangeSchema = z.object({
  startDate: z.string().transform(val => new Date(val)),
  endDate: z.string().transform(val => new Date(val)),
}).refine(data => {
  const daysDiff = (data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff <= 30 && daysDiff >= 0;
}, "Date range must be between 0 and 30 days");

const generateRecipeSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
});

const recipeIngredientSchema = z.object({
  name: z.string().min(1, "Ingredient name is required"),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  notes: z.string().optional(),
});

const recipeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  ingredients: z.array(recipeIngredientSchema).min(1, "At least one ingredient is required"),
  instructions: z.array(z.string()).min(1, "At least one instruction is required"),
  prepTime: z.number().optional(),
  cookTime: z.number().optional(),
  servings: z.number().optional(),
  image: z.string().optional(),
  sources: z.array(z.string()).optional(),
});

const mealPlanSchema = z.object({
  weekStart: z.string().or(z.date()).transform((val) => new Date(val)),
  weekEnd: z.string().or(z.date()).transform((val) => new Date(val)),
  meals: z.array(
    z.object({
      day: z.enum([
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ]),
      recipes: z.object({
        breakfast: z.array(z.number()).default([]),
        lunch: z.array(z.number()).default([]),
        dinner: z.array(z.number()).default([]),
      }),
    })
  ).min(1, "At least one day's meals are required"),
});

export function registerRoutes(app: Express): Server {
  // Important: Setup auth before registering routes
  setupAuth(app);

  // Recipe Generation
  app.post("/api/recipes/generate", async (req, res) => {
    const user = req.user as { id: number } | undefined;
    if (!user?.id) {
      return res.status(401).send("Not authenticated");
    }

    const result = generateRecipeSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).send(
        "Invalid input: " + result.error.issues.map((i) => i.message).join(", ")
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

  // Recipes with ingredients
  app.get("/api/recipes", async (req, res) => {
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

  app.get("/api/recipes/:id", async (req, res) => {
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

  app.post("/api/recipes", async (req, res) => {
    const user = req.user as { id: number } | undefined;
    if (!user?.id) {
      return res.status(401).send("Not authenticated");
    }

    const { ingredients: recipeIngredientsList, ...recipeData } = req.body;

    try {
      const result = await db.transaction(async (tx) => {
        // Create the recipe first
        const [recipe] = await tx
          .insert(recipes)
          .values({
            ...recipeData,
            userId: user.id,
          })
          .returning();

        // Process ingredients
        for (const ingredient of recipeIngredientsList) {
          // Find or create ingredient
          let [ingredientRecord] = await tx
            .insert(ingredients)
            .values({
              name: ingredient.name.toLowerCase().trim(),
            })
            .onConflictDoUpdate({
              target: ingredients.name,
              set: { updatedAt: new Date() },
            })
            .returning();

          // Create recipe-ingredient relationship
          await tx.insert(recipeIngredients).values({
            recipeId: recipe.id,
            ingredientId: ingredientRecord.id,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            notes: ingredient.notes,
          });
        }

        return recipe;
      });

      // Fetch the complete recipe with ingredients
      const completeRecipe = await db.query.recipes.findFirst({
        where: eq(recipes.id, result.id),
        with: {
          ingredients: {
            with: {
              ingredient: true,
            },
          },
        },
      });

      res.json(completeRecipe);
    } catch (error) {
      console.error("Error creating recipe:", error);
      res.status(500).send("Failed to create recipe");
    }
  });

  // Meal Plans
  app.get("/api/meal-plans", async (req, res) => {
    const user = req.user as { id: number } | undefined;
    if (!user?.id) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const userMealPlans = await db.query.mealPlans.findMany({
        where: eq(mealPlans.userId, user.id),
        orderBy: (mealPlans, { desc }) => [desc(mealPlans.weekStart)],
      });
      res.json(userMealPlans);
    } catch (error) {
      console.error("Error fetching meal plans:", error);
      res.status(500).send("Failed to fetch meal plans");
    }
  });

  app.post("/api/meal-plans", async (req, res) => {
    const user = req.user as { id: number } | undefined;
    if (!user?.id) {
      return res.status(401).send("Not authenticated");
    }

    const result = mealPlanSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).send(
        "Invalid input: " + result.error.issues.map((i) => i.message).join(", ")
      );
    }

    try {
      const [mealPlan] = await db
        .insert(mealPlans)
        .values({
          userId: user.id,
          weekStart: result.data.weekStart,
          weekEnd: result.data.weekEnd,
          meals: result.data.meals,
        })
        .returning();
      res.json(mealPlan);
    } catch (error) {
      console.error("Error creating meal plan:", error);
      res.status(500).send("Failed to create meal plan");
    }
  });

  app.put("/api/meal-plans/:id", async (req, res) => {
    const user = req.user as { id: number } | undefined;
    if (!user?.id) {
      return res.status(401).send("Not authenticated");
    }

    const result = mealPlanSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).send(
        "Invalid input: " + result.error.issues.map((i) => i.message).join(", ")
      );
    }

    try {
      const mealPlan = await db.query.mealPlans.findFirst({
        where: eq(mealPlans.id, parseInt(req.params.id)),
      });

      if (!mealPlan) {
        return res.status(404).send("Meal plan not found");
      }

      if (mealPlan.userId !== user.id) {
        return res.status(403).send("Not authorized to update this meal plan");
      }

      const [updatedMealPlan] = await db
        .update(mealPlans)
        .set({
          weekStart: result.data.weekStart,
          weekEnd: result.data.weekEnd,
          meals: result.data.meals,
        })
        .where(eq(mealPlans.id, parseInt(req.params.id)))
        .returning();

      res.json(updatedMealPlan);
    } catch (error) {
      console.error("Error updating meal plan:", error);
      res.status(500).send("Failed to update meal plan");
    }
  });

  // Shopping List Items with date range
  app.get("/api/shopping-list-items", async (req, res) => {
    const user = req.user as { id: number } | undefined;
    if (!user?.id) {
      return res.status(401).send("Not authenticated");
    }

    const dateRangeResult = dateRangeSchema.safeParse({
      startDate: req.query.startDate || new Date().toISOString(),
      endDate: req.query.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    if (!dateRangeResult.success) {
      return res.status(400).send(dateRangeResult.error.errors.map(err => err.message).join(", "));
    }

    const { startDate, endDate } = dateRangeResult.data;

    try {
      const items = await db.query.shoppingListItems.findMany({
        where: and(
          eq(shoppingListItems.userId, user.id),
          between(shoppingListItems.startDate, startDate, endDate)
        ),
        with: {
          ingredient: true,
        },
      });
      res.json(items);
    } catch (error) {
      console.error("Error fetching shopping list items:", error);
      res.status(500).send("Failed to fetch shopping list items");
    }
  });

  app.post("/api/shopping-list-items", async (req, res) => {
    const user = req.user as { id: number } | undefined;
    if (!user?.id) {
      return res.status(401).send("Not authenticated");
    }

    const {
      ingredientId,
      startDate,
      endDate,
      quantity,
      unit,
      recipeIds,
    } = req.body;

    try {
      const dateRangeResult = dateRangeSchema.safeParse({ startDate, endDate });
      if (!dateRangeResult.success) {
        return res.status(400).send(dateRangeResult.error.errors.map(err => err.message).join(", "));
      }

      const item = await db
        .insert(shoppingListItems)
        .values({
          userId: user.id,
          ingredientId,
          startDate: dateRangeResult.data.startDate,
          endDate: dateRangeResult.data.endDate,
          quantity,
          unit,
          recipeIds,
        })
        .returning();
      res.json(item[0]);
    } catch (error) {
      console.error("Error creating shopping list item:", error);
      res.status(500).send("Failed to create shopping list item");
    }
  });

  app.put("/api/shopping-list-items/:id", async (req, res) => {
    const user = req.user as { id: number } | undefined;
    if (!user?.id) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const item = await db.query.shoppingListItems.findFirst({
        where: eq(shoppingListItems.id, parseInt(req.params.id)),
      });

      if (!item) {
        return res.status(404).send("Item not found");
      }

      if (item.userId !== user.id) {
        return res.status(403).send("Not authorized to update this item");
      }

      const updatedItem = await db
        .update(shoppingListItems)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(shoppingListItems.id, parseInt(req.params.id)))
        .returning();

      res.json(updatedItem[0]);
    } catch (error) {
      console.error("Error updating shopping list item:", error);
      res.status(500).send("Failed to update shopping list item");
    }
  });

  // Recipe Image Analysis
  app.post("/api/recipes/analyze-image", async (req, res) => {
    const user = req.user as { id: number } | undefined;
    if (!user?.id) {
      return res.status(401).send("Not authenticated");
    }

    const imageSchema = z.object({
      image: z.string().min(1, "Image data is required"),
    });

    const result = imageSchema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .send(
          "Invalid input: " +
            result.error.issues.map((i) => i.message).join(", ")
        );
    }

    try {
      const recipe = await analyzeRecipeImage(result.data.image);
      res.json(recipe);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to analyze recipe image";
      console.error("Recipe image analysis error:", errorMessage);
      res.status(500).send(errorMessage);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}