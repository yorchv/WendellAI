import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface FamilyMemberCardProps {
  member: {
    id: number;
    name: string;
    birthDate: string;
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
  const age = Math.floor(
    (new Date().getTime() - new Date(member.birthDate).getTime()) / 31557600000
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <span>{member.name}</span>
          <span className="text-sm font-normal text-muted-foreground">
            {age} years old
          </span>
        </CardTitle>
        <CardDescription>
          Born {format(new Date(member.birthDate), "MMMM do, yyyy")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {["ALLERGY", "DIET", "SUPPLEMENTATION"].map((type) => {
            const preferences = member.dietaryPreferences.filter(
              (p) => p.dietaryPreference.type === type
            );
            
            if (preferences.length === 0) return null;

            return (
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
                    </Badge>
                  ))}
                </div>
                <Separator className="mt-2" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
