
import { Request, Response, NextFunction } from "express";
import { db } from "@db";
import { apiUsage } from "@db/schema";
import { eq } from "drizzle-orm";

export async function trackApiUsage(req: Request, res: Response, next: NextFunction) {
  const endpoint = req.path;
  
  try {
    let [usage] = await db
      .select()
      .from(apiUsage)
      .where(eq(apiUsage.endpoint, endpoint));

    if (!usage) {
      [usage] = await db
        .insert(apiUsage)
        .values({
          endpoint,
          count: 1
        })
        .returning();
    } else {
      await db
        .update(apiUsage)
        .set({ 
          count: usage.count + 1,
          updatedAt: new Date()
        })
        .where(eq(apiUsage.id, usage.id));
    }
  } catch (error) {
    console.error("Error tracking API usage:", error);
  }

  next();
}
