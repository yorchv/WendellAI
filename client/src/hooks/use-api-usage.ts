
import { useQuery } from "@tanstack/react-query";

export function useApiUsage() {
  return useQuery({
    queryKey: ["api-usage"],
    queryFn: async () => {
      const res = await fetch("/api/tools/usage");
      if (!res.ok) throw new Error("Failed to fetch API usage");
      return res.json();
    },
    refetchInterval: 60000, // Refetch every minute
  });
}
