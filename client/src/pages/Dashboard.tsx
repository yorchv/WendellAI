import { useRecipes } from "@/hooks/use-recipes";
import { useMealPlans } from "@/hooks/use-meal-plans";
import { RecipeCard } from "@/components/RecipeCard";
import { MealPlanCard } from "@/components/MealPlanCard";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { Loader2, Plus } from "lucide-react";

export default function Dashboard() {
  const { recipes, isLoading: recipesLoading } = useRecipes();
  const { mealPlans, getCurrentDayMealPlan, isLoading: mealPlansLoading } = useMealPlans();
  const [, navigate] = useLocation();

  const todayMealPlan = getCurrentDayMealPlan();
  const todayDay = format(new Date(), "EEEE") as "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  const todayMeals = todayMealPlan?.meals.find(meal => meal.day === todayDay)?.recipes;

  return (
    <div className="space-y-8">
      {todayMealPlan && (
        <section>
          <h2 className="text-3xl font-bold tracking-tight mb-6">Today's Meals</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {["breakfast", "lunch", "dinner"].map((meal) => {
              const mealData = todayMeals?.[meal as keyof typeof todayMeals];
              const recipeIds = mealData?.recipeIds || [];
              const mealRecipes = recipes?.filter(r => recipeIds.includes(r.id));

              return (
                <div key={meal} className="rounded-lg border p-4">
                  <h3 className="font-medium capitalize mb-2">{meal}</h3>
                  {mealRecipes && mealRecipes.length > 0 ? (
                    <div>
                      {mealRecipes.map((recipe) => (
                        <div key={recipe.id}>
                          <p className="font-semibold">{recipe.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {recipe.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No meal planned</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Recent Recipes</h2>
          <Button onClick={() => navigate("/recipes")} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Recipe
          </Button>
        </div>

        {recipesLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes?.slice(0, 8).map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => navigate(`/recipes/${recipe.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Meal Plans</h2>
          <Button onClick={() => navigate("/meal-planner")} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Plan Meals
          </Button>
        </div>

        {mealPlansLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mealPlans?.slice(0, 3).map((mealPlan) => (
              <MealPlanCard
                key={mealPlan.id}
                mealPlan={mealPlan}
                onClick={() => navigate(`/meal-planner?week=${mealPlan.weekStart}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
