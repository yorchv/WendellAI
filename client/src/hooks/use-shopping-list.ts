
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfWeek } from "date-fns";
import { Recipe } from "@db/schema";
import { useMealPlans } from "./use-meal-plans";
import { useRecipes } from "./use-recipes";

export type ShoppingItem = {
  id?: number;
  name: string;
  checked: boolean;
  recipes: string[];
  quantity?: number;
};

export function useShoppingList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const queryClient = useQueryClient();
  const { mealPlans } = useMealPlans();
  const { recipes } = useRecipes();

  const { data: persistedItems } = useQuery({
    queryKey: ['/api/shopping-list-items'],
    queryFn: async () => {
      const response = await fetch('/api/shopping-list-items');
      if (!response.ok) throw new Error('Failed to fetch items');
      return response.json();
    }
  });

  const updateItem = useMutation({
    mutationFn: async (item: ShoppingItem) => {
      if (!item.id) {
        const response = await fetch('/api/shopping-list-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...item,
            weekStart: startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString(),
          }),
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
    if (!mealPlans || !recipes || !persistedItems) return;

    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const currentWeekPlan = mealPlans.find(
      (plan) => format(new Date(plan.weekStart), "yyyy-MM-dd") === format(weekStart, "yyyy-MM-dd")
    );

    if (!currentWeekPlan?.meals) return;

    const recipeIds = currentWeekPlan.meals.flatMap((meal) => 
      Object.values(meal.recipes || {})
    ).filter(Boolean);

    const uniqueRecipeIds = Array.from(new Set(recipeIds));
    const weekRecipes = recipes.filter((recipe) => uniqueRecipeIds.includes(recipe.id));
    const ingredientMap = new Map<string, Set<string>>();

    weekRecipes.forEach((recipe) => {
      recipe.ingredients.forEach((ingredient) => {
        const normalizedName = ingredient.toLowerCase().trim();
        const existing = ingredientMap.get(normalizedName) || new Set<string>();
        existing.add(recipe.title);
        ingredientMap.set(normalizedName, existing);
      });
    });

    const items: ShoppingItem[] = Array.from(ingredientMap.entries()).map(([name, recipeTitles]) => {
      const persistedItem = persistedItems.find(
        item => item.name.toLowerCase().trim() === name
      );
      return {
        id: persistedItem?.id,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        checked: persistedItem?.checked || false,
        recipes: Array.from(recipeTitles),
      };
    });

    setShoppingItems(items);
  }, [mealPlans, recipes]);

  const toggleItem = (index: number) => {
    const item = shoppingItems[index];
    updateItem.mutate({
      ...item,
      checked: !item.checked,
    });
  };

  const filteredItems = shoppingItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (a.checked !== b.checked) {
      return a.checked ? 1 : -1;
    }
    return a.name.localeCompare(b.name);
  });

  return {
    searchTerm,
    setSearchTerm,
    sortedItems,
    toggleItem,
    isLoading: !mealPlans || !recipes,
  };
}
