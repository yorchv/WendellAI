import { useState } from "react";
import { useMealPlans } from "@/hooks/use-meal-plans";
import { useRecipes } from "@/hooks/use-recipes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ChevronLeft, ChevronRight, CalendarDays, CalendarRange } from "lucide-react";
import { addWeeks, subWeeks, format, startOfToday } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RecipeSearchDialog } from "@/components/RecipeSearchDialog";
import { MealPlanTable } from "@/components/meal-plan/MealPlanTable";
import { DailyView } from "@/components/meal-plan/DailyView";
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

type ViewMode = "daily" | "weekly";

export default function MealPlanner() {
  const [viewMode, setViewMode] = useState<ViewMode>("weekly");
  const [selectedDay, setSelectedDay] = useState<DayType>(DAYS[0]);
  const [selectedMeal, setSelectedMeal] = useState<MealType>(MEAL_TYPES[0]);
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

  const handleRecipeSelection = async (day: DayType, mealType: MealType, recipeId: number) => {
    try {
      const mealsData = generateMealsData(DAYS, currentWeekPlan, day, mealType, recipeId);
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

  const goToToday = () => {
    setSelectedDate(startOfToday());
    setViewMode("daily");  // Switch to daily view when clicking Today
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
        <h1 className="text-3xl font-bold">Meal Planner</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2 mr-4">
            <Button
              variant={viewMode === "weekly" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("weekly")}
            >
              <CalendarRange className="h-4 w-4 mr-2" />
              Weekly
            </Button>
            <Button
              variant={viewMode === "daily" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("daily")}
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Daily
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className={viewMode === "daily" && format(selectedDate, "yyyy-MM-dd") === format(startOfToday(), "yyyy-MM-dd") ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
          >
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={() => navigateWeek("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                {viewMode === "weekly"
                  ? `Week of ${format(weekStart, "MMM d, yyyy")}`
                  : format(selectedDate, "MMM d, yyyy")
                }
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
              {viewMode === "weekly" ? (
                <MealPlanTable
                  planId={currentWeekPlan.id}
                  weekStart={weekStart}
                  weekEnd={weekEnd}
                  meals={currentWeekPlan.meals}
                  recipes={recipesLookup}
                  onAddRecipe={(day, mealType) => {
                    setSelectedDay(day);
                    setSelectedMeal(mealType);
                    setIsSearchOpen(true);
                  }}
                  onDropRecipe={handleRecipeSelection}
                />
              ) : (
                <DailyView
                  planId={currentWeekPlan.id}
                  date={selectedDate}
                  meals={currentWeekPlan.meals}
                  recipes={recipesLookup}
                  onAddRecipe={(day, mealType) => {
                    setSelectedDay(day);
                    setSelectedMeal(mealType);
                    setIsSearchOpen(true);
                  }}
                />
              )}
            </DndProvider>
          ) : (
            <div className="text-center py-8 space-y-4">
              <p className="text-muted-foreground">No meal plan exists for this week.</p>
              <Button
                onClick={() => createMealPlan({ weekStart, weekEnd, meals: [] })}
                className="gap-2"
              >
                <CalendarRange className="h-4 w-4" />
                Create Meal Plan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <RecipeSearchDialog
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        onSelectRecipe={(recipe) => handleRecipeSelection(selectedDay, selectedMeal, recipe.id)}
      />
    </div>
  );
}