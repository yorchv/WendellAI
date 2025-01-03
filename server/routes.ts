import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { log } from './vite'
import { db } from "@db";
import { recipes, mealPlans, pantryItems, shoppingLists } from "@db/schema";
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
  ingredients: z.array(z.string()).min(1, "At least one ingredient is required"),
  instructions: z.array(z.string()).min(1, "At least one instruction is required"),
  prepTime: z.number().optional(),
  cookTime: z.number().optional(),
  servings: z.number().optional(),
  image: z.string().optional(),
  sources: z.array(z.string()).optional(),
});

const mealPlanSchema = z.object({
  weekStart: z.string().or(z.date()).transform(val => new Date(val)),
  weekEnd: z.string().or(z.date()).transform(val => new Date(val)),
  meals: z.array(z.object({
    day: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]),
    recipes: z.record(z.enum(["breakfast", "lunch", "dinner"]), z.number())
  })).min(1, "At least one day's meals are required")
});

const pantryItemSchema = z.object({

});

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Recipe Generation
  app.post("/api/recipes/generate", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const result = generateRecipeSchema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .json({ message: "Invalid input", errors: result.error.issues.map(i => i.message) });
    }

    try {
      const preview = await generateRecipe(result.data.prompt);
      res.json(preview);
    } catch (error) {
      console.error("Recipe generation error:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to generate recipe" });
    }
  });

  // Recipes
  app.get("/api/recipes", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const userRecipes = await db.query.recipes.findMany({
        where: eq(recipes.userId, req.user!.id),
      });
      res.json(userRecipes);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "An error occurred" });
    }
  });

  app.get("/api/recipes/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const recipe = await db.query.recipes.findFirst({
        where: eq(recipes.id, parseInt(req.params.id)),
      });

      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      if (recipe.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to view this recipe" });
      }

      res.json(recipe);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "An error occurred" });
    }
  });

  app.post("/api/recipes", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const result = recipeSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid input", errors: result.error.errors.map(err => err.message) });
    }
    try {
      const recipe = await db.insert(recipes).values({
        ...result.data,
        userId: req.user!.id,
      }).returning();
      res.json(recipe[0]);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to create recipe" });
    }
  });

  app.put("/api/recipes/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const recipe = await db.query.recipes.findFirst({
        where: eq(recipes.id, parseInt(req.params.id)),
      });

      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      if (recipe.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to update this recipe" });
      }

      const result = recipeSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input", errors: result.error.errors.map(err => err.message) });
      }

      const updatedRecipe = await db
        .update(recipes)
        .set(result.data)
        .where(eq(recipes.id, parseInt(req.params.id)))
        .returning();

      res.json(updatedRecipe[0]);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to update recipe" });
    }
  });

  app.delete("/api/recipes/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const recipe = await db.query.recipes.findFirst({
        where: eq(recipes.id, parseInt(req.params.id)),
      });

      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      if (recipe.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to delete this recipe" });
      }

      await db
        .delete(recipes)
        .where(eq(recipes.id, parseInt(req.params.id)));

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to delete recipe" });
    }
  });

  // Meal Plans
  app.get("/api/meal-plans", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const userMealPlans = await db.query.mealPlans.findMany({
        where: eq(mealPlans.userId, req.user!.id),
      });
      res.json(userMealPlans);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "An error occurred" });
    }
  });

  app.post("/api/meal-plans", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const result = mealPlanSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: result.error.errors.map(err => err.message)
        });
      }

      const mealPlan = await db.insert(mealPlans).values({
        userId: req.user!.id,
        weekStart: result.data.weekStart,
        weekEnd: result.data.weekEnd,
        meals: result.data.meals
      }).returning();

      res.json(mealPlan[0]);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to create meal plan" });
    }
  });

  app.put("/api/meal-plans/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const mealPlan = await db.query.mealPlans.findFirst({
        where: eq(mealPlans.id, parseInt(req.params.id)),
      });

      if (!mealPlan) {
        return res.status(404).json({ message: "Meal plan not found" });
      }

      if (mealPlan.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to update this meal plan" });
      }

      const result = mealPlanSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: result.error.errors.map(err => err.message)
        });
      }

      const updatedPlan = await db
        .update(mealPlans)
        .set({
          weekStart: result.data.weekStart,
          weekEnd: result.data.weekEnd,
          meals: result.data.meals
        })
        .where(eq(mealPlans.id, parseInt(req.params.id)))
        .returning();

      res.json(updatedPlan[0]);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to update meal plan" });
    }
  });

  app.delete("/api/meal-plans/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const mealPlan = await db.query.mealPlans.findFirst({
        where: eq(mealPlans.id, parseInt(req.params.id)),
      });

      if (!mealPlan) {
        return res.status(404).json({ message: "Meal plan not found" });
      }

      if (mealPlan.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to delete this meal plan" });
      }

      await db.delete(mealPlans)
        .where(eq(mealPlans.id, parseInt(req.params.id)));

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to delete meal plan" });
    }
  });

  // Pantry Items
  app.get("/api/pantry", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const items = await db.query.pantryItems.findMany({
        where: eq(pantryItems.userId, req.user!.id),
      });
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "An error occurred" });
    }
  });

  app.post("/api/pantry", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const item = await db.insert(pantryItems).values({
        ...req.body,
        userId: req.user!.id,
      }).returning();
      res.json(item[0]);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to create pantry item" });
    }
  });

  // Shopping Lists
  app.get("/api/shopping-lists", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const lists = await db.query.shoppingLists.findMany({
        where: eq(shoppingLists.userId, req.user!.id),
      });
      res.json(lists);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "An error occurred" });
    }
  });

  app.post("/api/shopping-lists", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const list = await db.insert(shoppingLists).values({
        ...req.body,
        userId: req.user!.id,
      }).returning();
      res.json(list[0]);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to create shopping list" });
    }
  });

  // Recipe Image Analysis
  app.post("/api/recipes/analyze-image", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const imageSchema = z.object({
      image: z.string().min(1, "Image data is required"),
    });

    const result = imageSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: result.error.issues.map(i => i.message)
      });
    }

    try {
      const recipe = await analyzeRecipeImage(result.data.image);
      res.json(recipe);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to analyze recipe image" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}