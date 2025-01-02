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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { useRecipes } from "@/hooks/use-recipes";
import { useToast } from "@/hooks/use-toast";
import { ManualRecipeForm, RecipeFormData } from "./ManualRecipeForm";
import { AIRecipeGenerator } from "./AIRecipeGenerator";
import { ImageUploadRecipe } from "./ImageUploadRecipe";

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
            onDelete={async () => {
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
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}