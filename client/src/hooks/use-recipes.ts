import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Recipe } from "@db/schema";

export function useRecipes() {
  const queryClient = useQueryClient();

  const { data: recipes, isLoading } = useQuery<Recipe[]>({
    queryKey: ["/api/recipes"],
  });

  const createRecipe = useMutation({
    mutationFn: async (recipe: Omit<Recipe, "id" | "userId" | "createdAt">) => {
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

  return {
    recipes,
    isLoading,
    createRecipe: createRecipe.mutateAsync,
  };
}
