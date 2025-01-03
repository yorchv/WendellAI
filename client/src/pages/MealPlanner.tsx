import { useState, useEffect, useMemo } from "react";
import { useMealPlans } from "@/hooks/use-meal-plans";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { format, addDays, startOfWeek, addWeeks, subWeeks } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RecipeSearchDialog } from "@/components/RecipeSearchDialog";
import { useRecipes } from "@/hooks/use-recipes";

const MEALS = ["breakfast", "lunch", "dinner"] as const;
type MealType = typeof MEALS[number];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
type DayType = typeof DAYS[number];

export default function MealPlanner() {
  const [selectedDay, setSelectedDay] = useState<DayType>(DAYS[0]);
  const [selectedMeal, setSelectedMeal] = useState<MealType>("breakfast");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { createMealPlan, updateMealPlan, mealPlans } = useMealPlans();
  const { recipes } = useRecipes();
  const { toast } = useToast();

  const weekStart = useMemo(() => startOfWeek(selectedDate, { weekStartsOn: 1 }), [selectedDate]);
  const [selectedMeals, setSelectedMeals] = useState<Record<DayType, Record<MealType, number[]>>>({
    Monday: { breakfast: [], lunch: [], dinner: [] },
    Tuesday: { breakfast: [], lunch: [], dinner: [] },
    Wednesday: { breakfast: [], lunch: [], dinner: [] },
    Thursday: { breakfast: [], lunch: [], dinner: [] },
    Friday: { breakfast: [], lunch: [], dinner: [] },
    Saturday: { breakfast: [], lunch: [], dinner: [] },
    Sunday: { breakfast: [], lunch: [], dinner: [] },
  });

  // Load existing meal plan for the selected week
  useEffect(() => {
    const existingPlan = mealPlans?.find(
      (plan) => format(new Date(plan.weekStart), "yyyy-MM-dd") === format(weekStart, "yyyy-MM-dd")
    );

    if (existingPlan) {
      const meals = existingPlan.meals?.reduce((acc, meal) => ({
        ...acc,
        [meal.day]: meal.recipes,
      }), {} as Record<DayType, Record<MealType, number[]>>);

      // Ensure all days and meals exist with arrays
      const completeSelectedMeals = DAYS.reduce((acc, day) => ({
        ...acc,
        [day]: {
          breakfast: meals?.[day]?.breakfast || [],
          lunch: meals?.[day]?.lunch || [],
          dinner: meals?.[day]?.dinner || [],
        },
      }), {} as Record<DayType, Record<MealType, number[]>>);

      setSelectedMeals(completeSelectedMeals);
    } else {
      // Reset to empty arrays for all meals
      setSelectedMeals({
        Monday: { breakfast: [], lunch: [], dinner: [] },
        Tuesday: { breakfast: [], lunch: [], dinner: [] },
        Wednesday: { breakfast: [], lunch: [], dinner: [] },
        Thursday: { breakfast: [], lunch: [], dinner: [] },
        Friday: { breakfast: [], lunch: [], dinner: [] },
        Saturday: { breakfast: [], lunch: [], dinner: [] },
        Sunday: { breakfast: [], lunch: [], dinner: [] },
      });
    }
  }, [weekStart, mealPlans]);

  const handleSelectRecipe = async (recipeId: number) => {
    const updatedMeals = {
      ...selectedMeals,
      [selectedDay]: {
        ...selectedMeals[selectedDay],
        [selectedMeal]: [...selectedMeals[selectedDay][selectedMeal], recipeId],
      },
    };
    setSelectedMeals(updatedMeals);

    try {
      // Format meals data for API
      const mealsData = DAYS.map((day) => ({
        day,
        recipes: updatedMeals[day],
      }));

      // Find existing plan or create new one
      const existingPlan = mealPlans?.find(
        (plan) => format(new Date(plan.weekStart), "yyyy-MM-dd") === format(weekStart, "yyyy-MM-dd")
      );

      const mealPlanData = {
        weekStart: weekStart,
        weekEnd: addDays(weekStart, 6),
        meals: mealsData,
      };

      if (existingPlan) {
        await updateMealPlan({
          ...existingPlan,
          ...mealPlanData,
        });
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

  const handleRemoveRecipe = async (day: DayType, meal: MealType, recipeId: number) => {
    try {
      const updatedMeals = {
        ...selectedMeals,
        [day]: {
          ...selectedMeals[day],
          [meal]: selectedMeals[day][meal].filter(id => id !== recipeId),
        },
      };

      const mealsData = DAYS.map((d) => ({
        day: d,
        recipes: updatedMeals[d],
      }));

      const existingPlan = mealPlans?.find(
        (plan) => format(new Date(plan.weekStart), "yyyy-MM-dd") === format(weekStart, "yyyy-MM-dd")
      );

      if (existingPlan) {
        await updateMealPlan({
          ...existingPlan,
          weekStart: weekStart,
          weekEnd: addDays(weekStart, 6),
          meals: mealsData,
        });
      }

      setSelectedMeals(updatedMeals);
      toast({
        title: "Success",
        description: "Recipe removed successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove recipe",
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
          <div className="grid grid-cols-7 gap-4 text-sm font-medium">
            {DAYS.map((day, index) => (
              <div key={day} className="text-center">
                <div className="mb-2">
                  <div className="text-muted-foreground text-xs">
                    {format(addDays(weekStart, index), "MMM d")}
                  </div>
                  <div>{day}</div>
                </div>
                <div className="space-y-2">
                  {MEALS.map((meal) => (
                    <div
                      key={meal}
                      className={`relative p-2 rounded-md cursor-pointer group ${
                        selectedDay === day && selectedMeal === meal
                          ? "bg-primary/10 ring-2 ring-primary"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                      onClick={() => {
                        setSelectedDay(day);
                        setSelectedMeal(meal);
                        setIsSearchOpen(true);
                      }}
                    >
                      <div className="space-y-1">
                        <div className="text-xs font-medium capitalize">{meal}</div>
                        {selectedMeals[day][meal].length > 0 ? (
                          <div className="space-y-1">
                            {selectedMeals[day][meal].map((recipeId) => {
                              const recipe = recipes?.find((r) => r.id === recipeId);
                              return recipe ? (
                                <div key={recipeId} className="flex items-center justify-between text-xs">
                                  <span className="truncate">{recipe.title}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 opacity-0 group-hover:opacity-100"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveRecipe(day, meal, recipeId);
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : null;
                            })}
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <Plus className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
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