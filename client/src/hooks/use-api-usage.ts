
import { useQuery } from "@tanstack/react-query";

export function useApiUsage(endpoint: string) {
  return useQuery({
    queryKey: ["api-usage", endpoint],
    queryFn: async () => {
      const res = await fetch(`/api/tools/usage?endpoint=${encodeURIComponent(endpoint)}`);
      if (!res.ok) throw new Error("Failed to fetch API usage");
      return res.json();
    },
    refetchInterval: 60000, // Refetch every minute
  });
}
