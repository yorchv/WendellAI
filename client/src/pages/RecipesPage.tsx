import { useLocation } from "wouter";
import { useRecipes } from "@/hooks/use-recipes";
import { RecipeCard } from "@/components/RecipeCard";
import { RecipeManager } from "@/components/RecipeManager";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function RecipesPage() {
  const { recipes, isLoading } = useRecipes();
  const [, navigate] = useLocation();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Recipes</h1>
        <RecipeManager mode="create" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recipes?.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={() => navigate(`/recipes/${recipe.id}`)}
            />
          ))}
          {recipes?.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground mb-4">You haven't created any recipes yet.</p>
              <RecipeManager mode="create" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
