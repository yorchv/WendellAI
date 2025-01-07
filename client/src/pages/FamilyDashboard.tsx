import { useQuery } from "@tanstack/react-query";
import {
  Apple,
  Beef,
  Carrot,
  Fish,
  AlertTriangle,
  Pill,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import AddFamilyMemberForm from "@/components/family/AddFamilyMemberForm";
import FamilyMemberCard from "@/components/family/FamilyMemberCard";
import { Calendar } from 'react-calendar'; // Added import for Calendar component

const getIconForPreference = (type: string, name: string) => {
  switch (type) {
    case "ALLERGY":
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case "DIET":
      switch (name.toLowerCase()) {
        case "vegetarian":
          return <Carrot className="h-5 w-5 text-orange-500" />;
        case "pescatarian":
          return <Fish className="h-5 w-5 text-blue-500" />;
        case "carnivore":
          return <Beef className="h-5 w-5 text-red-700" />;
        default:
          return <Apple className="h-5 w-5 text-green-500" />;
      }
    case "SUPPLEMENTATION":
      return <Pill className="h-5 w-5 text-purple-500" />;
    default:
      return <Apple className="h-5 w-5 text-gray-500" />;
  }
};

export default function FamilyDashboard() {
  const { data: familyMembers, isLoading } = useQuery({
    queryKey: ["/api/family-members"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Family Dashboard</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Family Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <AddFamilyMemberForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {familyMembers?.map((member: any) => (
          <FamilyMemberCard 
            key={member.id} 
            member={member} 
            getIconForPreference={getIconForPreference}
          />
        ))}
      </div>
      <div>
        <Calendar 
            mode="single"
            selected={new Date()}
            fromYear={1990}
            toYear={2024}
            captionLayout="dropdown-buttons"
            className="rounded-md border"
          /> {/* Added Calendar component for year navigation */}
      </div>
    </div>
  );
}