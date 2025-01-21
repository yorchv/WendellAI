
import { z } from "zod";

export const createShoppingListItemSchema = z.object({
  ingredientId: z.number(),
  startDate: z.string().transform(val => new Date(val)),
  endDate: z.string().transform(val => new Date(val)),
  quantity: z.number().nullable(),
  unit: z.string().nullable(),
  recipeIds: z.array(z.number()).nullable(),
}).refine(
  data => {
    const daysDiff = (data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 30 && daysDiff >= 0;
  },
  "Date range must be between 0 and 30 days"
);

export const updateShoppingListItemSchema = z.object({
  quantity: z.number().nullable(),
  unit: z.string().nullable(),
  checked: z.boolean(),
});
