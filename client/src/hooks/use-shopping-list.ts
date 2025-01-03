import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addDays, startOfDay, endOfDay } from "date-fns";
import { Recipe, Ingredient } from "@db/schema";
import { useToast } from "./use-toast";
import { useMealPlans } from "./use-meal-plans";
import { useRecipes } from "./use-recipes";

export type ShoppingItem = {
  id?: number;
  ingredientId: number;
  name: string;
  quantity?: number;
  unit?: string;
  checked: boolean;
  recipeIds: number[];
};

export type DateRange = {
  startDate: Date;
  endDate: Date;
};

const DEFAULT_DATE_RANGE = {
  startDate: startOfDay(new Date()),
  endDate: endOfDay(addDays(new Date(), 6)),
};

export function useShoppingList(dateRange: DateRange = DEFAULT_DATE_RANGE) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const queryClient = useQueryClient();
  const { mealPlans } = useMealPlans();
  const { recipes } = useRecipes();

  // Fetch ingredients
  const { data: ingredients } = useQuery({
    queryKey: ["/api/ingredients"],
    queryFn: async () => {
      const response = await fetch("/api/ingredients");
      if (!response.ok) throw new Error("Failed to fetch ingredients");
      return response.json();
    },
  });

  // Fetch shopping list items for date range
  const { data: persistedItems } = useQuery({
    queryKey: ["/api/shopping-list-items", dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      });
      const response = await fetch(`/api/shopping-list-items?${params}`);
      if (!response.ok) throw new Error("Failed to fetch items");
      return response.json();
    },
  });

  const updateItem = useMutation({
    mutationFn: async (item: ShoppingItem) => {
      if (!item.id) {
        const response = await fetch("/api/shopping-list-items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...item,
            startDate: dateRange.startDate.toISOString(),
            endDate: dateRange.endDate.toISOString(),
          }),
        });
        if (!response.ok) throw new Error("Failed to create item");
        return response.json();
      } else {
        const response = await fetch(`/api/shopping-list-items/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });
        if (!response.ok) throw new Error("Failed to update item");
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/shopping-list-items", dateRange.startDate, dateRange.endDate] 
      });
    },
  });

  useEffect(() => {
    if (!mealPlans || !recipes || !ingredients || !persistedItems) return;

    const relevantMealPlans = mealPlans.filter(plan => {
      const planStart = new Date(plan.weekStart);
      const planEnd = new Date(plan.weekEnd);
      return planStart <= dateRange.endDate && planEnd >= dateRange.startDate;
    });

    const recipeIds = new Set(
      relevantMealPlans
        .flatMap(plan => plan.meals || [])
        .flatMap(meal => Object.values(meal.recipes || {}))
        .filter(Boolean)
    );

    const relevantRecipes = recipes.filter(recipe => recipeIds.has(recipe.id));
    const ingredientMap = new Map<number, ShoppingItem>();

    // Process persisted items first
    persistedItems.forEach(item => {
      const ingredient = ingredients.find(ing => ing.id === item.ingredientId);
      if (ingredient) {
        ingredientMap.set(item.ingredientId, {
          id: item.id,
          ingredientId: item.ingredientId,
          name: ingredient.name,
          quantity: item.quantity,
          unit: item.unit,
          checked: item.checked,
          recipeIds: item.recipeIds || [],
        });
      }
    });

    // Add or update items from recipes
    relevantRecipes.forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
        const existingItem = ingredientMap.get(ingredient.ingredientId);
        if (existingItem) {
          existingItem.recipeIds = [...new Set([...existingItem.recipeIds, recipe.id])];
        } else {
          ingredientMap.set(ingredient.ingredientId, {
            ingredientId: ingredient.ingredientId,
            name: ingredients.find(ing => ing.id === ingredient.ingredientId)?.name || '',
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            checked: false,
            recipeIds: [recipe.id],
          });
        }
      });
    });

    setShoppingItems(Array.from(ingredientMap.values()));
  }, [mealPlans, recipes, ingredients, persistedItems, dateRange]);

  const toggleItem = (index: number) => {
    const item = shoppingItems[index];
    const newItems = [...shoppingItems];
    newItems[index] = { ...item, checked: !item.checked };
    setShoppingItems(newItems);

    updateItem.mutate(
      { ...item, checked: !item.checked },
      {
        onError: () => {
          const revertedItems = [...shoppingItems];
          revertedItems[index] = item;
          setShoppingItems(revertedItems);
          toast({
            title: "Error",
            description: "Failed to update item. Please try again.",
            variant: "destructive",
          });
        },
      },
    );
  };

  const filteredItems = shoppingItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()),
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
    isLoading: !mealPlans || !recipes || !ingredients,
    dateRange,
  };
}