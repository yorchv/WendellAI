import { useState } from "react";
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

const ingredientSchema = z.object({
  name: z.string().min(1, "Ingredient name is required"),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  notes: z.string().optional(),
});

const recipeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  ingredients: z.array(ingredientSchema).min(1, "At least one ingredient is required"),
  instructions: z.array(z.string()).min(1, "At least one instruction step is required"),
  prepTime: z.number().min(0).optional(),
  cookTime: z.number().min(0).optional(),
  servings: z.number().min(1).optional(),
  image: z.string().url().optional().or(z.literal("")),
  sources: z.array(z.string()).optional(),
});

export type RecipeFormData = z.infer<typeof recipeSchema>;

interface ManualRecipeFormProps {
  recipe?: Recipe & {
    ingredients: {
      ingredient: { name: string };
      quantity?: number;
      unit?: string;
      notes?: string;
    }[];
  };
  onSubmit: (data: RecipeFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  mode: "create" | "edit";
}

export function ManualRecipeForm({ recipe, onSubmit, onDelete, mode }: ManualRecipeFormProps) {
  const [ingredients, setIngredients] = useState<Array<{
    name: string;
    quantity?: number;
    unit?: string;
    notes?: string;
  }>>(
    recipe?.ingredients.map(i => ({
      name: i.ingredient.name,
      quantity: i.quantity || undefined,
      unit: i.unit || undefined,
      notes: i.notes || undefined,
    })) || [{ name: "", quantity: undefined, unit: undefined, notes: undefined }]
  );
  const [instructions, setInstructions] = useState<string[]>(recipe?.instructions || [""]);

  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: recipe?.title || "",
      description: recipe?.description || "",
      ingredients: recipe?.ingredients.map(i => ({
        name: i.ingredient.name,
        quantity: i.quantity || undefined,
        unit: i.unit || undefined,
        notes: i.notes || undefined,
      })) || [{ name: "", quantity: undefined, unit: undefined, notes: undefined }],
      instructions: recipe?.instructions || [""],
      prepTime: recipe?.prepTime || 0,
      cookTime: recipe?.cookTime || 0,
      servings: recipe?.servings || 2,
      image: recipe?.image || "",
      sources: recipe?.sources || [],
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <div key={index} className="space-y-2 p-4 border rounded-lg">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    value={ingredient.name}
                    onChange={(e) => {
                      const newIngredients = [...ingredients];
                      newIngredients[index] = { ...ingredient, name: e.target.value };
                      setIngredients(newIngredients);
                      form.setValue("ingredients", newIngredients);
                    }}
                    placeholder="Ingredient name"
                  />
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    value={ingredient.quantity || ""}
                    onChange={(e) => {
                      const newIngredients = [...ingredients];
                      newIngredients[index] = { 
                        ...ingredient, 
                        quantity: e.target.value ? Number(e.target.value) : undefined 
                      };
                      setIngredients(newIngredients);
                      form.setValue("ingredients", newIngredients);
                    }}
                    placeholder="Amount"
                  />
                </div>
                <div className="w-24">
                  <Input
                    value={ingredient.unit || ""}
                    onChange={(e) => {
                      const newIngredients = [...ingredients];
                      newIngredients[index] = { ...ingredient, unit: e.target.value };
                      setIngredients(newIngredients);
                      form.setValue("ingredients", newIngredients);
                    }}
                    placeholder="Unit"
                  />
                </div>
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
              <Input
                value={ingredient.notes || ""}
                onChange={(e) => {
                  const newIngredients = [...ingredients];
                  newIngredients[index] = { ...ingredient, notes: e.target.value };
                  setIngredients(newIngredients);
                  form.setValue("ingredients", newIngredients);
                }}
                placeholder="Additional notes (optional)"
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIngredients([...ingredients, { 
                name: "", 
                quantity: undefined, 
                unit: undefined, 
                notes: undefined 
              }]);
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
      </form>
    </Form>
  );
}