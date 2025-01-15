import { Card } from "@/components/ui/card";
import { format, addMinutes, differenceInMinutes } from "date-fns";
import type { MealType, DayType } from "@db/schema";
import { MealCell } from "./MealCell";
import { Clock, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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
  meals: {
    day: DayType;
    recipes: {
      [key in MealType]?: {
        recipeIds: number[];
        participants: number[];
      };
    };
  }[];
  recipes: Record<number, Recipe>;
  familyMembers: Record<number, { id: number; name: string }>; // Added familyMembers prop
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

export function DailyView({ planId, date, meals, recipes, familyMembers, onAddRecipe }: DailyViewProps) {
  const dayOfWeek = format(date, 'EEEE') as DayType;

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
          const mealData = meals.find(m => m.day === dayOfWeek)?.recipes[mealType] || { recipeIds: [], participants: [] };
          const mealRecipes = mealData.recipeIds?.map(id => recipes[id]).filter(Boolean) || [];
          const totalPrepTime = calculateTotalPrepTime(mealRecipes);
          const mealTime = DEFAULT_MEAL_TIMES[mealType];
          const mealTimeDate = getMealTimeDate(mealTime);
          const startTime = totalPrepTime > 0 ? getSuggestedStartTime(mealTime, totalPrepTime) : null;
          const status = startTime ? getPreparationStatus(startTime, mealTimeDate) : null;
          const progress = startTime ? getTimelineProgress(startTime, mealTimeDate) : 0;

          return (
            <div key={mealType} className="p-4 space-y-3">
              <div className="font-medium capitalize text-lg text-muted-foreground">
                {mealType}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <MealCell
                    planId={planId}
                    day={dayOfWeek}
                    mealType={mealType}
                    meal={mealData}
                    recipes={recipes}
                    familyMembers={familyMembers}
                    onAddNew={() => onAddRecipe?.(dayOfWeek, mealType)}
                  />
                </div>
                <div>
                  {totalPrepTime > 0 ? (
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <div className="flex items-center text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                          <Clock className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                          {totalPrepTime}m
                        </div>
                        {status && (
                          <div className={`text-xs sm:text-sm flex items-center whitespace-nowrap ${
                            status.variant === 'destructive' ? 'text-destructive' : 
                            status.variant === 'warning' ? 'text-orange-500' :
                            'text-muted-foreground'
                          }`}>
                            <AlertCircle className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                            {status.status}
                          </div>
                        )}
                      </div>
                      <Progress value={progress} className="h-1.5 sm:h-2" />
                      <div className="flex justify-between text-xs sm:text-sm">
                        <div className="whitespace-nowrap">
                          {startTime && format(startTime, 'h:mm a')}
                        </div>
                        <div className="whitespace-nowrap">
                          {format(mealTimeDate, 'h:mm a')}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No preparation time needed
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}