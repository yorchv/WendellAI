import { useState, useEffect } from "react";
import { useRecipes } from "@/hooks/use-recipes";
import { useMealPlans } from "@/hooks/use-meal-plans";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Recipe } from "@db/schema";
import { format, startOfWeek } from "date-fns";
import { Search } from "lucide-react";

type ShoppingItem = {
  name: string;
  checked: boolean;
  recipes: string[];
};

export default function ShoppingList() {
  const { mealPlans } = useMealPlans();
  const { recipes } = useRecipes();
  const [searchTerm, setSearchTerm] = useState("");
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);

  useEffect(() => {
    if (!mealPlans || !recipes) return;

    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const currentWeekPlan = mealPlans.find(
      (plan) => format(new Date(plan.weekStart), "yyyy-MM-dd") === format(weekStart, "yyyy-MM-dd")
    );

    if (!currentWeekPlan) return;

    // Get all recipe IDs from the meal plan
    const recipeIds = currentWeekPlan.meals.flatMap((meal) => 
      Object.values(meal.recipes)
    );

    // Get unique recipe IDs
    const uniqueRecipeIds = [...new Set(recipeIds)];

    // Get the actual recipes
    const weekRecipes = recipes.filter((recipe) => uniqueRecipeIds.includes(recipe.id));

    // Create shopping items from ingredients
    const ingredientMap = new Map<string, string[]>();
    weekRecipes.forEach((recipe) => {
      recipe.ingredients.forEach((ingredient) => {
        const existing = ingredientMap.get(ingredient) || [];
        ingredientMap.set(ingredient, [...existing, recipe.title]);
      });
    });

    const items: ShoppingItem[] = Array.from(ingredientMap.entries()).map(([name, recipes]) => ({
      name,
      checked: false,
      recipes,
    }));

    setShoppingItems(items);
  }, [mealPlans, recipes]);

  const toggleItem = (index: number) => {
    setShoppingItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const filteredItems = shoppingItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    // Sort by checked status first
    if (a.checked !== b.checked) {
      return a.checked ? 1 : -1;
    }
    // Then alphabetically
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-4">Shopping List</h1>
        <p className="text-muted-foreground">
          Items needed for your meal plan this week
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search ingredients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {sortedItems.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
              >
                <Checkbox
                  checked={item.checked}
                  onCheckedChange={() => toggleItem(index)}
                  className="mt-1"
                />
                <div className="flex-1 space-y-1">
                  <p className={item.checked ? "line-through text-muted-foreground" : ""}>
                    {item.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Used in: {item.recipes.join(", ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
