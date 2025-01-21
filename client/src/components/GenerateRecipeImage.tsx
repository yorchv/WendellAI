import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GenerateRecipeImageProps {
  recipeId: number;
  onImageGenerated: (imageUrl: string) => void;
  className?: string;
}

export function GenerateRecipeImage({ recipeId, onImageGenerated, className }: GenerateRecipeImageProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateImage = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/recipes/${recipeId}/generate-image`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      onImageGenerated(data.imageUrl);
      
      toast({
        title: "Image Generated",
        description: "A new image has been generated for your recipe.",
      });
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Error",
        description: "Failed to generate recipe image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleGenerateImage}
      disabled={isGenerating}
      className={className}
    >
      <Wand2 className="w-4 h-4 mr-2" />
      {isGenerating ? "Generating..." : "Generate Image"}
    </Button>
  );
}
