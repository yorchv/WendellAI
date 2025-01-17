
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { MealType, DayType } from "@db/schema";
import { MealCell } from "./MealCell";
import { DetailedMealView } from "./DetailedMealView";
import { useState } from "react";
import { format } from "date-fns";

interface Recipe {
  id: number;
  title: string;
  description?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
}

interface MealPlanTableProps {
  planId: number | undefined;
  weekStart: Date;
  weekEnd: Date;
  meals: {
    [key: string]: {
      [key in MealType]?: {
        recipeIds: number[];
        participants: number[];
      };
    };
  };
  recipes: Record<number, Recipe>;
  onAddRecipe?: (day: DayType, mealType: MealType) => void;
  onDropRecipe?: (day: DayType, mealType: MealType, recipeId: number) => void;
}

export function MealPlanTable({ 
  planId,   
  weekStart, 
  weekEnd, 
  meals, 
  recipes,
  onAddRecipe,
  onDropRecipe 
}: MealPlanTableProps) {
  const [selectedMeal, setSelectedMeal] = useState<{
    day: DayType;
    type: MealType;
    recipeIds: number[];
  } | null>(null);

  const days: DayType[] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const mealTypes: MealType[] = ["breakfast", "lunch", "dinner"];

  return (
    <div className="w-full">
      <div className="overflow-hidden border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[14.28%] bg-muted">Meal</TableHead>
              {days.map((day) => (
                <TableHead 
                  key={day} 
                  className={`w-[14.28%] text-center bg-muted ${
                    day === format(new Date(), 'EEEE') ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  {day}
                  <br />
                  <span className="text-xs text-muted-foreground">
                    {format(
                      new Date(weekStart.getTime() + days.indexOf(day) * 24 * 60 * 60 * 1000),
                      "MMM d"
                    )}
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {mealTypes.map((mealType) => (
              <TableRow key={mealType}>
                <TableCell className="font-medium capitalize bg-muted/50">{mealType}</TableCell>
                {days.map((day) => {
                  const mealData = meals[day]?.[mealType];

                  return (
                    <TableCell 
                      key={`${day}-${mealType}`} 
                      className="p-2 align-top"
                    >
                      <MealCell
                        planId={planId}
                        day={day}
                        mealType={mealType}
                        meal={mealData}
                        recipes={recipes}
                        onAddNew={() => onAddRecipe?.(day, mealType)}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedMeal && (
        <DetailedMealView
          day={selectedMeal.day}
          mealType={selectedMeal.type}
          recipeIds={selectedMeal.recipeIds}
          recipes={recipes}
          onClose={() => setSelectedMeal(null)}
        />
      )}
    </div>
  );
}
