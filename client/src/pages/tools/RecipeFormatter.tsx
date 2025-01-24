import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecipeDisplay } from "@/components/RecipeDisplay";
import { useToast } from "@/hooks/use-toast";
import { ChefHat, Copy, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function RecipeFormatter() {
  const [recipeText, setRecipeText] = useState("");
  const [formattedRecipe, setFormattedRecipe] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  async function handleFormatRecipe() {
    if (!recipeText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a recipe to format",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/tools/format-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: recipeText }),
      });

      if (response.status === 429) {
        toast({
          title: "Usage Limit Reached",
          description: "The recipe formatter has reached its daily limit. Please try again later.",
          variant: "destructive",
        });
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to format recipe");
      }

      const recipe = await response.json();
      setFormattedRecipe(recipe);
      setShowForm(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to format recipe",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleCopyToClipboard() {
    navigator.clipboard.writeText(formattedRecipe);
    toast({
      title: "Success",
      description: "Recipe copied to clipboard",
    });
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

        <div className="bg-background">
          <div className="flex items-center gap-4 mb-6">
            <ChefHat className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-semibold">Quick Recipe Formatter</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Paste any recipe text below to get a beautifully formatted version
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {showForm ? (
              <>
                <Textarea
                  placeholder="Paste your recipe here..."
                  className="min-h-[200px]"
                  value={recipeText}
                  onChange={(e) => setRecipeText(e.target.value)}
                />
                <Button 
                  className="w-full" 
                  onClick={handleFormatRecipe}
                  disabled={isLoading}
                >
                  {isLoading ? "Formatting..." : "Format Recipe"}
                </Button>
              </>
            ) : (
              <Button
                className="w-full mb-4"
                onClick={() => {
                  setRecipeText("");
                  setFormattedRecipe("");
                  setShowForm(true);
                }}
              >
                Start Over
              </Button>
            )}

            {formattedRecipe && (
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Formatted Recipe</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCopyToClipboard()}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <RecipeDisplay 
                  recipe={{
                    ...formattedRecipe,
                    id: 0,
                    userId: 0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    ingredients: formattedRecipe.ingredients.map(ing => ({
                      recipeId: 0,
                      ingredientId: 0,
                      quantity: ing.quantity,
                      unit: ing.unit,
                      notes: ing.notes,
                      ingredient: {
                        id: 0,
                        name: ing.name,
                        createdAt: new Date(),
                        updatedAt: new Date()
                      }
                    }))
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}