import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Heart, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const DIETARY_REQUIREMENTS = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten-free", label: "Gluten Free" },
  { id: "dairy-free", label: "Dairy Free" },
  { id: "nut-free", label: "Nut Free" },
  { id: "keto", label: "Keto" },
];

export default function DietaryChecker() {
  const [recipeText, setRecipeText] = useState("");
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
  const [results, setResults] = useState<{
    compatible: boolean;
    reasons: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  async function handleCheckDiet() {
    if (!recipeText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a recipe to check",
        variant: "destructive",
      });
      return;
    }

    if (selectedDiets.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one dietary requirement",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/tools/check-diet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          text: recipeText,
          diets: selectedDiets
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to check dietary requirements");
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to check dietary requirements",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="container max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-8"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Heart className="w-8 h-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">Dietary Compatibility Checker</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Check if a recipe meets specific dietary requirements
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Select Dietary Requirements</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {DIETARY_REQUIREMENTS.map((diet) => (
                  <div key={diet.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={diet.id}
                      checked={selectedDiets.includes(diet.id)}
                      onCheckedChange={(checked) => {
                        setSelectedDiets(prev => 
                          checked 
                            ? [...prev, diet.id]
                            : prev.filter(id => id !== diet.id)
                        );
                      }}
                    />
                    <Label htmlFor={diet.id}>{diet.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label>Recipe Text</Label>
              <Textarea
                placeholder="Paste your recipe here..."
                className="min-h-[200px]"
                value={recipeText}
                onChange={(e) => setRecipeText(e.target.value)}
              />
            </div>

            <Button 
              className="w-full" 
              onClick={handleCheckDiet}
              disabled={isLoading}
            >
              {isLoading ? "Checking..." : "Check Compatibility"}
            </Button>

            {results && (
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${results.compatible ? 'bg-green-500' : 'bg-red-500'}`} />
                  <h3 className="text-lg font-semibold">
                    {results.compatible ? 'Compatible' : 'Not Compatible'}
                  </h3>
                </div>
                <div className="bg-card p-6 rounded-lg space-y-2">
                  {results.reasons.map((reason, index) => (
                    <p key={index} className="text-sm">• {reason}</p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
