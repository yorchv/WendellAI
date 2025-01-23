
import { Recipe, RecipeIngredient, Ingredient } from "@db/schema";
import { Clock, Users, ChefHat } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

interface RecipeWithIngredients extends Recipe {
  ingredients: (RecipeIngredient & {
    ingredient: Ingredient;
  })[];
}

interface RecipeDisplayProps {
  recipe: RecipeWithIngredients;
}

export function RecipeDisplay({ recipe }: RecipeDisplayProps) {
  const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);

  const toggleIngredient = (index: number) => {
    setCheckedIngredients(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-heading font-bold">{recipe.title}</h1>

        <div className="flex items-center gap-6 text-muted-foreground">
          {(recipe.prepTime || recipe.cookTime) && (
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>{(recipe.prepTime || 0) + (recipe.cookTime || 0)} min total</span>
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>{recipe.servings} servings</span>
            </div>
          )}
        </div>

        {recipe.description && (
          <p className="text-muted-foreground font-serif">{recipe.description}</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-heading font-semibold mb-4 flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              Ingredients
            </h2>
            <ul className="space-y-2 font-serif">
              {recipe.ingredients.map((ingredient, index) => (
                <li 
                  key={index} 
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => toggleIngredient(index)}
                >
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span className={`flex-1 ${checkedIngredients.includes(index) ? "line-through text-muted-foreground" : ""}`}>
                    {ingredient.quantity && (
                      <span className="font-medium">
                        {ingredient.quantity} {ingredient.unit || ''}{' '}
                      </span>
                    )}
                    {ingredient.ingredient.name}
                    {ingredient.notes && (
                      <span className="text-sm text-muted-foreground ml-2 italic">
                        ({ingredient.notes})
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-heading font-semibold mb-4">Instructions</h2>
            <ol className="space-y-4 font-serif">
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
  );
}
