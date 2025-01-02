import { useState } from "react";
import { Recipe } from "@db/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useRecipes } from "@/hooks/use-recipes";
import { useToast } from "@/hooks/use-toast";
import { ManualRecipeForm, RecipeFormData } from "./ManualRecipeForm";
import { AIRecipeGenerator } from "./AIRecipeGenerator";

interface RecipeManagerProps {
  recipe?: Recipe;
  mode: "create" | "edit";
  onClose?: () => void;
}

export function RecipeManager({ recipe, mode, onClose }: RecipeManagerProps) {
  const [open, setOpen] = useState(false);
  const { createRecipe, updateRecipe, deleteRecipe } = useRecipes();
  const { toast } = useToast();

  const handleSubmit = async (data: RecipeFormData) => {
    try {
      if (mode === "create") {
        await createRecipe(data);
        toast({
          title: "Success",
          description: "Recipe created successfully",
        });
      } else {
        await updateRecipe(recipe!.id, data);
        toast({
          title: "Success",
          description: "Recipe updated successfully",
        });
      }
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
    <Dialog open={open} onOpenChange={setOpen}>
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Recipe" : "Edit Recipe"}
          </DialogTitle>
        </DialogHeader>

        {mode === "create" && (
          <AIRecipeGenerator onGenerated={handleSubmit} />
        )}

        <ManualRecipeForm
          recipe={recipe}
          mode={mode}
          onSubmit={handleSubmit}
          onDelete={mode === "edit" ? async () => {
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
          } : undefined}
        />
      </DialogContent>
    </Dialog>
  );
}