import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MealPlan } from "@db/schema";
import { format } from "date-fns";
import { useRecipes } from "@/hooks/use-recipes";

interface MealPlanCardProps {
  mealPlan: MealPlan;
  onClick?: () => void;
}

export function MealPlanCard({ mealPlan, onClick }: MealPlanCardProps) {
  const { recipes } = useRecipes();

  const getMealCounts = (mealRecipes: number[]) => {
    if (!mealRecipes || !recipes) return 0;
    return mealRecipes.length;
  };

  const getRecipeNames = (recipeIds: number[]) => {
    if (!recipeIds || !recipes) return [];
    return recipeIds.map(id => recipes.find(r => r.id === id)?.title).filter(Boolean);
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle>
          Week of {format(new Date(mealPlan.weekStart), "MMM d, yyyy")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {mealPlan.meals?.map((meal) => {
            const breakfastCount = getMealCounts(meal.recipes.breakfast);
            const lunchCount = getMealCounts(meal.recipes.lunch);
            const dinnerCount = getMealCounts(meal.recipes.dinner);

            return (
              <div key={meal.day} className="space-y-1">
                <div className="font-medium">{meal.day}</div>
                <div className="pl-4 text-sm space-y-1">
                  {breakfastCount > 0 && (
                    <div>
                      <span className="font-medium">Breakfast:</span>{" "}
                      {getRecipeNames(meal.recipes.breakfast).join(", ")}
                    </div>
                  )}
                  {lunchCount > 0 && (
                    <div>
                      <span className="font-medium">Lunch:</span>{" "}
                      {getRecipeNames(meal.recipes.lunch).join(", ")}
                    </div>
                  )}
                  {dinnerCount > 0 && (
                    <div>
                      <span className="font-medium">Dinner:</span>{" "}
                      {getRecipeNames(meal.recipes.dinner).join(", ")}
                    </div>
                  )}
                  {breakfastCount === 0 && lunchCount === 0 && dinnerCount === 0 && (
                    <div className="text-muted-foreground">No meals planned</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}