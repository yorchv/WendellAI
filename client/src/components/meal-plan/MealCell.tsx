
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  planId: number;
  day: DayType;
  mealType: MealType;
  recipeIds: number[];
  recipes: Record<number, Recipe>;
  onAddNew: () => void;
}

export function MealCell({ planId, day, mealType, recipeIds, recipes, onAddNew }: MealCellProps) {
  const [, navigate] = useLocation();
  const displayedRecipes = recipeIds.slice(0, 2);

  if (recipeIds.length === 0) {
    return (
      <div 
        className="h-24 flex items-center justify-center text-muted-foreground cursor-pointer hover:bg-accent/50 rounded-lg"
        onClick={onAddNew}
      >
        No recipes planned
      </div>
    );
  }

  const handleClick = () => {
    navigate(`/meal/${planId}/${day}/${mealType}`);
  };

  return (
    <Card className="cursor-pointer hover:bg-accent/50" onClick={handleClick}>
      <CardContent className="p-4">
        <div className="space-y-2">
          {displayedRecipes.map((id) => {
            const recipe = recipes[id];
            if (!recipe) return null;

            return (
              <div key={id} className="text-sm">
                <span className="line-clamp-2 break-words">
                  {recipe.title.length > 20 ? `${recipe.title.slice(0, 20)}...` : recipe.title}
                </span>
              </div>
            );
          })}
          {recipeIds.length > 2 && (
            <div className="text-sm text-muted-foreground">
              +{recipeIds.length - 2} more recipes
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
