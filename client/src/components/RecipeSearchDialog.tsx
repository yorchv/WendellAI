import { useState } from "react";
import { Recipe } from "@db/schema";
import { useRecipes } from "@/hooks/use-recipes";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Plus, Search } from "lucide-react";
import { RecipeManager } from "./RecipeManager";

interface RecipeSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectRecipe: (recipe: Recipe) => void;
}

export function RecipeSearchDialog({
  open,
  onOpenChange,
  onSelectRecipe,
}: RecipeSearchDialogProps) {
  const [search, setSearch] = useState("");
  const { recipes, isLoading } = useRecipes();

  const filteredRecipes = recipes?.filter((recipe) =>
    recipe.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Recipe</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search recipes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <RecipeManager
            mode="create"
            onClose={() => {
              setSearch("");
            }}
          />
        </div>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ScrollArea className="h-[50vh] pr-4">
            <div className="space-y-4">
              {filteredRecipes?.map((recipe) => (
                <div
                  key={recipe.id}
                  className="group flex flex-col gap-2 rounded-lg border p-4 hover:bg-accent"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{recipe.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {recipe.description}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        onSelectRecipe(recipe);
                        onOpenChange(false);
                      }}
                    >
                      Select
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}