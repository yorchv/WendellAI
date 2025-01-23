import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ChefHat, Copy, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function RecipeFormatter() {
  const [recipeText, setRecipeText] = useState("");
  const [formattedRecipe, setFormattedRecipe] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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

      if (!response.ok) {
        throw new Error("Failed to format recipe");
      }

      const data = await response.json();
      setFormattedRecipe(data.formatted);
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

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <ChefHat className="w-8 h-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">Quick Recipe Formatter</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Paste any recipe text below to get a beautifully formatted version
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
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
                <Card>
                  <CardHeader>
                    <CardTitle>{formattedRecipe.title}</CardTitle>
                    {formattedRecipe.description && (
                      <p className="text-muted-foreground">{formattedRecipe.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2">Ingredients</h4>
                      <ul className="list-disc pl-4 space-y-1">
                        {formattedRecipe.ingredients.map((ing, i) => (
                          <li key={i}>
                            {ing.quantity && `${ing.quantity} `}
                            {ing.unit && `${ing.unit} `}
                            {ing.name}
                            {ing.notes && ` (${ing.notes})`}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Instructions</h4>
                      <ol className="list-decimal pl-4 space-y-2">
                        {formattedRecipe.instructions.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      {formattedRecipe.prepTime && (
                        <div>Prep Time: {formattedRecipe.prepTime} minutes</div>
                      )}
                      {formattedRecipe.cookTime && (
                        <div>Cook Time: {formattedRecipe.cookTime} minutes</div>
                      )}
                      {formattedRecipe.servings && (
                        <div>Servings: {formattedRecipe.servings}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
