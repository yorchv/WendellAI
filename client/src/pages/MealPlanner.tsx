import { useState } from "react";
import { useMealPlans } from "@/hooks/use-meal-plans";
import { useRecipes } from "@/hooks/use-recipes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addWeeks, subWeeks } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RecipeSearchDialog } from "@/components/RecipeSearchDialog";
import { MealPlanTable } from "@/components/meal-plan/MealPlanTable";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  DAYS,
  MEAL_TYPES,
  getWeekBoundaries,
  findCurrentWeekPlan,
  generateMealsData,
  type DayType,
  type MealType,
} from "@/lib/meal-planner";

export default function MealPlanner() {
  const [selectedDay, setSelectedDay] = useState<DayType>(DAYS[0]);
  const [selectedMeal, setSelectedMeal] = useState<MealType>("breakfast");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { createMealPlan, updateMealPlan, mealPlans } = useMealPlans();
  const { recipes } = useRecipes();
  const { toast } = useToast();

  const { weekStart, weekEnd } = getWeekBoundaries(selectedDate);
  const currentWeekPlan = findCurrentWeekPlan(mealPlans, weekStart);

  const recipesLookup = recipes?.reduce((acc, recipe) => ({
    ...acc,
    [recipe.id]: recipe
  }), {}) ?? {};

  const handleSelectRecipe = async (recipeId: number) => {
    try {
      const mealsData = generateMealsData(DAYS, currentWeekPlan, selectedDay, selectedMeal, recipeId);
      const mealPlanData = { weekStart, weekEnd, meals: mealsData };

      if (currentWeekPlan) {
        await updateMealPlan({ ...currentWeekPlan, ...mealPlanData });
      } else {
        await createMealPlan(mealPlanData);
      }

      setIsSearchOpen(false);
      toast({
        title: "Success",
        description: "Meal plan updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update meal plan",
      });
    }
  };

  const navigateWeek = (direction: "prev" | "next") => {
    setSelectedDate(direction === "prev" ? subWeeks(selectedDate, 1) : addWeeks(selectedDate, 1));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
        <h1 className="text-3xl font-bold">Meal Planner</h1>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigateWeek("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                Week of {format(weekStart, "MMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="icon" onClick={() => navigateWeek("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {currentWeekPlan ? (
            <DndProvider backend={HTML5Backend}>
              <MealPlanTable
                weekStart={weekStart}
                weekEnd={weekEnd}
                meals={currentWeekPlan.meals}
                recipes={recipesLookup}
                onAddRecipe={(day, mealType) => {
                  setSelectedDay(day);
                  setSelectedMeal(mealType);
                  setIsSearchOpen(true);
                }}
                onDropRecipe={handleSelectRecipe}
              />
            </DndProvider>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No meal plan for this week. Click on any slot to start planning.
            </div>
          )}
        </CardContent>
      </Card>

      <RecipeSearchDialog
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        onSelectRecipe={(recipe) => handleSelectRecipe(recipe.id)}
      />
    </div>
  );
}