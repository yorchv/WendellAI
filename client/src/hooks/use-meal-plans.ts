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
    mutationFn: async ({ id, ...data }: MealPlan) => {
      const response = await fetch(`/api/meal-plans/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
    const currentPlan = mealPlans.find(
      (plan) => {
        const start = new Date(plan.weekStart);
        const end = new Date(plan.weekEnd);
        return today >= start && today <= end;
      }
    );

    if (!currentPlan) return null;

    return {
      ...currentPlan,
      days: currentPlan.days?.map(day => ({
        ...day,
        calendarDay: new Date(day.calendarDay).toISOString(),
        meals: Object.fromEntries(
          Object.entries(day.meals || {}).map(([key, value]) => [
            key,
            { recipeIds: value?.recipeIds || [], participants: value?.participants || [] }
          ])
        )
      }))
    };
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