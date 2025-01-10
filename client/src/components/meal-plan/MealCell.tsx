import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";

interface Recipe {
  id: number;
  title: string;
  description?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
}

interface MealCellProps {
  recipeIds: number[];
  recipes: Record<number, Recipe>;
  onViewAll: () => void;
}

export function MealCell({ recipeIds, recipes, onViewAll }: MealCellProps) {
  const [, navigate] = useLocation();
  const displayedRecipes = recipeIds.slice(0, 2);
  const remainingCount = recipeIds.length - 2;

  if (recipeIds.length === 0) {
    return (
      <div className="h-24 flex items-center justify-center text-muted-foreground">
        No recipes planned
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-2">
          {displayedRecipes.map((id) => {
            const recipe = recipes[id];
            if (!recipe) return null;

            return (
              <Button
                key={id}
                variant="link"
                className="p-0 h-auto text-left justify-start hover:no-underline"
                onClick={() => navigate(`/recipes/${id}`)}
              >
                {recipe.title}
              </Button>
            );
          })}
          {remainingCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2"
              onClick={onViewAll}
            >
              +{remainingCount} more recipes
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}