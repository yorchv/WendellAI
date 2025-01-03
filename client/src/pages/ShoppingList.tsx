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
  quantity?: number;
};

export default function ShoppingList() {
  const { mealPlans } = useMealPlans();
  const { recipes } = useRecipes();
  const [searchTerm, setSearchTerm] = useState("");
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const queryClient = useQueryClient();

  const { data: persistedItems } = useQuery({
    queryKey: ['/api/shopping-list-items'],
    queryFn: async () => {
      const response = await fetch('/api/shopping-list-items');
      if (!response.ok) throw new Error('Failed to fetch items');
      return response.json();
    }
  });

  const updateItem = useMutation({
    mutationFn: async (item: ShoppingItem & { id?: number }) => {
      if (!item.id) {
        const response = await fetch('/api/shopping-list-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
        if (!response.ok) throw new Error('Failed to create item');
        return response.json();
      } else {
        const response = await fetch(`/api/shopping-list-items/${item.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
        if (!response.ok) throw new Error('Failed to update item');
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shopping-list-items'] });
    }
  });

  useEffect(() => {
    if (!mealPlans || !recipes) return;

    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const currentWeekPlan = mealPlans.find(
      (plan) => format(new Date(plan.weekStart), "yyyy-MM-dd") === format(weekStart, "yyyy-MM-dd")
    );

    if (!currentWeekPlan?.meals) return;

    // Get all recipe IDs from the meal plan
    const recipeIds = currentWeekPlan.meals.flatMap((meal) => 
      Object.values(meal.recipes || {})
    ).filter(Boolean);

    // Get unique recipe IDs
    const uniqueRecipeIds = Array.from(new Set(recipeIds));

    // Get the actual recipes
    const weekRecipes = recipes.filter((recipe) => uniqueRecipeIds.includes(recipe.id));

    // Create shopping items from ingredients with combination
    const ingredientMap = new Map<string, Set<string>>();
    weekRecipes.forEach((recipe) => {
      recipe.ingredients.forEach((ingredient) => {
        // Normalize ingredient name by trimming and converting to lowercase
        const normalizedName = ingredient.toLowerCase().trim();
        const existing = ingredientMap.get(normalizedName) || new Set<string>();
        existing.add(recipe.title);
        ingredientMap.set(normalizedName, existing);
      });
    });

    const items: ShoppingItem[] = Array.from(ingredientMap.entries()).map(([name, recipeTitles]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
      checked: false,
      recipes: Array.from(recipeTitles),
    }));

    setShoppingItems(items);
  }, [mealPlans, recipes]);

  const toggleItem = (index: number) => {
    const item = shoppingItems[index];
    updateItem.mutate({
      ...item,
      checked: !item.checked,
      weekStart: new Date(weekStart),
    });
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
                  <p className={`${item.checked ? "line-through text-muted-foreground" : ""}`}>
                    {item.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Used in: {item.recipes.join(", ")}
                  </p>
                </div>
              </div>
            ))}

            {sortedItems.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                {searchTerm ? "No matching ingredients found" : "No ingredients in your shopping list"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}