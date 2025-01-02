import { useRecipes } from "@/hooks/use-recipes";
import { useMealPlans } from "@/hooks/use-meal-plans";
import { RecipeCard } from "@/components/RecipeCard";
import { MealPlanCard } from "@/components/MealPlanCard";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Loader2, Plus } from "lucide-react";

export default function Home() {
  const { recipes, isLoading: recipesLoading } = useRecipes();
  const { mealPlans, isLoading: mealPlansLoading } = useMealPlans();
  const [, navigate] = useLocation();

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Recent Recipes</h2>
          <Button onClick={() => navigate("/meal-planner")} className="flex items-center gap-2">
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

      <section className="py-12">
        <div className="relative rounded-xl overflow-hidden bg-primary/10 p-8">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl font-bold mb-4">Welcome to WendellAI</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Plan your meals, manage your recipes, and streamline your grocery shopping all in one place.
              Get started by adding your favorite recipes or creating a meal plan for the week.
            </p>
            <Button onClick={() => navigate("/meal-planner")} size="lg">
              Start Planning
            </Button>
          </div>
          <div
            className="absolute inset-0 z-0 opacity-10"
            style={{
              backgroundImage: `url(${
                "https://images.unsplash.com/photo-1490645935967-10de6ba17061"
              })`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </div>
      </section>
    </div>
  );
}