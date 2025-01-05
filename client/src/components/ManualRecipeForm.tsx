import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Recipe, RecipeIngredient, Ingredient } from "@db/schema";
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
  quantity: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
    z.number().nullable(),
  ),
  unit: z.string().nullable(),
  notes: z.string().nullable(),
});

const recipeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable(),
  ingredients: z.array(ingredientSchema).min(1, "At least one ingredient is required"),
  instructions: z.array(z.string()).min(1, "At least one instruction step is required"),
  prepTime: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
    z.number().nullable(),
  ),
  cookTime: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
    z.number().nullable(),
  ),
  servings: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
    z.number().nullable(),
  ),
  image: z.string().url().nullable().or(z.literal("")),
  sources: z.array(z.string()).nullable(),
});

export type RecipeFormData = z.infer<typeof recipeSchema>;

interface FormIngredient {
  name: string;
  quantity: string;
  unit: string;
  notes: string;
}

interface ManualRecipeFormProps {
  recipe?: Recipe & {
    ingredients: (RecipeIngredient & {
      ingredient: Ingredient;
    })[];
  };
  onSubmit: (data: RecipeFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  mode: "create" | "edit";
}

export function ManualRecipeForm({ recipe, onSubmit, onDelete, mode }: ManualRecipeFormProps) {
  const [ingredients, setIngredients] = useState<FormIngredient[]>(
    recipe?.ingredients.map(i => ({
      name: i.name,
      quantity: i.quantity?.toString() ?? "",
      unit: i.unit ?? "",
      notes: i.notes ?? "",
    })) ?? [{ name: "", quantity: "", unit: "", notes: "" }]
  );

  const [instructions, setInstructions] = useState<string[]>(
    recipe?.instructions ?? [""]
  );

  const transformIngredientToFormData = (ing: FormIngredient): z.infer<typeof ingredientSchema> => ({
    name: ing.name,
    quantity: ing.quantity === "" ? null : Number(ing.quantity),
    unit: ing.unit || null,
    notes: ing.notes || null,
  });

  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: recipe?.title ?? "",
      description: recipe?.description ?? null,
      ingredients: ingredients.map(transformIngredientToFormData),
      instructions: recipe?.instructions ?? [""],
      prepTime: recipe?.prepTime ?? null,
      cookTime: recipe?.cookTime ?? null,
      servings: recipe?.servings ?? null,
      image: recipe?.image ?? "",
      sources: recipe?.sources ?? null,
    },
  });

  const updateIngredients = (newIngredients: FormIngredient[]) => {
    setIngredients(newIngredients);
    form.setValue("ingredients", newIngredients.map(transformIngredientToFormData), {
      shouldValidate: true,
    });
  };

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
                  value={field.value ?? ""}
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
                      updateIngredients(newIngredients);
                    }}
                    placeholder="Ingredient name"
                  />
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    value={ingredient.quantity}
                    onChange={(e) => {
                      const newIngredients = [...ingredients];
                      newIngredients[index] = { ...ingredient, quantity: e.target.value };
                      updateIngredients(newIngredients);
                    }}
                    placeholder="Amount"
                  />
                </div>
                <div className="w-24">
                  <Input
                    value={ingredient.unit}
                    onChange={(e) => {
                      const newIngredients = [...ingredients];
                      newIngredients[index] = { ...ingredient, unit: e.target.value };
                      updateIngredients(newIngredients);
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
                      updateIngredients(newIngredients);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Input
                value={ingredient.notes}
                onChange={(e) => {
                  const newIngredients = [...ingredients];
                  newIngredients[index] = { ...ingredient, notes: e.target.value };
                  updateIngredients(newIngredients);
                }}
                placeholder="Additional notes (optional)"
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              updateIngredients([
                ...ingredients,
                { name: "", quantity: "", unit: "", notes: "" }
              ]);
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
                  form.setValue("instructions", newInstructions, {
                    shouldValidate: true,
                  });
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
                    form.setValue("instructions", newInstructions, {
                      shouldValidate: true,
                    });
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
              const newInstructions = [...instructions, ""];
              setInstructions(newInstructions);
              form.setValue("instructions", newInstructions, {
                shouldValidate: true,
              });
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
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
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
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
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
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
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
                  value={field.value ?? ""}
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