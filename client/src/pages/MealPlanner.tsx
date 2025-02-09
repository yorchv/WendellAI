import { useEffect, useState } from "react";
import { useSearchParams } from "wouter";
import { useMealPlans } from "@/hooks/use-meal-plans";

import { useRecipes } from "@/hooks/use-recipes";
import { useFamilyMembers } from "@/hooks/use-family-members";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays, CalendarRange } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { addWeeks, subWeeks, format, startOfToday, subDays, addDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  DAYS,
  MEAL_TYPES,
  getWeekBoundaries,
  findCurrentWeekPlan,
  generateMealsData,
  type DayType,
  type MealType,
} from "@/lib/meal-planner";
import { RecipeSearchDialog } from "@/components/RecipeSearchDialog";
import { MealPlanTable } from "@/components/meal-plan/MealPlanTable";
import { DailyView } from "@/components/meal-plan/DailyView";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
// import { CalendarNavigationContainer } from "@/components/meal-plan/CalendarNavigationContainer"; // Import the new component


type ViewMode = "daily" | "weekly";

export default function MealPlanner() {
  const [searchParams] = useSearchParams();
  const [selectedDay, setSelectedDay] = useState<DayType>(DAYS[0]);
  const [selectedMeal, setSelectedMeal] = useState<MealType>(MEAL_TYPES[0]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(searchParams.get("view") === "weekly" ? "weekly" : "daily");
  const [selectedDate, setSelectedDate] = useState<Date>(searchParams.get("date") ? new Date(searchParams.get("date")!) : new Date());
  const { createMealPlan, updateMealPlan, mealPlans, isLoading } = useMealPlans();
  const { recipes } = useRecipes();
  const { familyMembers } = useFamilyMembers();
  const { toast } = useToast();

  const { weekStart, weekEnd } = getWeekBoundaries(selectedDate);
  const currentWeekPlan = findCurrentWeekPlan(mealPlans, weekStart);

  const recipesLookup = recipes?.reduce((acc, recipe) => ({
    ...acc,
    [recipe.id]: recipe
  }), {}) ?? {};

  const familyMembersMap = familyMembers?.reduce((map, member) => ({...map, [member.id]: member}), {}) ?? {};

  const handleRecipeSelection = async (day: DayType, mealType: MealType, recipeId: number) => {
    try {
      const updatedDays = currentWeekPlan?.days?.map(d => {
        if (d.dayName !== day) return d;

        const currentMeal = d.meals?.[mealType] || { recipeIds: [], participants: [] };
        return {
          ...d,
          meals: {
            ...d.meals,
            [mealType]: {
              recipeIds: [...(currentMeal.recipeIds || []), recipeId],
              participants: currentMeal.participants || []
            }
          }
        };
      }) || [];

      const mealPlanData = {
        weekStart,
        weekEnd,
        days: updatedDays.length ? updatedDays : initializeMealPlanDays(weekStart)
      };

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

  

  const createEmptyMealPlan = async () => {
    try {
      await createMealPlan({
        weekStart,
        weekEnd,
        meals: DAYS.map(day => ({
          day,
          recipes: Object.fromEntries(
            MEAL_TYPES.map(type => [
              type,
              { recipeIds: [], participants: [] }
            ])
          )
        }))
      });

      toast({
        title: "Success",
        description: "Empty meal plan created successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create meal plan",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4 border-b pb-4 mb-4">
        <nav className="flex items-center space-x-2">
          <span className="text-muted-foreground">Home</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Meal Planner</span>
        </nav>
        {/* Removed CalendarNavigationContainer from here */}
      </div>

      <div className="">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Loading meal plan...</p>
          </div>
        ) : currentWeekPlan ? (
          <DndProvider backend={HTML5Backend}>
            {searchParams.get("view") === "weekly" ? (
              <MealPlanTable
                planId={currentWeekPlan.id}
                weekStart={weekStart}
                weekEnd={weekEnd}
                days={currentWeekPlan.days}
                recipes={recipesLookup}
                familyMembers={familyMembersMap}
                onAddRecipe={(day, mealType) => {
                  setSelectedDay(day);
                  setSelectedMeal(mealType);
                  setIsSearchOpen(true);
                }}
                onDropRecipe={handleRecipeSelection}
                viewMode={viewMode}
                setViewMode={setViewMode}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
            ) : (
              <DailyView
                planId={currentWeekPlan.id}
                days={currentWeekPlan.days}
                recipes={recipesLookup}
                familyMembers={familyMembersMap}
                weekStart={weekStart}
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
              onClick={createEmptyMealPlan}
              className="gap-2"
            >
              <CalendarRange className="h-4 w-4" />
              Create Meal Plan
            </Button>
          </div>
        )}
      </div>

      <RecipeSearchDialog
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        onSelectRecipe={(recipe) => handleRecipeSelection(selectedDay, selectedMeal, recipe.id)}
      />
    </div>
  );
}