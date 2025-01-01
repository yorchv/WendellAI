
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormLabel } from "@/components/ui/form";
import { Loader2, Sparkles } from "lucide-react";
import { generateRecipe } from "@/lib/perplexity";
import { useToast } from "@/hooks/use-toast";
import type { RecipeFormData } from "./ManualRecipeForm";

interface AIRecipeGeneratorProps {
  onGenerated: (recipe: RecipeFormData) => void;
}

export function AIRecipeGenerator({ onGenerated }: AIRecipeGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateRecipe = async () => {
    if (!prompt) return;

    setIsGenerating(true);
    try {
      const generatedRecipe = await generateRecipe(prompt);
      onGenerated(generatedRecipe);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate recipe. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mb-6">
      <FormLabel>Generate Recipe with AI</FormLabel>
      <div className="flex gap-2 mt-2">
        <Input
          placeholder="Describe the recipe you want to create..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <Button
          type="button"
          onClick={handleGenerateRecipe}
          disabled={isGenerating || !prompt}
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
