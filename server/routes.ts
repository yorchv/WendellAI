import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { log } from "./vite";
import { db } from "@db";
import {
  recipes,
  mealPlans,
  pantryItems,
  shoppingListItems,
} from "@db/schema";
import { eq } from "drizzle-orm";
import { generateRecipe } from "./perplexity";
import { z } from "zod";
import { analyzeRecipeImage } from "./claude";

const generateRecipeSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
});

const recipeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  ingredients: z
    .array(z.string())
    .min(1, "At least one ingredient is required"),
  instructions: z
    .array(z.string())
    .min(1, "At least one instruction is required"),
  prepTime: z.number().optional(),
  cookTime: z.number().optional(),
  servings: z.number().optional(),
  image: z.string().optional(),
  sources: z.array(z.string()).optional(),
});

const mealPlanSchema = z.object({
  weekStart: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val)),
  weekEnd: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val)),
  meals: z
    .array(
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
          breakfast: z.number().optional(),
          lunch: z.number().optional(),
          dinner: z.number().optional(),
        }),
      }),
    )
    .min(1, "At least one day's meals are required"),
});

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Recipe Generation
  app.post("/api/recipes/generate", async (req, res) => {
    if (!req.isAuthenticated()) {
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

  // Recipes
  app.get("/api/recipes", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }
    const userRecipes = await db.query.recipes.findMany({
      where: eq(recipes.userId, req.user.id),
    });
    res.json(userRecipes);
  });

  app.get("/api/recipes/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const recipe = await db.query.recipes.findFirst({
      where: eq(recipes.id, parseInt(req.params.id)),
    });

    if (!recipe) {
      return res.status(404).send("Recipe not found");
    }

    if (recipe.userId !== req.user.id) {
      return res.status(403).send("Not authorized to view this recipe");
    }

    res.json(recipe);
  });

  app.post("/api/recipes", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }
    const result = recipeSchema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .send(result.error.errors.map((err) => err.message).join(", "));
    }
    const recipe = await db
      .insert(recipes)
      .values({
        ...result.data,
        userId: req.user.id,
      })
      .returning();
    res.json(recipe[0]);
  });

  app.put("/api/recipes/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const recipe = await db.query.recipes.findFirst({
      where: eq(recipes.id, parseInt(req.params.id)),
    });

    if (!recipe) {
      return res.status(404).send("Recipe not found");
    }

    if (recipe.userId !== req.user.id) {
      return res.status(403).send("Not authorized to update this recipe");
    }

    const result = recipeSchema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .send(result.error.errors.map((err) => err.message).join(", "));
    }

    const updatedRecipe = await db
      .update(recipes)
      .set(result.data)
      .where(eq(recipes.id, parseInt(req.params.id)))
      .returning();

    res.json(updatedRecipe[0]);
  });

  app.delete("/api/recipes/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const recipe = await db.query.recipes.findFirst({
      where: eq(recipes.id, parseInt(req.params.id)),
    });

    if (!recipe) {
      return res.status(404).send("Recipe not found");
    }

    if (recipe.userId !== req.user.id) {
      return res.status(403).send("Not authorized to delete this recipe");
    }

    await db.delete(recipes).where(eq(recipes.id, parseInt(req.params.id)));

    res.status(204).end();
  });

  // Meal Plans
  app.get("/api/meal-plans", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }
    const userMealPlans = await db.query.mealPlans.findMany({
      where: eq(mealPlans.userId, req.user.id),
    });
    res.json(userMealPlans);
  });

  app.post("/api/meal-plans", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }
    const result = mealPlanSchema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .send(result.error.errors.map((err) => err.message).join(", "));
    }
    log(req.body);
    const mealPlan = await db
      .insert(mealPlans)
      .values({
        ...result.data,
        userId: req.user.id,
      })
      .returning();
    res.json(mealPlan[0]);
  });

  // Pantry Items
  app.get("/api/pantry", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }
    const items = await db.query.pantryItems.findMany({
      where: eq(pantryItems.userId, req.user.id),
    });
    res.json(items);
  });

  app.post("/api/pantry", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }
    const item = await db
      .insert(pantryItems)
      .values({
        ...req.body,
        userId: req.user.id,
      })
      .returning();
    res.json(item[0]);
  });

  // Shopping Lists
  app.get("/api/shopping-lists", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }
    const lists = await db.query.shoppingLists.findMany({
      where: eq(shoppingLists.userId, req.user.id),
    });
    res.json(lists);
  });

  app.get("/api/shopping-list-items", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }
    const items = await db.query.shoppingListItems.findMany({
      where: eq(shoppingListItems.userId, req.user.id),
    });
    res.json(items);
  });

  app.post("/api/shopping-list-items", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    log(JSON.stringify(req.body));
    const items = await db
      .insert(shoppingListItems)
      .values({
        ...req.body,
        userId: req.user.id,
      })
      .returning();
    res.json(items[0]);
  });

  app.put("/api/shopping-list-items/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const item = await db.query.shoppingListItems.findFirst({
      where: eq(shoppingListItems.id, parseInt(req.params.id)),
    });

    if (!item) {
      return res.status(404).send("Item not found");
    }

    if (item.userId !== req.user.id) {
      return res.status(403).send("Not authorized to update this item");
    }

    const updatedItem = await db
      .update(shoppingListItems)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(shoppingListItems.id, parseInt(req.params.id)))
      .returning();

    res.json(updatedItem[0]);
  });

  app.put("/api/shopping-lists/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const list = await db.query.shoppingLists.findFirst({
      where: eq(shoppingLists.id, parseInt(req.params.id)),
    });

    if (!list) {
      return res.status(404).send("Shopping list not found");
    }

    if (list.userId !== req.user.id) {
      return res
        .status(403)
        .send("Not authorized to update this shopping list");
    }

    const updatedList = await db
      .update(shoppingLists)
      .set(req.body)
      .where(eq(shoppingLists.id, parseInt(req.params.id)))
      .returning();

    res.json(updatedList[0]);
  });

  // Recipe Image Analysis
  app.post("/api/recipes/analyze-image", async (req, res) => {
    if (!req.isAuthenticated()) {
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
            result.error.issues.map((i) => i.message).join(", "),
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
