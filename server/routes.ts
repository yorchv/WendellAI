import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { recipes, mealPlans, pantryItems, shoppingLists } from "@db/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

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
    const recipe = await db.insert(recipes).values({
      ...req.body,
      userId: req.user.id,
    }).returning();
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

    const updatedRecipe = await db
      .update(recipes)
      .set(req.body)
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

    await db
      .delete(recipes)
      .where(eq(recipes.id, parseInt(req.params.id)));

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
    const mealPlan = await db.insert(mealPlans).values({
      ...req.body,
      userId: req.user.id,
    }).returning();
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
    const item = await db.insert(pantryItems).values({
      ...req.body,
      userId: req.user.id,
    }).returning();
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

  app.post("/api/shopping-lists", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }
    const list = await db.insert(shoppingLists).values({
      ...req.body,
      userId: req.user.id,
    }).returning();
    res.json(list[0]);
  });

  const httpServer = createServer(app);
  return httpServer;
}