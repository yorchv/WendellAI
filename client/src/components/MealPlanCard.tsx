import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MealPlan } from "@db/schema";
import { format } from "date-fns";

interface MealPlanCardProps {
  mealPlan: MealPlan;
  onClick?: () => void;
}

export function MealPlanCard({ mealPlan, onClick }: MealPlanCardProps) {
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
          {mealPlan.meals.map((meal) => (
            <div key={meal.day} className="flex justify-between text-sm">
              <span className="font-medium">{meal.day}</span>
              <span className="text-muted-foreground">
                {meal.recipes.breakfast && "Breakfast"} 
                {meal.recipes.lunch && "• Lunch"} 
                {meal.recipes.dinner && "• Dinner"}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
