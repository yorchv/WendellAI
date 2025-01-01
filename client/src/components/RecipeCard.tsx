import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Recipe } from "@db/schema";
import { Clock, Users } from "lucide-react";

interface RecipeCardProps {
  recipe: Recipe;
  onClick?: () => void;
}

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      {recipe.image && (
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="object-cover w-full h-full"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle>{recipe.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {recipe.prepTime + recipe.cookTime} min
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {recipe.servings} servings
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
