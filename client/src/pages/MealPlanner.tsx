import { useState, useEffect } from "react";
import { useMealPlans } from "@/hooks/use-meal-plans";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { format, addDays, startOfWeek, addWeeks, subWeeks } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RecipeSearchDialog } from "@/components/RecipeSearchDialog";

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
  const { toast } = useToast();

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const [selectedMeals, setSelectedMeals] = useState<Record<DayType, Partial<Record<MealType, number>>>>({
    Monday: {},
    Tuesday: {},
    Wednesday: {},
    Thursday: {},
    Friday: {},
    Saturday: {},
    Sunday: {},
  });

  // Load existing meal plan for the selected week
  useEffect(() => {
    const existingPlan = mealPlans?.find(
      (plan) => format(new Date(plan.weekStart), "yyyy-MM-dd") === format(weekStart, "yyyy-MM-dd")
    );

    if (existingPlan) {
      const meals = existingPlan.meals.reduce((acc, meal) => ({
        ...acc,
        [meal.day]: meal.recipes
      }), {} as Record<DayType, Record<MealType, number>>);
      setSelectedMeals(meals);
    } else {
      setSelectedMeals({
        Monday: {},
        Tuesday: {},
        Wednesday: {},
        Thursday: {},
        Friday: {},
        Saturday: {},
        Sunday: {},
      });
    }
  }, [weekStart, mealPlans]);

  const handleSelectRecipe = async (recipeId: number) => {
    const updatedMeals = {
      ...selectedMeals,
      [selectedDay]: {
        ...selectedMeals[selectedDay],
        [selectedMeal]: recipeId,
      },
    };
    setSelectedMeals(updatedMeals);

    // Find existing plan or create new one
    const existingPlan = mealPlans?.find(
      (plan) => format(new Date(plan.weekStart), "yyyy-MM-dd") === format(weekStart, "yyyy-MM-dd")
    );

    try {
      const mealPlanData = {
        weekStart: weekStart.toISOString(),
        weekEnd: addDays(weekStart, 6).toISOString(),
        meals: DAYS.map((day) => ({
          day,
          recipes: updatedMeals[day] as Record<MealType, number>,
        })),
      };

      if (existingPlan) {
        await updateMealPlan({ ...existingPlan, ...mealPlanData });
      } else {
        await createMealPlan(mealPlanData);
      }

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
                    const recipeId = selectedMeals[day]?.[meal];
                    return (
                      <div
                        key={meal}
                        className={`p-2 rounded-md cursor-pointer ${
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
                        <div className="truncate">
                          {recipeId ? (
                            "Recipe Selected"
                          ) : (
                            <Plus className="h-4 w-4 mx-auto text-muted-foreground" />
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