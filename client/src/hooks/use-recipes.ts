import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Recipe, RecipeIngredient, Ingredient } from "@db/schema";
import { useToast } from "@/hooks/use-toast";

interface RecipeWithIngredients extends Recipe {
  ingredients: (RecipeIngredient & {
    ingredient: Ingredient;
  })[];
}

export function useRecipes() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: recipes, isLoading } = useQuery<RecipeWithIngredients[]>({
    queryKey: ["/api/recipes"],
  });

  const createRecipe = useMutation({
    mutationFn: async (recipe: Omit<Recipe, "id" | "userId" | "createdAt"> & {
      ingredients: {
        name: string;
        quantity?: number | null;
        unit?: string | null;
        notes?: string | null;
      }[];
    }) => {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipe),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
    },
  });

  const updateRecipe = useMutation({
    mutationFn: async (params: { 
      id: number;
      recipe: Partial<Recipe> & {
        ingredients?: {
          name: string;
          quantity?: number | null;
          unit?: string | null;
          notes?: string | null;
        }[];
      }
    }) => {
      const response = await fetch(`/api/recipes/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params.recipe),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
    },
  });

  const deleteRecipe = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/recipes/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
    },
  });

  return {
    recipes,
    isLoading,
    createRecipe: createRecipe.mutateAsync,
    updateRecipe: (id: number, recipe: Parameters<typeof updateRecipe.mutateAsync>[0]["recipe"]) => 
      updateRecipe.mutateAsync({ id, recipe }),
    deleteRecipe: deleteRecipe.mutateAsync,
  };
}