
import { Router } from "express";
import { db } from "@db";
import { mealPlans, familyMembers } from "@db/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Add all meal plan routes here
// Including GET /, POST /, PUT /:id, DELETE /:id

export default router;
