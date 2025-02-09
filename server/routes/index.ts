
import { Router } from "express";
import authRoutes from "./auth";
import recipeRoutes from "./recipes";
import mealPlanRoutes from "./mealPlans";
import shoppingListRoutes from "./shoppingList";
import familyRoutes from "./family";
import toolsRoutes from "./tools";

const router = Router();

// These routes will be prefixed with /api automatically
router.use("/auth", authRoutes);
router.use("/recipes", recipeRoutes);
router.use("/meal-plans", mealPlanRoutes);
router.use("/shopping-list", shoppingListRoutes);
router.use("/family-members", familyRoutes);
router.use("/tools", toolsRoutes);
export default router;
