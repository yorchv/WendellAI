import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MealPlan, MealType } from "@db/schema";
import { format } from "date-fns";
import { useRecipes } from "@/hooks/use-recipes";

interface MealPlanCardProps {
  mealPlan: MealPlan;
  onClick?: () => void;
}

export function MealPlanCard({ mealPlan, onClick }: MealPlanCardProps) {
  const { recipes } = useRecipes();

  const getMealCounts = (mealRecipes: number[] = []) => {
    if (!recipes) return 0;
    return mealRecipes.length;
  };

  const getRecipeNames = (recipeIds: number[] = []) => {
    if (!recipes) return [];
    return recipeIds
      .map(id => recipes.find(r => r.id === id)?.title)
      .filter((title): title is string => title !== undefined);
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
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {mealPlan.meals?.map((meal) => {
              const breakfastCount = getMealCounts(meal.recipes.breakfast);
              const lunchCount = getMealCounts(meal.recipes.lunch);
              const dinnerCount = getMealCounts(meal.recipes.dinner);

              return (
                <div key={meal.day} className="space-y-2">
                  <div className="font-medium border-b pb-1">{meal.day}</div>
                  <div className="pl-4 text-sm space-y-2">
                    {breakfastCount > 0 && (
                      <div>
                        <div className="font-medium text-primary">Breakfast ({breakfastCount})</div>
                        <ul className="list-disc list-inside pl-2">
                          {getRecipeNames(meal.recipes.breakfast).map((name, idx) => (
                            <li key={idx} className="text-muted-foreground">{name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {lunchCount > 0 && (
                      <div>
                        <div className="font-medium text-primary">Lunch ({lunchCount})</div>
                        <ul className="list-disc list-inside pl-2">
                          {getRecipeNames(meal.recipes.lunch).map((name, idx) => (
                            <li key={idx} className="text-muted-foreground">{name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {dinnerCount > 0 && (
                      <div>
                        <div className="font-medium text-primary">Dinner ({dinnerCount})</div>
                        <ul className="list-disc list-inside pl-2">
                          {getRecipeNames(meal.recipes.dinner).map((name, idx) => (
                            <li key={idx} className="text-muted-foreground">{name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {breakfastCount === 0 && lunchCount === 0 && dinnerCount === 0 && (
                      <div className="text-muted-foreground italic">No meals planned</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}