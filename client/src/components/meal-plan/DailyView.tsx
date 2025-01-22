import { Card } from "@/components/ui/card";
import { format, addMinutes, differenceInMinutes } from "date-fns";
import type { MealType, DayType } from "@db/schema";
import { MealCell } from "./MealCell";
import { Clock, AlertCircle, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Recipe {
  id: number;
  title: string;
  description?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
}

interface DailyViewProps {
  planId: number | undefined;
  date: Date;
  days: Array<{
    dayName: DayType;
    calendarDay: string;
    meals: {
      [key in MealType]?: {
        recipeIds: number[];
        participants: number[];
      };
    };
  }>;
  recipes: Record<number, Recipe>;
  familyMembers: Record<number, { id: number; name: string }>;
  onAddRecipe?: (day: DayType, mealType: MealType) => void;
}

const DEFAULT_MEAL_TIMES = {
  breakfast: { hour: 8, minute: 0 },
  lunch: { hour: 12, minute: 30 },
  dinner: { hour: 18, minute: 30 },
};

function calculateTotalPrepTime(recipes: Recipe[]): number {
  return recipes.reduce((total, recipe) => {
    const prepTime = recipe.prepTime || 0;
    const cookTime = recipe.cookTime || 0;
    return total + prepTime + cookTime;
  }, 0);
}

function getMealTimeDate(mealTime: { hour: number; minute: number }): Date {
  const date = new Date();
  date.setHours(mealTime.hour, mealTime.minute, 0, 0);
  return date;
}

function getSuggestedStartTime(mealTime: { hour: number; minute: number }, totalPrepTime: number): Date {
  return addMinutes(getMealTimeDate(mealTime), -totalPrepTime);
}

function getPreparationStatus(startTime: Date, mealTime: Date) {
  const now = new Date();
  const minutesToStart = differenceInMinutes(startTime, now);
  const minutesToMeal = differenceInMinutes(mealTime, now);

  if (minutesToMeal < 0) {
    return { status: "Past meal time", variant: "muted" };
  }

  if (minutesToStart <= 0) {
    return { status: "Time to start cooking!", variant: "destructive" };
  }

  if (minutesToStart <= 30) {
    return { status: "Starting soon", variant: "warning" };
  }

  return { status: "Coming up", variant: "default" };
}

function getTimelineProgress(startTime: Date, mealTime: Date): number {
  const now = new Date();
  const totalDuration = differenceInMinutes(mealTime, startTime);
  const elapsed = differenceInMinutes(now, startTime);

  if (elapsed < 0) return 0;
  if (elapsed > totalDuration) return 100;

  return Math.round((elapsed / totalDuration) * 100);
}

export function DailyView({ planId, date, days, recipes, familyMembers, onAddRecipe }: DailyViewProps) {
  const dayOfWeek = format(date, 'EEEE') as DayType;
  const dayData = days?.find(day => day.dayName === dayOfWeek);

  return (
    <Card className="w-full">
      <div className="p-4 border-b">
        <h2 className="text-2xl font-semibold">
          {format(date, 'EEEE')}
          <span className="ml-2 text-muted-foreground font-normal">
            {format(date, 'MMMM d, yyyy')}
          </span>
        </h2>
      </div>
      <div className="divide-y">
        {["breakfast", "lunch", "dinner"].map((mealType: MealType) => {
          const mealData = dayData?.meals[mealType] || { recipeIds: [], participants: [] };
          const mealRecipes = mealData.recipeIds?.map(id => recipes[id]).filter(Boolean) || [];
          const mealTime = DEFAULT_MEAL_TIMES[mealType];
          const mealTimeDate = getMealTimeDate(mealTime);

          return (
            <div key={mealType} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-medium capitalize text-lg text-muted-foreground">
                  {mealType}
                </div>
                {mealData.participants.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div className="flex -space-x-2">
                      {mealData.participants.slice(0, 3).map((id) => (
                        <Avatar key={id} className="h-6 w-6 border-2 border-background">
                          <AvatarFallback className="text-xs">
                            {familyMembers[id]?.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {mealData.participants.length > 3 && (
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                          +{mealData.participants.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <MealCell
                    planId={planId}
                    day={dayOfWeek}
                    mealType={mealType}
                    mealData={mealData}
                    recipes={recipes}
                    onAddNew={() => onAddRecipe?.(dayOfWeek, mealType)}
                  />
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    No preparation time needed
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}