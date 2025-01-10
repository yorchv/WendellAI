import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import type { MealType, DayType } from "@db/schema";
import { MealCell } from "./MealCell";
import { DetailedMealView } from "./DetailedMealView";

interface Recipe {
  id: number;
  title: string;
  description?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
}

interface MealPlanTableProps {
  weekStart: Date;
  weekEnd: Date;
  meals: Array<{
    day: DayType;
    recipes: {
      [key in MealType]?: number[];
    };
  }>;
  recipes: Record<number, Recipe>;
}

export function MealPlanTable({ weekStart, weekEnd, meals, recipes }: MealPlanTableProps) {
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
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Meal Type</TableHead>
            {days.map((day) => (
              <TableHead key={day} className="min-w-[200px]">
                {day}
                <br />
                <span className="text-sm text-muted-foreground">
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
              <TableCell className="font-medium capitalize">{mealType}</TableCell>
              {days.map((day) => {
                const dayMeals = meals.find((m) => m.day === day);
                const recipeIds = dayMeals?.recipes[mealType] || [];

                return (
                  <TableCell key={`${day}-${mealType}`}>
                    <MealCell
                      recipeIds={recipeIds}
                      recipes={recipes}
                      onViewAll={() =>
                        setSelectedMeal({
                          day,
                          type: mealType,
                          recipeIds,
                        })
                      }
                    />
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>

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