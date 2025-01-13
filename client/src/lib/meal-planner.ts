import { MealPlan, type DayType, type MealType } from "@db/schema";
import { startOfWeek, addDays, format } from "date-fns";

export const DAYS: DayType[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner"];

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
): Array<{
  day: DayType;
  recipes: {
    breakfast?: number[];
    lunch?: number[];
    dinner?: number[];
  };
}> {
  return days.map((day) => {
    const existingDayMeal = currentWeekPlan?.meals?.find(m => m.day === day);
    const existingRecipes = existingDayMeal?.recipes || {};

    if (day === selectedDay) {
      return {
        day,
        recipes: {
          ...existingRecipes,
          [selectedMeal]: [...(existingRecipes[selectedMeal] || []), recipeId]
        }
      };
    } 

    return existingDayMeal || { 
      day, 
      recipes: {} 
    };
  });
}