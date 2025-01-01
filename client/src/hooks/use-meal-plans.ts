import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MealPlan } from "@db/schema";

export function useMealPlans() {
  const queryClient = useQueryClient();

  const { data: mealPlans, isLoading } = useQuery<MealPlan[]>({
    queryKey: ["/api/meal-plans"],
  });

  const createMealPlan = useMutation({
    mutationFn: async (mealPlan: Omit<MealPlan, "id" | "userId" | "createdAt">) => {
      const response = await fetch("/api/meal-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mealPlan),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meal-plans"] });
    },
  });

  return {
    mealPlans,
    isLoading,
    createMealPlan: createMealPlan.mutateAsync,
  };
}
