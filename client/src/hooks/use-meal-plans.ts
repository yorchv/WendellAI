import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MealPlan } from "@db/schema";
import { format, startOfDay } from "date-fns";

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

  const updateMealPlan = useMutation({
    mutationFn: async (mealPlan: MealPlan) => {
      const response = await fetch(`/api/meal-plans/${mealPlan.id}`, {
        method: "PUT",
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

  const deleteMealPlan = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/meal-plans/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meal-plans"] });
    },
  });

  const getCurrentDayMealPlan = () => {
    if (!mealPlans) return null;

    const today = startOfDay(new Date());
    return mealPlans.find(
      (plan) => {
        const start = new Date(plan.weekStart);
        const end = new Date(plan.weekEnd);
        return today >= start && today <= end;
      }
    );
  };

  return {
    mealPlans,
    isLoading,
    createMealPlan: createMealPlan.mutateAsync,
    updateMealPlan: updateMealPlan.mutateAsync,
    deleteMealPlan: deleteMealPlan.mutateAsync,
    getCurrentDayMealPlan,
  };
}