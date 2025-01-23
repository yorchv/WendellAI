import { useState } from "react";
import { useMealPlans } from "@/hooks/use-meal-plans";
import { useRecipes } from "@/hooks/use-recipes";
import { useFamilyMembers } from "@/hooks/use-family-members";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays, CalendarRange } from "lucide-react";
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
import { CalendarNavigation } from "@/components/meal-plan/CalendarNavigation";

type ViewMode = "daily" | "weekly";

export default function MealPlanner() {
  const [viewMode, setViewMode] = useState<ViewMode>("daily");
  const [selectedDay, setSelectedDay] = useState<DayType>(DAYS[0]);
  const [selectedMeal, setSelectedMeal] = useState<MealType>(MEAL_TYPES[0]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { createMealPlan, updateMealPlan, mealPlans } = useMealPlans();
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

  const navigate = (direction: "prev" | "next") => {
    if (viewMode === "weekly") {
      setSelectedDate(direction === "prev" ? subWeeks(selectedDate, 1) : addWeeks(selectedDate, 1));
    } else {
      setSelectedDate(direction === "prev" ? subDays(selectedDate, 1) : addDays(selectedDate, 1));
    }
  };

  const goToToday = () => {
    setSelectedDate(startOfToday());
    setViewMode("daily");
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 mb-4">
        <nav className="flex items-center space-x-2">
          <span className="text-muted-foreground">Home</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Meal Planner</span>
        </nav>
        <div className="flex justify-end">
          <CalendarNavigation
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          viewMode={viewMode}
          weekStart={weekStart}
          setViewMode={setViewMode}
          navigate={navigate}
          goToToday={goToToday}
        />
      </div>

      <div className="">
        {currentWeekPlan ? (
          <DndProvider backend={HTML5Backend}>
            {viewMode === "weekly" ? (
              <MealPlanTable
                planId={currentWeekPlan.id}
                weekStart={weekStart}
                weekEnd={weekEnd}
                days={currentWeekPlan.days}
                recipes={recipesLookup}
                familyMembers={familyMembersMap} // Added familyMembers prop
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
                days={currentWeekPlan.days}
                recipes={recipesLookup}
                familyMembers={familyMembersMap} // Added familyMembers prop
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