import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { FamilyMember, FamilyMemberMealParticipation } from "@db/schema";

interface FamilyMemberWithParticipation extends FamilyMember {
  mealParticipations?: FamilyMemberMealParticipation[];
}

export function useFamilyMembers() {
  const queryClient = useQueryClient();

  const { data: familyMembers, isLoading } = useQuery<FamilyMemberWithParticipation[]>({
    queryKey: ["/api/family-members"],
  });

  const updateMealParticipation = useMutation({
    mutationFn: async ({ 
      familyMemberId, 
      defaultParticipation, 
      defaultMeals 
    }: {
      familyMemberId: number;
      defaultParticipation: boolean;
      defaultMeals?: string[];
    }) => {
      const response = await fetch(`/api/family-members/${familyMemberId}/meal-participation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultParticipation, defaultMeals }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/family-members"] });
    },
  });

  const getMealParticipation = async (familyMemberId: number) => {
    const response = await fetch(`/api/family-members/${familyMemberId}/meal-participation`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  };

  return {
    familyMembers,
    isLoading,
    updateMealParticipation: updateMealParticipation.mutateAsync,
    getMealParticipation,
  };
}
