import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Users } from "lucide-react";
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

interface DetailedMealViewProps {
  day: DayType;
  mealType: MealType;
  recipeIds: number[];
  recipes: Record<number, Recipe>;
  onClose: () => void;
}

export function DetailedMealView({
  day,
  mealType,
  recipeIds,
  recipes,
  onClose,
}: DetailedMealViewProps) {
  const [, navigate] = useLocation();

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {day} {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
          </DialogTitle>
          <DialogDescription>
            All recipes planned for this meal
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 p-4">
            {recipeIds.map((id) => {
              const recipe = recipes[id];
              if (!recipe) return null;

              return (
                <Card key={id} className="cursor-pointer hover:bg-accent" onClick={() => navigate(`/recipes/${id}`)}>
                  <CardHeader>
                    <CardTitle className="text-lg">{recipe.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-4 text-sm text-muted-foreground">
                      {(recipe.prepTime || recipe.cookTime) && (
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          {recipe.prepTime && `${recipe.prepTime} min prep`}
                          {recipe.prepTime && recipe.cookTime && " + "}
                          {recipe.cookTime && `${recipe.cookTime} min cook`}
                        </div>
                      )}
                      {recipe.servings && (
                        <div className="flex items-center">
                          <Users className="mr-1 h-4 w-4" />
                          {recipe.servings} servings
                        </div>
                      )}
                    </div>
                    {recipe.description && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {recipe.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}