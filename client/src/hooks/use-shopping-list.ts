import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addDays, startOfDay, endOfDay } from "date-fns";
import { useToast } from "./use-toast";
import { useMealPlans } from "./use-meal-plans";
import { useRecipes } from "./use-recipes";
import type { Ingredient } from "@db/schema";

export interface ShoppingListItemFromDB {
  id: number;
  ingredientId: number;
  userId: number;
  quantity?: number;
  unit?: string;
  checked: boolean;
  recipeIds: number[];
  startDate: string;
  endDate: string;
  ingredient: Ingredient;
}

export interface ShoppingItem {
  id: number;
  ingredientId: number;
  name: string;
  quantity?: number;
  unit?: string;
  checked: boolean;
  recipeIds: number[];
  startDate: Date;
  endDate: Date;
}

export type DateRange = {
  startDate: Date;
  endDate: Date;
};

const DEFAULT_DATE_RANGE = {
  startDate: startOfDay(new Date()),
  endDate: endOfDay(addDays(new Date(), 6)),
};

export function useShoppingList(initialDateRange: DateRange = DEFAULT_DATE_RANGE) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>(initialDateRange);
  const queryClient = useQueryClient();

  // Fetch shopping list items for date range
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["/api/shopping-list-items", dateRange.startDate.toISOString(), dateRange.endDate.toISOString()],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      });
      const response = await fetch(`/api/shopping-list-items?${params}`);
      if (!response.ok) throw new Error("Failed to fetch items");
      const dbItems: ShoppingListItemFromDB[] = await response.json();

      // Transform DB items to ShoppingItem format
      return dbItems.map((item): ShoppingItem => ({
        id: item.id,
        ingredientId: item.ingredientId,
        name: item.ingredient.name,
        quantity: item.quantity,
        unit: item.unit,
        checked: item.checked,
        recipeIds: item.recipeIds || [],
        startDate: new Date(item.startDate),
        endDate: new Date(item.endDate),
      }));
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
            startDate: item.startDate.toISOString(),
            endDate: item.endDate.toISOString(),
          }),
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to create item");
        return response.json();
      } else {
        const response = await fetch(`/api/shopping-list-items/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...item,
            startDate: item.startDate.toISOString(),
            endDate: item.endDate.toISOString(),
          }),
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to update item");
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/shopping-list-items", dateRange.startDate.toISOString(), dateRange.endDate.toISOString()] 
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update item",
        variant: "destructive",
      });
    },
  });

  const toggleItem = useCallback((index: number) => {
    const item = items[index];
    if (!item) return;

    const newItem = { ...item, checked: !item.checked };
    updateItem.mutate(newItem);
  }, [items, updateItem]);

  const updateDateRange = useCallback((newRange: DateRange) => {
    // Validate date range (0-30 days)
    const daysDiff = (newRange.endDate.getTime() - newRange.startDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 30 || daysDiff < 0) {
      toast({
        title: "Invalid Date Range",
        description: "Please select a date range between 0 and 30 days",
        variant: "destructive",
      });
      return;
    }
    setDateRange(newRange);
  }, [toast]);

  const filteredItems = items.filter((item: ShoppingItem) =>
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
    isLoading,
    dateRange,
    updateDateRange,
  };
}