
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, Users } from "lucide-react";
import type { MealType, DayType } from "@db/schema";

interface Recipe {
  id: number;
  title: string;
  description?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
}

interface DetailedMealViewProps {
  day: DayType;
  mealType: MealType;
  recipeIds: number[];
  recipes: Record<number, Recipe>;
  onClose: () => void;
}

export function DetailedMealView({ day, mealType, recipeIds, recipes, onClose }: DetailedMealViewProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {day} {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {recipeIds.map((id) => {
            const recipe = recipes[id];
            if (!recipe) return null;

            return (
              <div key={id} className="p-4 border rounded-lg">
                <h3 className="font-semibold">{recipe.title}</h3>
                {recipe.description && (
                  <p className="text-sm text-muted-foreground mt-1">{recipe.description}</p>
                )}
                <div className="flex gap-4 mt-2">
                  {(recipe.prepTime || recipe.cookTime) && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {recipe.prepTime && <span>{recipe.prepTime} min prep</span>}
                      {recipe.prepTime && recipe.cookTime && <span>+</span>}
                      {recipe.cookTime && <span>{recipe.cookTime} min cook</span>}
                    </div>
                  )}
                  {recipe.servings && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>Serves {recipe.servings}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
