import { Card, CardContent } from "@/components/ui/card";
import { Clock, Plus } from "lucide-react";
import { useLocation } from "wouter";
import type { MealType, DayType } from "@/lib/meal-planner";

interface Recipe {
  id: number;
  title: string;
  description?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  image?: string;
}

interface MealCellProps {
  planId: number | undefined;
  day: DayType;
  mealType: MealType;
  mealData?: {
    recipeIds: number[];
    participants: number[];
  };
  recipes: Record<number, Recipe>;
  onAddNew?: () => void;
}

export function MealCell({ planId, day, mealType, mealData, recipes, onAddNew }: MealCellProps) {
  const [, navigate] = useLocation();
  const recipeIds = mealData?.recipeIds || [];
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
                <div key={id} className="text-sm mb-1 last:mb-0 flex gap-2">
                  <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                    {recipe.image ? (
                      <img 
                        src={recipe.image} 
                        alt={recipe.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground text-xs">No img</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{recipe.title}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {(recipe.prepTime || recipe.cookTime) && (
                        <div className="flex items-center gap-1 truncate">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">
                            {(recipe.prepTime || 0) + (recipe.cookTime || 0)} min
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
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