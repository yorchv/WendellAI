
import { Router } from "express";
import { db } from "@db";
import { shoppingListItems } from "@db/schema";
import { eq, and, between } from "drizzle-orm";

const router = Router();

// Add all shopping list routes here
// Including GET /, POST /, PUT /:id

export default router;
