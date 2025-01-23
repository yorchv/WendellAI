import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { MealType, DayType } from "@db/schema";
import { MealCell } from "./MealCell";
import { DetailedMealView } from "./DetailedMealView";
import { CalendarNavigationContainer } from "./CalendarNavigationContainer";
import { useState } from "react";
import { format } from "date-fns";
import { useCalendarNavigation } from "@/hooks/use-calendar-navigation";

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
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  viewMode: "daily" | "weekly";
  setViewMode: (mode: "daily" | "weekly") => void;
  navigate: (direction: "prev" | "next") => void;
  goToToday: () => void;
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
  onDropRecipe?: (day: DayType, mealType: MealType, recipeId: number) => void;
}

export function MealPlanTable({ 
  planId,   
  weekStart, 
  weekEnd, 
  days, 
  recipes,
  familyMembers,
  onAddRecipe,
  onDropRecipe 
}: Omit<MealPlanTableProps, 'selectedDate' | 'setSelectedDate' | 'viewMode' | 'setViewMode' | 'navigate' | 'goToToday'>) {
  const {
    selectedDate,
    setSelectedDate,
    viewMode,
    setViewMode,
    navigate,
    goToToday
  } = useCalendarNavigation();
  const [selectedMeal, setSelectedMeal] = useState<{
    day: DayType;
    type: MealType;
    recipeIds: number[];
  } | null>(null);

  const daysOfWeek: DayType[] = [
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
      <div className="flex justify-end mb-4">
        <CalendarNavigationContainer
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          viewMode={viewMode}
          weekStart={weekStart}
          setViewMode={setViewMode}
          navigate={navigate}
          goToToday={goToToday}
        />
      </div>
      <div className="overflow-hidden border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[14.28%] bg-muted">Meal</TableHead>
              {daysOfWeek.map((day) => (
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
                      new Date(weekStart.getTime() + daysOfWeek.indexOf(day) * 24 * 60 * 60 * 1000),
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
                {daysOfWeek.map((day) => {
                  const dayData = days.find(d => d.dayName === day);
                  const mealData = dayData?.meals[mealType];

                  return (
                    <TableCell 
                      key={`${day}-${mealType}`} 
                      className="p-2 align-top"
                    >
                      <MealCell
                        planId={planId}
                        day={day}
                        mealType={mealType}
                        mealData={dayData?.meals[mealType]}
                        recipes={recipes}
                        familyMembers={familyMembers}
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