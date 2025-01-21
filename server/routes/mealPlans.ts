import { Router } from "express";
import { db } from "@db";
import { mealPlans, familyMembers } from "@db/schema";
import { eq } from "drizzle-orm";
import { createMealPlanSchema, updateMealPlanSchema } from "../validators/mealPlans";

const router = Router();

router.get("/", async (req, res) => {
  const user = req.user as { id: number } | undefined;
  if (!user?.id) {
    return res.status(401).send("Not authenticated");
  }

  try {
    const userMealPlans = await db.query.mealPlans.findMany({
      where: eq(mealPlans.userId, user.id),
      orderBy: (mealPlans, { desc }) => [desc(mealPlans.weekStart)],
    });

    const familyMemberParticipations = await db.query.familyMembers.findMany({
      where: eq(familyMembers.userId, user.id),
      with: {
        mealParticipations: true,
      },
    });

    const enhancedMealPlans = userMealPlans.map(plan => ({
      ...plan,
      days: plan.days?.map(day => ({
        ...day,
        meals: Object.fromEntries(
          Object.entries(day.meals || {}).map(([mealType, mealData]) => {
            if (!mealData) {
              // When a new meal is created, include all family members
              const allFamilyMemberIds = familyMemberParticipations.map(member => member.id);
              return [mealType, { recipeIds: [], participants: allFamilyMemberIds }];
            }

            const participants = mealData.participants ?? familyMemberParticipations.map(member => member.id);

            return [mealType, { 
              recipeIds: mealData.recipeIds || [],
              participants 
            }];
          })
        ),
      })),
    }));

    res.json(enhancedMealPlans);
  } catch (error) {
    console.error("Error fetching meal plans:", error);
    res.status(500).send("Failed to fetch meal plans");
  }
});

router.post("/", async (req, res) => {
  const user = req.user as { id: number } | undefined;
  if (!user?.id) {
    return res.status(401).send("Not authenticated");
  }

  try {
    const result = createMealPlanSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }

    const [mealPlan] = await db
      .insert(mealPlans)
      .values({
        userId: user.id,
        ...result.data,
      })
      .returning();

    res.json(mealPlan);
  } catch (error) {
    console.error("Error creating meal plan:", error);
    res.status(500).send("Failed to create meal plan");
  }
});

router.put("/:id", async (req, res) => {
  const user = req.user as { id: number } | undefined;
  if (!user?.id) {
    return res.status(401).send("Not authenticated");
  }

  try {
    const result = updateMealPlanSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }

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
      .set(result.data)
      .where(eq(mealPlans.id, parseInt(req.params.id)))
      .returning();

    res.json(updatedMealPlan);
  } catch (error) {
    console.error("Error updating meal plan:", error);
    res.status(500).send("Failed to update meal plan");
  }
});

router.delete("/:id", async (req, res) => {
  const user = req.user as { id: number } | undefined;
  if (!user?.id) {
    return res.status(401).send("Not authenticated");
  }

  try {
    const mealPlan = await db.query.mealPlans.findFirst({
      where: eq(mealPlans.id, parseInt(req.params.id)),
    });

    if (!mealPlan) {
      return res.status(404).send("Meal plan not found");
    }

    if (mealPlan.userId !== user.id) {
      return res.status(403).send("Not authorized to delete this meal plan");
    }

    await db.delete(mealPlans).where(eq(mealPlans.id, parseInt(req.params.id)));
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting meal plan:", error);
    res.status(500).send("Failed to delete meal plan");
  }
});

export default router;