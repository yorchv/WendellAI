
import { Router } from "express";
import { db } from "@db";
import { mealPlans, familyMembers } from "@db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const dateRangeSchema = z.object({
  startDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().transform((val) => new Date(val)),
}).refine(
  (data) => {
    const daysDiff = (data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 30 && daysDiff >= 0;
  },
  "Date range must be between 0 and 30 days"
);

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
      meals: plan.meals?.map(meal => ({
        ...meal,
        recipes: Object.fromEntries(
          Object.entries(meal.recipes).map(([mealType, mealData]) => {
            const participants = mealData.participants ?? familyMemberParticipations
              .filter(member => 
                member.mealParticipations.some(mp => 
                  mp.defaultParticipation && 
                  (!mp.defaultMeals || mp.defaultMeals.includes(mealType as MealType))
                )
              )
              .map(member => member.id);

            return [mealType, { ...mealData, participants }];
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
    const { createdAt, ...reqData } = req.body;
    const transformedData = {
      ...reqData,
      weekStart: new Date(reqData.weekStart),
      weekEnd: new Date(reqData.weekEnd),
    };

    const [mealPlan] = await db
      .insert(mealPlans)
      .values({
        userId: user.id,
        ...transformedData,
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
    const mealPlan = await db.query.mealPlans.findFirst({
      where: eq(mealPlans.id, parseInt(req.params.id)),
    });

    if (!mealPlan) {
      return res.status(404).send("Meal plan not found");
    }

    if (mealPlan.userId !== user.id) {
      return res.status(403).send("Not authorized to update this meal plan");
    }

    const { createdAt, ...reqData } = req.body;
    const transformedData = {
      ...reqData,
      weekStart: new Date(reqData.weekStart),
      weekEnd: new Date(reqData.weekEnd),
    };

    const [updatedMealPlan] = await db
      .update(mealPlans)
      .set(transformedData)
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
