import { useState, useEffect, useMemo } from "react";
import { useMealPlans } from "@/hooks/use-meal-plans";
import { useRecipes } from "@/hooks/use-recipes";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RecipeSearchDialog } from "@/components/RecipeSearchDialog";

const MEALS = ["breakfast", "lunch", "dinner"] as const;
type MealType = typeof MEALS[number];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
type DayType = typeof DAYS[number];

type DayMeals = {
  [key in MealType]?: number[];
};

type WeekMeals = {
  [key in DayType]: DayMeals;
};

const EMPTY_WEEK_MEALS: WeekMeals = {
  Monday: {},
  Tuesday: {},
  Wednesday: {},
  Thursday: {},
  Friday: {},
  Saturday: {},
  Sunday: {},
};

export default function MealPlanner() {
  const [selectedDay, setSelectedDay] = useState<DayType>(DAYS[0]);
  const [selectedMeal, setSelectedMeal] = useState<MealType>("breakfast");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { createMealPlan, updateMealPlan, mealPlans, deleteMealPlan } = useMealPlans();
  const { recipes } = useRecipes();
  const { toast } = useToast();

  const weekStart = useMemo(() => startOfWeek(selectedDate, { weekStartsOn: 1 }), [selectedDate]);
  const [selectedMeals, setSelectedMeals] = useState<WeekMeals>(EMPTY_WEEK_MEALS);

  // Load existing meal plan for the selected week
  useEffect(() => {
    const existingPlan = mealPlans?.find(
      (plan) => format(new Date(plan.weekStart), "yyyy-MM-dd") === format(weekStart, "yyyy-MM-dd")
    );

    if (existingPlan && existingPlan.meals) {
      const meals = existingPlan.meals.reduce((acc, meal) => ({
        ...acc,
        [meal.day]: meal.recipes || {},
      }), {...EMPTY_WEEK_MEALS});
      setSelectedMeals(meals);
    } else {
      setSelectedMeals(EMPTY_WEEK_MEALS);
    }
  }, [weekStart, mealPlans]);

  const handleSelectRecipe = async (recipeId: number) => {
    const updatedMeals = {
      ...selectedMeals,
      [selectedDay]: {
        ...selectedMeals[selectedDay],
        [selectedMeal]: selectedMeals[selectedDay]?.[selectedMeal] 
          ? [...selectedMeals[selectedDay][selectedMeal], recipeId]
          : [recipeId],
      },
    };
    setSelectedMeals(updatedMeals);

    try {
      // Format meals data for API
      const mealsData = DAYS.map((day) => ({
        day,
        recipes: {
          breakfast: updatedMeals[day].breakfast || [],
          lunch: updatedMeals[day].lunch || [],
          dinner: updatedMeals[day].dinner || [],
        },
      })).filter(meal => Object.values(meal.recipes).some(arr => arr.length > 0));

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

  const handleDeleteMeal = async (day: DayType, meal: MealType) => {
    try {
      const existingPlan = mealPlans?.find(
        (plan) => format(new Date(plan.weekStart), "yyyy-MM-dd") === format(weekStart, "yyyy-MM-dd")
      );

      if (!existingPlan) return;

      const updatedMeals = {
        ...selectedMeals,
        [day]: {
          ...selectedMeals[day],
        },
      };
      delete updatedMeals[day][meal];

      const mealsData = DAYS.map((d) => ({
        day: d,
        recipes: updatedMeals[d],
      }));

      await updateMealPlan({
        ...existingPlan,
        weekStart: weekStart,
        weekEnd: addDays(weekStart, 6),
        meals: mealsData,
      });

      setSelectedMeals(updatedMeals);
      toast({
        title: "Success",
        description: "Meal removed successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove meal",
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
                  {MEALS.map((meal) => {
                    const hasRecipe = selectedMeals[day]?.[meal] !== undefined;
                    return (
                      <div
                        key={meal}
                        className={`relative p-2 rounded-md cursor-pointer group transition-all ${
                          hasRecipe ? "bg-primary/10 hover:bg-primary/20" : "bg-muted hover:bg-muted/80"
                        }`}
                        onClick={() => {
                          setSelectedDay(day);
                          setSelectedMeal(meal);
                          setIsSearchOpen(true);
                        }}
                      >
                        <div className="truncate flex flex-col">
                          <div className="flex items-center justify-between">
                            <span className="capitalize">{meal}</span>
                            {hasRecipe ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 absolute right-1 -top-1 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteMeal(day, meal);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Plus className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          {hasRecipe && (
                            <span className="text-xs text-muted-foreground truncate">
                              {recipes
                                ? recipes.filter(r => {
                                    const recipesForMeal = selectedMeals[day][meal] || [];
                                    return Array.isArray(recipesForMeal) && recipesForMeal.includes(r.id);
                                  })
                                  .map(r => r.title)
                                  .join(', ')
                                : 'Loading...'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
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