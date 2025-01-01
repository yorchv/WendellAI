import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Recipe } from "@db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Users, ChefHat, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function RecipeView() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/recipes/:id");
  const recipeId = params?.id;

  const { data: recipe, isLoading } = useQuery<Recipe>({
    queryKey: [`/api/recipes/${recipeId}`],
    enabled: !!recipeId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="text-center py-8">
        <p>Recipe not found</p>
        <Button variant="link" onClick={() => navigate("/")}>
          Go back home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to recipes
      </Button>

      <div className="space-y-8">
        {recipe.image && (
          <div className="relative h-64 md:h-96 rounded-xl overflow-hidden">
            <img
              src={recipe.image}
              alt={recipe.title}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        <div className="space-y-4">
          <h1 className="text-4xl font-bold">{recipe.title}</h1>
          
          <div className="flex items-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>
                {recipe.prepTime + recipe.cookTime} min total
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>{recipe.servings} servings</span>
            </div>
          </div>

          {recipe.description && (
            <p className="text-muted-foreground">{recipe.description}</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                Ingredients
              </h2>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    {ingredient}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Instructions</h2>
              <ol className="space-y-4">
                {recipe.instructions.map((step, index) => (
                  <li key={index} className="flex gap-4">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
