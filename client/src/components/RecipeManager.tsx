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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { useRecipes } from "@/hooks/use-recipes";
import { useToast } from "@/hooks/use-toast";
import { ManualRecipeForm } from "./ManualRecipeForm";
import { AIRecipeGenerator } from "./AIRecipeGenerator";
import { ImageUploadRecipe } from "./ImageUploadRecipe";
import type { RecipeFormData } from "./ManualRecipeForm";

interface RecipeManagerProps {
  recipe?: Recipe & {
    ingredients: (RecipeIngredient & {
      ingredient: Ingredient;
    })[];
  };
  mode: "create" | "edit";
  onClose?: () => void;
}

export function RecipeManager({ recipe, mode, onClose }: RecipeManagerProps) {
  const [open, setOpen] = useState(false);
  const { createRecipe, updateRecipe, deleteRecipe } = useRecipes();
  const { toast } = useToast();

  const handleSubmit = async (data: RecipeFormData) => {
    try {
      const payload = {
        title: data.title,
        description: data.description,
        instructions: data.instructions,
        prepTime: data.prepTime,
        cookTime: data.cookTime,
        servings: data.servings,
        image: data.image,
        sources: data.sources,
        ingredients: data.ingredients.map(ing => ({
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          notes: ing.notes,
        })),
      };

      if (mode === "create") {
        await createRecipe(payload);
        toast({
          title: "Success",
          description: "Recipe created successfully",
        });
      } else if (recipe?.id) {
        await updateRecipe(recipe.id, payload);
        toast({
          title: "Success",
          description: "Recipe updated successfully",
        });
      }
      setOpen(false);
      onClose?.();
    } catch (error) {
      console.error('Recipe submission error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save recipe",
      });
    }
  };

  const handleDelete = async () => {
    if (!recipe) return;
    try {
      await deleteRecipe(recipe.id);
      toast({
        title: "Success",
        description: "Recipe deleted successfully",
      });
      setOpen(false);
      onClose?.();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
      });
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen && !mode.includes("create")) {
          onClose?.();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant={mode === "create" ? "default" : "ghost"}>
          {mode === "create" ? (
            <>
              <Plus className="h-4 w-4 mr-2" />
              New Recipe
            </>
          ) : (
            "Edit Recipe"
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Recipe" : "Edit Recipe"}
          </DialogTitle>
        </DialogHeader>

        {mode === "create" ? (
          <Tabs defaultValue="manual">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="manual">Manual Creation</TabsTrigger>
              <TabsTrigger value="ai">AI Assisted</TabsTrigger>
              <TabsTrigger value="image">Upload Image</TabsTrigger>
            </TabsList>
            <TabsContent value="manual">
              <ManualRecipeForm
                mode={mode}
                onSubmit={handleSubmit}
              />
            </TabsContent>
            <TabsContent value="ai">
              <AIRecipeGenerator onGenerate={handleSubmit} />
            </TabsContent>
            <TabsContent value="image">
              <ImageUploadRecipe onRecipeGenerated={handleSubmit} />
            </TabsContent>
          </Tabs>
        ) : (
          <ManualRecipeForm
            recipe={recipe}
            mode={mode}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}