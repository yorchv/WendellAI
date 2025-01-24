
import { db } from "@db";
import { apiUsage } from "@db/schema";
import { eq } from "drizzle-orm";

const DAILY_LIMIT = 100;

export class ApiUsageManager {
  static async checkUsage(endpoint: string): Promise<{ 
    allowed: boolean;
    remaining: number;
  }> {
    const [usage] = await db
      .select()
      .from(apiUsage)
      .where(eq(apiUsage.endpoint, endpoint));

    if (!usage) {
      await db.insert(apiUsage).values({
        endpoint,
        count: 1
      });
      return { allowed: true, remaining: DAILY_LIMIT - 1 };
    }

    if (usage.count >= DAILY_LIMIT) {
      return { allowed: false, remaining: 0 };
    }

    await db
      .update(apiUsage)
      .set({ 
        count: usage.count + 1,
        updatedAt: new Date()
      })
      .where(eq(apiUsage.id, usage.id));

    return { 
      allowed: true, 
      remaining: DAILY_LIMIT - (usage.count + 1)
    };
  }

  static async getRemainingRequests(endpoint: string): Promise<number> {
    const [usage] = await db
      .select()
      .from(apiUsage)
      .where(eq(apiUsage.endpoint, endpoint));
      
    return usage ? Math.max(0, DAILY_LIMIT - usage.count) : DAILY_LIMIT;
  }
}
