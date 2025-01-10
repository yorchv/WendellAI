
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Users, Plus, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { RecipeSearchDialog } from "@/components/RecipeSearchDialog";
import { useState } from "react";
import { useMealPlans } from "@/hooks/use-meal-plans";
import { useRecipes } from "@/hooks/use-recipes";
import type { MealType, DayType } from "@db/schema";

export default function MealView() {
  const [, navigate] = useLocation();
  const params = useParams();
  const { mealPlans, updateMealPlan } = useMealPlans();
  const { recipes } = useRecipes();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const planId = parseInt(params.planId ?? "0");
  const day = params.day as DayType;
  const mealType = params.type as MealType;
  
  const plan = mealPlans?.find(p => p.id === planId);
  const dayMeal = plan?.meals.find(m => m.day === day);
  const recipeIds = dayMeal?.recipes[mealType] ?? [];
  const date = plan ? new Date(plan.weekStart) : new Date();
  date.setDate(date.getDate() + ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].indexOf(day));

  const handleRemoveRecipe = async (recipeId: number) => {
    if (!plan) return;
    const updatedMeals = plan.meals.map(meal => {
      if (meal.day === day) {
        return {
          ...meal,
          recipes: {
            ...meal.recipes,
            [mealType]: meal.recipes[mealType]?.filter(id => id !== recipeId) ?? []
          }
        };
      }
      return meal;
    });
    await updateMealPlan({ ...plan, meals: updatedMeals });
  };

  const handleAddRecipe = async (recipe: { id: number }) => {
    if (!plan) return;
    const updatedMeals = plan.meals.map(meal => {
      if (meal.day === day) {
        return {
          ...meal,
          recipes: {
            ...meal.recipes,
            [mealType]: [...(meal.recipes[mealType] ?? []), recipe.id]
          }
        };
      }
      return meal;
    });
    await updateMealPlan({ ...plan, meals: updatedMeals });
    setIsSearchOpen(false);
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate("/meal-planner")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Meal Planner
        </Button>
        <h1 className="text-3xl font-bold">
          {day} {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
        </h1>
        <p className="text-muted-foreground">{format(date, "MMMM d, yyyy")}</p>
      </div>

      <div className="space-y-4">
        {recipeIds.map((id) => (
          <Card key={id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg cursor-pointer" onClick={() => navigate(`/recipes/${id}`)}>
                {recipes[id]?.title}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => handleRemoveRecipe(id)}>
                Remove
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 text-sm text-muted-foreground">
                {(recipes[id]?.prepTime || recipes[id]?.cookTime) && (
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    {recipes[id]?.prepTime && `${recipes[id].prepTime} min prep`}
                    {recipes[id]?.prepTime && recipes[id]?.cookTime && " + "}
                    {recipes[id]?.cookTime && `${recipes[id].cookTime} min cook`}
                  </div>
                )}
                {recipes[id]?.servings && (
                  <div className="flex items-center">
                    <Users className="mr-1 h-4 w-4" />
                    {recipes[id].servings} servings
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        <Button onClick={() => setIsSearchOpen(true)} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Recipe
        </Button>
      </div>

      <RecipeSearchDialog
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        onSelectRecipe={handleAddRecipe}
      />
    </div>
  );
}
