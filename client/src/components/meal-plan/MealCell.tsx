import { Card, CardContent } from "@/components/ui/card";
import { Clock, Plus, Users } from "lucide-react";
import { useLocation } from "wouter";
import type { MealType, DayType } from "@/lib/meal-planner";

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
  meal?: {
    meals: Array<{
      mealType: MealType;
      recipes: number[];
      participants: number[];
    }>;
  };
  recipes: Record<number, Recipe>;
  familyMembers: Record<number, { id: number; name: string }>;
  onAddNew?: () => void;
}

export function MealCell({ planId, day, mealType, meal, recipes, familyMembers, onAddNew }: MealCellProps) {
  const [, navigate] = useLocation();
  const mealData = meal?.meals?.find(m => m.mealType === mealType) || meal?.[mealType];
  const recipeIds = mealData?.recipes || mealData?.recipeIds || [];
  const displayedRecipes = recipeIds.slice(0, 2);
  const remainingCount = recipeIds.length - displayedRecipes.length;
  const participants = mealData?.participants || [];

  const handleClick = () => {
    if (planId) {
      navigate(`/meal/${planId}/${day}/${mealType}`);
    }
  };

  return (
    <Card className="h-32">
      <CardContent className="p-4 h-full">
        {(mealData?.recipeIds?.length || 0) > 0 ? (
          <div 
            className="space-y-2 cursor-pointer hover:bg-accent/50 h-full"
            onClick={handleClick}
          >
            {displayedRecipes.map((id) => {
              const recipe = recipes[id];
              if (!recipe) return null;
              return (
                <div key={id} className="text-sm mb-1 last:mb-0">
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
                    <div className="flex items-center gap-1 group relative">
                      <Users className="h-3 w-3 flex-shrink-0" />
                      <span>{mealData?.participants?.length || 0}</span>
                      {(mealData?.participants?.length || 0) > 0 && (
                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-popover text-popover-foreground rounded-md shadow-md p-2 text-xs w-max">
                          {mealData.participants.slice(0, 5).map((id) => (
                            <div key={id}>{familyMembers?.[id]?.name || `User ${id}`}</div>
                          ))}
                          {mealData.participants.length > 5 && (
                            <div className="text-muted-foreground">+{mealData.participants.length - 5} more eaters in this meal</div>
                          )}
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