
import { Router } from "express";
import { db } from "@db";
import { 
  familyMembers,
  familyMemberDietaryPreferences,
  familyMemberMealParticipation,
  dietaryPreferences,
  insertFamilyMemberSchema,
  insertDietaryPreferenceSchema,
  insertFamilyMemberDietaryPreferenceSchema,
  insertFamilyMemberMealParticipationSchema,
} from "@db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

// Family Members
router.get("/", async (req, res) => {
  const user = req.user as { id: number } | undefined;
  if (!user?.id) {
    return res.status(401).send("Not authenticated");
  }

  try {
    const userFamilyMembers = await db.query.familyMembers.findMany({
      where: eq(familyMembers.userId, user.id),
      with: {
        dietaryPreferences: {
          with: {
            dietaryPreference: true,
          },
        },
      },
    });
    res.json(userFamilyMembers);
  } catch (error) {
    console.error("Error fetching family members:", error);
    res.status(500).send("Failed to fetch family members");
  }
});

router.post("/", async (req, res) => {
  const user = req.user as { id: number } | undefined;
  if (!user?.id) {
    return res.status(401).send("Not authenticated");
  }

  try {
    const result = insertFamilyMemberSchema.safeParse({
      ...req.body,
      userId: user.id,
    });

    if (!result.success) {
      return res.status(400).send(
        "Invalid input: " + result.error.issues.map((i) => i.message).join(", ")
      );
    }

    const [familyMember] = await db
      .insert(familyMembers)
      .values(result.data)
      .returning();

    res.json(familyMember);
  } catch (error) {
    console.error("Error creating family member:", error);
    res.status(500).send("Failed to create family member");
  }
});

// Dietary Preferences
router.get("/dietary-preferences", async (req, res) => {
  const user = req.user as { id: number } | undefined;
  if (!user?.id) {
    return res.status(401).send("Not authenticated");
  }

  try {
    const allDietaryPreferences = await db.query.dietaryPreferences.findMany();
    res.json(allDietaryPreferences);
  } catch (error) {
    console.error("Error fetching dietary preferences:", error);
    res.status(500).send("Failed to fetch dietary preferences");
  }
});

router.post("/dietary-preferences", async (req, res) => {
  const user = req.user as { id: number } | undefined;
  if (!user?.id) {
    return res.status(401).send("Not authenticated");
  }

  try {
    const result = insertDietaryPreferenceSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).send(
        "Invalid input: " + result.error.issues.map((i) => i.message).join(", ")
      );
    }

    const [dietaryPreference] = await db
      .insert(dietaryPreferences)
      .values(result.data)
      .returning();

    res.json(dietaryPreference);
  } catch (error) {
    console.error("Error creating dietary preference:", error);
    res.status(500).send("Failed to create dietary preference");
  }
});

// Member Dietary Preferences
router.post("/:familyMemberId/dietary-preferences", async (req, res) => {
  const user = req.user as { id: number } | undefined;
  if (!user?.id) {
    return res.status(401).send("Not authenticated");
  }

  try {
    const familyMember = await db.query.familyMembers.findFirst({
      where: eq(familyMembers.id, parseInt(req.params.familyMemberId)),
    });

    if (!familyMember) {
      return res.status(404).send("Family member not found");
    }

    if (familyMember.userId !== user.id) {
      return res.status(403).send("Not authorized to update this family member's preferences");
    }

    const result = insertFamilyMemberDietaryPreferenceSchema.safeParse({
      ...req.body,
      familyMemberId: parseInt(req.params.familyMemberId),
    });

    if (!result.success) {
      return res.status(400).send(
        "Invalid input: " + result.error.issues.map((i) => i.message).join(", ")
      );
    }

    const [preference] = await db
      .insert(familyMemberDietaryPreferences)
      .values(result.data)
      .returning();

    res.json(preference);
  } catch (error) {
    console.error("Error adding dietary preference to family member:", error);
    res.status(500).send("Failed to add dietary preference to family member");
  }
});

router.delete("/:familyMemberId/dietary-preferences/:preferenceId", async (req, res) => {
  const user = req.user as { id: number } | undefined;
  if (!user?.id) {
    return res.status(401).send("Not authenticated");
  }

  try {
    const familyMember = await db.query.familyMembers.findFirst({
      where: eq(familyMembers.id, parseInt(req.params.familyMemberId)),
    });

    if (!familyMember) {
      return res.status(404).send("Family member not found");
    }

    if (familyMember.userId !== user.id) {
      return res.status(403).send("Not authorized to update this family member's preferences");
    }

    await db
      .delete(familyMemberDietaryPreferences)
      .where(
        and(
          eq(familyMemberDietaryPreferences.familyMemberId, parseInt(req.params.familyMemberId)),
          eq(familyMemberDietaryPreferences.dietaryPreferenceId, parseInt(req.params.preferenceId))
        )
      );

    res.status(204).send();
  } catch (error) {
    console.error("Error removing dietary preference from family member:", error);
    res.status(500).send("Failed to remove dietary preference from family member");
  }
});

// Meal Participation
router.get("/:familyMemberId/meal-participation", async (req, res) => {
  const user = req.user as { id: number } | undefined;
  if (!user?.id) {
    return res.status(401).send("Not authenticated");
  }

  try {
    const familyMember = await db.query.familyMembers.findFirst({
      where: eq(familyMembers.id, parseInt(req.params.familyMemberId)),
      with: {
        mealParticipations: true,
      },
    });

    if (!familyMember) {
      return res.status(404).send("Family member not found");
    }

    if (familyMember.userId !== user.id) {
      return res.status(403).send("Not authorized to view this family member's preferences");
    }

    res.json(familyMember.mealParticipations[0] || null);
  } catch (error) {
    console.error("Error fetching meal participation:", error);
    res.status(500).send("Failed to fetch meal participation");
  }
});

router.post("/:familyMemberId/meal-participation", async (req, res) => {
  const user = req.user as { id: number } | undefined;
  if (!user?.id) {
    return res.status(401).send("Not authenticated");
  }

  try {
    const familyMember = await db.query.familyMembers.findFirst({
      where: eq(familyMembers.id, parseInt(req.params.familyMemberId)),
    });

    if (!familyMember) {
      return res.status(404).send("Family member not found");
    }

    if (familyMember.userId !== user.id) {
      return res.status(403).send("Not authorized to update this family member's preferences");
    }

    const result = insertFamilyMemberMealParticipationSchema.safeParse({
      ...req.body,
      familyMemberId: parseInt(req.params.familyMemberId),
    });

    if (!result.success) {
      return res.status(400).send(
        "Invalid input: " + result.error.issues.map((i) => i.message).join(", ")
      );
    }

    // Remove existing participation if any
    await db
      .delete(familyMemberMealParticipation)
      .where(eq(familyMemberMealParticipation.familyMemberId, parseInt(req.params.familyMemberId)));

    const [participation] = await db
      .insert(familyMemberMealParticipation)
      .values(result.data)
      .returning();

    res.json(participation);
  } catch (error) {
    console.error("Error setting meal participation:", error);
    res.status(500).send("Failed to set meal participation");
  }
});

export default router;
