import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import type { MealType, DayType } from "@db/schema";
import { MealCell } from "./MealCell";
import { MEAL_TYPES } from "@/lib/meal-planner";

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
              <TableHead className="w-[200px]">Meal Type</TableHead>
              <TableHead>Recipes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MEAL_TYPES.map((mealType) => (
              <TableRow key={mealType}>
                <TableCell className="font-medium capitalize">
                  {mealType}
                </TableCell>
                <TableCell>
                  <MealCell
                    planId={planId}
                    day={dayOfWeek}
                    mealType={mealType}
                    recipeIds={dayMeals?.recipes[mealType] || []}
                    recipes={recipes}
                    onAddNew={() => onAddRecipe?.(dayOfWeek, mealType)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}