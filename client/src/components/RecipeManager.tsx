import { useState } from "react";
import { Recipe, RecipeIngredient, Ingredient } from "@db/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Image as ImageIcon } from "lucide-react";
import { useRecipes } from "@/hooks/use-recipes";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface Props {
  recipe?: Recipe & {
    ingredients: (RecipeIngredient & {
      ingredient: Ingredient;
    })[];
  };
  mode?: "create" | "edit";
}

export function RecipeManager({ recipe, mode = "create" }: Props) {
  const [open, setOpen] = useState(false);
  const [recipeInput, setRecipeInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { createRecipe } = useRecipes();
  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      let endpoint = "/api/recipes";
      let payload: any = { prompt: recipeInput };

      if (imageFile) {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Image = reader.result?.toString().split(",")[1];
          if (base64Image) {
            endpoint = "/api/recipes/analyze-image";
            payload = { 
              image: base64Image,
              mediaType: imageFile.type
            };
          }
        };
        reader.readAsDataURL(imageFile);
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to process recipe");
      }

      const recipeData = await response.json();
      await createRecipe(recipeData);
      setOpen(false);
      toast({
        title: "Success",
        description: "Recipe created successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create recipe",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setRecipeInput(`Processing image: ${file.name}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Recipe
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Recipe</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Type or paste your recipe here, or enter a prompt to generate a new recipe..."
              value={recipeInput}
              onChange={(e) => setRecipeInput(e.target.value)}
              className="min-h-[200px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById("image-upload")?.click()}
              type="button"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isLoading || !recipeInput.trim()}
            >
              {isLoading ? "Processing..." : "Create Recipe"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}