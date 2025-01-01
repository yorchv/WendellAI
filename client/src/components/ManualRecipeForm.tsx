
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Recipe } from "@db/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash } from "lucide-react";

const recipeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  ingredients: z.array(z.string()).min(1, "At least one ingredient is required"),
  instructions: z.array(z.string()).min(1, "At least one instruction step is required"),
  prepTime: z.number().min(0).optional(),
  cookTime: z.number().min(0).optional(),
  servings: z.number().min(1).optional(),
  image: z.string().url().optional(),
  sources: z.array(z.string()).optional(),
});

export type RecipeFormData = z.infer<typeof recipeSchema>;

interface ManualRecipeFormProps {
  recipe?: Recipe;
  onSubmit: (data: RecipeFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  mode: "create" | "edit";
}

export function ManualRecipeForm({ recipe, onSubmit, onDelete, mode }: ManualRecipeFormProps) {
  const [ingredients, setIngredients] = useState<string[]>(recipe?.ingredients || [""]);
  const [instructions, setInstructions] = useState<string[]>(recipe?.instructions || [""]);

  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: recipe?.title || "",
      description: recipe?.description || "",
      ingredients: recipe?.ingredients || [""],
      instructions: recipe?.instructions || [""],
      prepTime: recipe?.prepTime || 0,
      cookTime: recipe?.cookTime || 0,
      servings: recipe?.servings || 2,
      image: recipe?.image || "",
      sources: recipe?.sources || [],
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Form {...form}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Recipe title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description of the recipe"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Ingredients</FormLabel>
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={ingredient}
                onChange={(e) => {
                  const newIngredients = [...ingredients];
                  newIngredients[index] = e.target.value;
                  setIngredients(newIngredients);
                  form.setValue("ingredients", newIngredients);
                }}
                placeholder={`Ingredient ${index + 1}`}
              />
              {ingredients.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newIngredients = ingredients.filter((_, i) => i !== index);
                    setIngredients(newIngredients);
                    form.setValue("ingredients", newIngredients);
                  }}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIngredients([...ingredients, ""]);
            }}
          >
            Add Ingredient
          </Button>
        </div>

        <div className="space-y-2">
          <FormLabel>Instructions</FormLabel>
          {instructions.map((instruction, index) => (
            <div key={index} className="flex gap-2">
              <Textarea
                value={instruction}
                onChange={(e) => {
                  const newInstructions = [...instructions];
                  newInstructions[index] = e.target.value;
                  setInstructions(newInstructions);
                  form.setValue("instructions", newInstructions);
                }}
                placeholder={`Step ${index + 1}`}
              />
              {instructions.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newInstructions = instructions.filter((_, i) => i !== index);
                    setInstructions(newInstructions);
                    form.setValue("instructions", newInstructions);
                  }}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setInstructions([...instructions, ""]);
            }}
          >
            Add Step
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="prepTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prep Time (min)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cookTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cook Time (min)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="servings"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Servings</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="URL to recipe image"
                  type="url"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between pt-4">
          {mode === "edit" && onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
            >
              Delete Recipe
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button type="submit">
              {mode === "create" ? "Create Recipe" : "Update Recipe"}
            </Button>
          </div>
        </div>
      </Form>
    </form>
  );
}
