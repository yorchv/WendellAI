
import { z } from "zod";
import { mealTypeEnum } from "@db/schema";

export const createFamilyMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  birthDate: z.string().transform(val => new Date(val)),
  isGuest: z.boolean().default(false),
});

export const createDietaryPreferenceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["ALLERGY", "DIET", "SUPPLEMENTATION"]),
  description: z.string().nullable(),
});

export const createFamilyMemberDietaryPreferenceSchema = z.object({
  dietaryPreferenceId: z.number(),
  notes: z.string().nullable(),
});

export const createMealParticipationSchema = z.object({
  defaultParticipation: z.boolean().default(true),
  defaultMeals: z.array(z.enum(mealTypeEnum)).nullable(),
});
