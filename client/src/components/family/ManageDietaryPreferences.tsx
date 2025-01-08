
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DietaryPreferenceForm from "./DietaryPreferenceForm";

interface ManageDietaryPreferencesProps {
  memberId: number;
  onUpdate?: () => void;
}

export default function ManageDietaryPreferences({ memberId, onUpdate }: ManageDietaryPreferencesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: preferences } = useQuery({
    queryKey: ["/api/dietary-preferences"],
  });

  const mutation = useMutation({
    mutationFn: async (preferenceId: number) => {
      const res = await fetch(`/api/family-members/${memberId}/dietary-preferences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dietaryPreferenceId: preferenceId }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/family-members"] });
      setIsOpen(false);
      onUpdate?.();
      toast({ title: "Success", description: "Dietary preference added" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Preference
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Dietary Preference</DialogTitle>
          <DialogDescription>
            Add an existing preference or create a new one.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {preferences?.map((pref: any) => (
              <Button
                key={pref.id}
                variant="outline"
                onClick={() => mutation.mutate(pref.id)}
              >
                {pref.name}
              </Button>
            ))}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or create new
              </span>
            </div>
          </div>

          <DietaryPreferenceForm onSuccess={() => setIsOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
