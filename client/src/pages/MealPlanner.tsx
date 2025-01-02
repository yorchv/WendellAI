import { useState } from "react";
import { useRecipes } from "@/hooks/use-recipes";
import { useMealPlans } from "@/hooks/use-meal-plans";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RecipeCard } from "@/components/RecipeCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, addDays, startOfWeek } from "date-fns";
import { Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MEALS = ["breakfast", "lunch", "dinner"] as const;
type MealType = typeof MEALS[number];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
type DayType = typeof DAYS[number];

export default function MealPlanner() {
  const [selectedDay, setSelectedDay] = useState<DayType>(DAYS[0]);
  const [selectedMeal, setSelectedMeal] = useState<MealType>("breakfast");
  const { recipes, isLoading: recipesLoading } = useRecipes();
  const { createMealPlan } = useMealPlans();
  const { toast } = useToast();

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const [selectedMeals, setSelectedMeals] = useState<Record<DayType, Partial<Record<MealType, number>>>>({
    Monday: {},
    Tuesday: {},
    Wednesday: {},
    Thursday: {},
    Friday: {},
    Saturday: {},
    Sunday: {},
  });

  const handleSelectRecipe = async (recipeId: number) => {
    const updatedMeals = {
      ...selectedMeals,
      [selectedDay]: {
        ...selectedMeals[selectedDay],
        [selectedMeal]: recipeId,
      },
    };
    setSelectedMeals(updatedMeals);

    // Check if the week is complete
    const isWeekComplete = DAYS.every((day) =>
      MEALS.every((meal) => updatedMeals[day]?.[meal])
    );

    if (isWeekComplete) {
      try {
        await createMealPlan({
          weekStart: weekStart.toISOString(),
          weekEnd: addDays(weekStart, 6).toISOString(),
          meals: DAYS.map((day) => ({
            day,
            recipes: updatedMeals[day] as Record<MealType, number>,
          })),
        });

        toast({
          title: "Success",
          description: "Meal plan created successfully!",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create meal plan",
        });
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
        <h1 className="text-3xl font-bold">Meal Planner</h1>
        <div className="flex gap-4">
          <Select value={selectedDay} onValueChange={(value: DayType) => setSelectedDay(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              {DAYS.map((day) => (
                <SelectItem key={day} value={day}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedMeal} onValueChange={(value: MealType) => setSelectedMeal(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select meal" />
            </SelectTrigger>
            <SelectContent>
              {MEALS.map((meal) => (
                <SelectItem key={meal} value={meal}>
                  {meal.charAt(0).toUpperCase() + meal.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-4 text-sm font-medium">
            {DAYS.map((day) => (
              <div key={day} className="text-center">
                <div className="mb-2">{day}</div>
                <div className="space-y-2">
                  {MEALS.map((meal) => {
                    const recipeId = selectedMeals[day]?.[meal];
                    const recipe = recipes?.find((r) => r.id === recipeId);
                    return (
                      <div
                        key={meal}
                        className={`p-2 rounded-md ${
                          selectedDay === day && selectedMeal === meal
                            ? "bg-primary/10 ring-2 ring-primary"
                            : "bg-muted"
                        }`}
                      >
                        {recipe ? (
                          <div className="truncate">{recipe.title}</div>
                        ) : (
                          <Plus className="h-4 w-4 mx-auto text-muted-foreground" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <section>
        <h2 className="text-2xl font-bold mb-6">Select Recipe</h2>
        {recipesLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recipes?.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => handleSelectRecipe(recipe.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}