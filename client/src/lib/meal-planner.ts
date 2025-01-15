import { MealPlan } from "@db/schema";
import { startOfWeek, addDays, format } from "date-fns";

export type DayType = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
export type MealType = "breakfast" | "lunch" | "dinner";

export const DAYS: DayType[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner"];

export interface Meal {
  mealType: MealType;
  recipes: number[];
  participants: number[];
}

export interface DayMeal {
  day: DayType;
  meals: Meal[];
}

export function getWeekBoundaries(date: Date) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);
  return { weekStart, weekEnd };
}

export function findCurrentWeekPlan(mealPlans: MealPlan[] | undefined, weekStart: Date) {
  if (!mealPlans) return undefined;
  return mealPlans.find(
    (plan) => format(new Date(plan.weekStart), "yyyy-MM-dd") === format(weekStart, "yyyy-MM-dd")
  );
}

export function generateMealsData(
  days: DayType[],
  currentWeekPlan: MealPlan | undefined,
  selectedDay: DayType,
  selectedMeal: MealType,
  recipeId: number
): DayMeal[] {
  return days.map((day) => {
    const existingDayMeal = currentWeekPlan?.meals?.find(m => m.day === day);
    const existingRecipes = existingDayMeal?.recipes || {};

    if (day === selectedDay) {
      const currentMeal = existingRecipes[selectedMeal] || { recipeIds: [], participants: [] };
      return {
        day,
        recipes: {
          ...Object.fromEntries(
            Object.entries(existingRecipes).map(([key, value]) => [
              key,
              { recipeIds: value?.recipeIds || [], participants: value?.participants || [] }
            ])
          ),
          [selectedMeal]: {
            recipeIds: [...(currentMeal.recipeIds || []), recipeId],
            participants: currentMeal.participants || []
          }
        }
      };
    } 

    return {
      day,
      recipes: Object.fromEntries(
        Object.entries(existingDayMeal?.recipes || {}).map(([key, value]) => [
          key,
          { recipeIds: value?.recipeIds || [], participants: value?.participants || [] }
        ])
      )
    };
  });
}