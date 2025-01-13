
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Plus } from "lucide-react";
import { useLocation } from "wouter";
import type { MealType, DayType } from "@db/schema";

interface Recipe {
  id: number;
  title: string;
  description?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
}

interface MealCellProps {
  planId: number | undefined;
  day: DayType;
  mealType: MealType;
  recipeIds: number[];
  recipes: Record<number, Recipe>;
  onAddNew?: () => void;
}

export function MealCell({ planId, day, mealType, recipeIds, recipes, onAddNew }: MealCellProps) {
  const [, navigate] = useLocation();
  const displayedRecipes = recipeIds.slice(0, 2);
  const remainingCount = recipeIds.length - displayedRecipes.length;

  const handleClick = () => {
    if (planId) {
      navigate(`/meal/${planId}/${day}/${mealType}`);
    }
  };

  return (
    <Card className="h-32">
      <CardContent className="p-4 h-full">
        {recipeIds.length > 0 ? (
          <div 
            className="space-y-2 cursor-pointer hover:bg-accent/50 h-full"
            onClick={handleClick}
          >
            {displayedRecipes.map((id) => {
              const recipe = recipes[id];
              if (!recipe) return null;
              return (
                <div key={id} className="text-sm">
                  <div className="font-medium">{recipe.title}</div>
                  {(recipe.prepTime || recipe.cookTime) && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {(recipe.prepTime || 0) + (recipe.cookTime || 0)} min
                    </div>
                  )}
                </div>
              );
            })}
            {remainingCount > 0 && (
              <div className="text-xs text-muted-foreground">
                +{remainingCount} more
              </div>
            )}
          </div>
        ) : (
          <div 
            className="h-full flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-accent/50 rounded-lg"
            onClick={onAddNew}
          >
            <Plus className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Add Recipe</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
