
import { Router } from "express";
import { db } from "@db";
import { shoppingListItems } from "@db/schema";
import { eq, and, between } from "drizzle-orm";
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

  const dateRangeResult = dateRangeSchema.safeParse({
    startDate: req.query.startDate || new Date().toISOString(),
    endDate: req.query.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });

  if (!dateRangeResult.success) {
    return res.status(400).send(dateRangeResult.error.errors.map((err) => err.message).join(", "));
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

router.post("/", async (req, res) => {
  const user = req.user as { id: number } | undefined;
  if (!user?.id) {
    return res.status(401).send("Not authenticated");
  }

  try {
    const dateRangeResult = dateRangeSchema.safeParse({
      startDate: req.body.startDate,
      endDate: req.body.endDate,
    });

    if (!dateRangeResult.success) {
      return res.status(400).send(dateRangeResult.error.errors.map((err) => err.message).join(", "));
    }

    const [item] = await db
      .insert(shoppingListItems)
      .values({
        userId: user.id,
        ...req.body,
        startDate: dateRangeResult.data.startDate,
        endDate: dateRangeResult.data.endDate,
      })
      .returning();
    res.json(item);
  } catch (error) {
    console.error("Error creating shopping list item:", error);
    res.status(500).send("Failed to create shopping list item");
  }
});

router.put("/:id", async (req, res) => {
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

    const [updatedItem] = await db
      .update(shoppingListItems)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(shoppingListItems.id, parseInt(req.params.id)))
      .returning();

    res.json(updatedItem);
  } catch (error) {
    console.error("Error updating shopping list item:", error);
    res.status(500).send("Failed to update shopping list item");
  }
});

export default router;
