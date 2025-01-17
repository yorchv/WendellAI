import { format } from "date-fns";
import { Pencil, Trash2, UserPlus, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import UpdateFamilyMemberForm from "./UpdateFamilyMemberForm";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ManageDietaryPreferences from "./ManageDietaryPreferences";

interface FamilyMemberCardProps {
  member: {
    id: number;
    name: string;
    birthDate: string;
    isGuest: boolean;
    dietaryPreferences: Array<{
      dietaryPreference: {
        id: number;
        name: string;
        type: string;
        description?: string;
      };
      notes?: string;
    }>;
  };
  getIconForPreference: (type: string, name: string) => JSX.Element;
}

export default function FamilyMemberCard({ member, getIconForPreference }: FamilyMemberCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const age = Math.floor(
    (new Date().getTime() - new Date(member.birthDate).getTime()) / 31557600000
  );

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/family-members/${member.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/family-members"] });
      toast({
        title: "Success",
        description: `${member.isGuest ? "Guest" : "Family member"} deleted successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const groupedPreferences = member.dietaryPreferences.reduce((acc: Record<string, typeof member.dietaryPreferences>, curr) => {
    const type = curr.dietaryPreference.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(curr);
    return acc;
  }, {});

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {member.isGuest ? (
              <UserPlus className="h-5 w-5 text-muted-foreground" />
            ) : (
              <User className="h-5 w-5 text-primary" />
            )}
            <CardTitle className="flex items-center">
              <span>{member.name}</span>
              <span className="text-sm font-normal text-muted-foreground ml-2">
                {age} years old
              </span>
            </CardTitle>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Pencil className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <UpdateFamilyMemberForm member={member} onClose={() => document.querySelector('dialog')?.close()} />
              </DialogContent>
            </Dialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {member.isGuest ? "guest" : "family member"}</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {member.name}? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteMutation.mutate()}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <CardDescription>
          Born {format(new Date(member.birthDate), "MMMM do, yyyy")}
          {member.isGuest && " · Guest"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium">Dietary Preferences</h3>
            <ManageDietaryPreferences memberId={member.id} />
          </div>

          {Object.entries(groupedPreferences).map(([type, preferences]) => (
            <div key={type} className="space-y-2">
              <h4 className="text-sm font-medium">
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </h4>
              <div className="flex flex-wrap gap-2">
                {preferences.map((pref) => (
                  <Badge
                    key={pref.dietaryPreference.id}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {getIconForPreference(type, pref.dietaryPreference.name)}
                    <span>{pref.dietaryPreference.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                      onClick={async (e) => {
                        e.preventDefault();
                        try {
                          await fetch(`/api/family-members/${member.id}/dietary-preferences/${pref.dietaryPreference.id}`, {
                            method: 'DELETE'
                          });
                          queryClient.invalidateQueries({ queryKey: ["/api/family-members"] });
                          toast({ title: "Success", description: "Preference removed" });
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to remove preference",
                            variant: "destructive"
                          });
                        }
                      }}
                    >
                      ×
                    </Button>
                  </Badge>
                ))}
              </div>
              <Separator className="mt-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}