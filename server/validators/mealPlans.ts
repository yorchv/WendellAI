
import { z } from "zod";
import { dayEnum, mealTypeEnum } from "@db/schema";

const mealSchema = z.object({
  recipeIds: z.array(z.number()),
  participants: z.array(z.number()),
});

const daySchema = z.object({
  dayName: z.enum(dayEnum),
  calendarDay: z.string(),
  meals: z.record(z.enum(mealTypeEnum), mealSchema).optional(),
});

export const createMealPlanSchema = z.object({
  weekStart: z.string().transform(val => new Date(val)),
  weekEnd: z.string().transform(val => new Date(val)),
  days: z.array(daySchema),
}).refine(
  data => {
    const daysDiff = (data.weekEnd.getTime() - data.weekStart.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 30 && daysDiff >= 0;
  },
  "Date range must be between 0 and 30 days"
);

export const updateMealPlanSchema = createMealPlanSchema;
