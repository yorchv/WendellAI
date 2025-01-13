import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { format, addMinutes, differenceInMinutes } from "date-fns";
import type { MealType, DayType } from "@db/schema";
import { MealCell } from "./MealCell";
import { MEAL_TYPES } from "@/lib/meal-planner";
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
  meals: Array<{
    day: DayType;
    recipes: {
      [key in MealType]?: number[];
    };
  }>;
  recipes: Record<number, Recipe>;
  onAddRecipe?: (day: DayType, mealType: MealType) => void;
}

// Default meal times for timeline calculation
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

export function DailyView({ 
  planId, 
  date, 
  meals, 
  recipes,
  onAddRecipe 
}: DailyViewProps) {
  const dayOfWeek = format(date, 'EEEE') as DayType;
  const dayMeals = meals.find(m => m.day === dayOfWeek);

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
      <div className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Meal Type</TableHead>
              <TableHead className="w-[300px]">Recipes</TableHead>
              <TableHead className="min-w-[250px]">Preparation Timeline</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MEAL_TYPES.map((mealType) => {
              const recipeIds = dayMeals?.recipes[mealType] || [];
              const mealRecipes = recipeIds.map(id => recipes[id]).filter(Boolean);
              const totalPrepTime = calculateTotalPrepTime(mealRecipes);
              const mealTime = DEFAULT_MEAL_TIMES[mealType];
              const mealTimeDate = getMealTimeDate(mealTime);
              const startTime = totalPrepTime > 0 ? getSuggestedStartTime(mealTime, totalPrepTime) : null;
              const status = startTime ? getPreparationStatus(startTime, mealTimeDate) : null;
              const progress = startTime ? getTimelineProgress(startTime, mealTimeDate) : 0;

              return (
                <TableRow key={mealType}>
                  <TableCell className="font-medium capitalize">
                    {mealType}
                  </TableCell>
                  <TableCell>
                    <MealCell
                      planId={planId}
                      day={dayOfWeek}
                      mealType={mealType}
                      recipeIds={recipeIds}
                      recipes={recipes}
                      onAddNew={() => onAddRecipe?.(dayOfWeek, mealType)}
                    />
                  </TableCell>
                  <TableCell>
                    {totalPrepTime > 0 ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-2 h-4 w-4" />
                            {totalPrepTime} min prep time
                          </div>
                          {status && (
                            <div className={`text-sm flex items-center ${
                              status.variant === 'destructive' ? 'text-destructive' : 
                              status.variant === 'warning' ? 'text-orange-500' :
                              'text-muted-foreground'
                            }`}>
                              <AlertCircle className="mr-1 h-4 w-4" />
                              {status.status}
                            </div>
                          )}
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="grid grid-cols-2 text-sm">
                          <div>
                            <span className="font-medium">Start:</span>{' '}
                            {startTime && format(startTime, 'h:mm a')}
                          </div>
                          <div className="text-right">
                            <span className="font-medium">Ready by:</span>{' '}
                            {format(mealTimeDate, 'h:mm a')}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No preparation time needed
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}