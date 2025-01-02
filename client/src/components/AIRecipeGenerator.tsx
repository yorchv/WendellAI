import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { ManualRecipeForm, type RecipeFormData } from "./ManualRecipeForm";
import { useToast } from "@/hooks/use-toast";

const promptSchema = z.object({
  prompt: z.string().min(1, "Please enter a prompt"),
});

type PromptFormData = z.infer<typeof promptSchema>;

interface AIRecipeGeneratorProps {
  onGenerate: (recipe: RecipeFormData) => Promise<void>;
}

export function AIRecipeGenerator({ onGenerate }: AIRecipeGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<RecipeFormData | null>(null);
  const { toast } = useToast();

  const form = useForm<PromptFormData>({
    resolver: zodResolver(promptSchema),
    defaultValues: {
      prompt: "",
    },
  });

  async function onSubmit(data: PromptFormData) {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/recipes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const recipe = await response.json();
      setGeneratedRecipe({
        ...recipe,
        image: "", // Initialize with empty image URL
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate recipe",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  if (generatedRecipe) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Review Generated Recipe</h3>
          <Button variant="ghost" onClick={() => setGeneratedRecipe(null)}>
            Try Another Prompt
          </Button>
        </div>
        <ManualRecipeForm
          recipe={generatedRecipe}
          mode="create"
          onSubmit={onGenerate}
        />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipe Prompt</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the recipe you want to generate... (e.g., 'A healthy vegetarian pasta dish with Mediterranean flavors')"
                  className="h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Recipe...
            </>
          ) : (
            "Generate Recipe"
          )}
        </Button>
      </form>
    </Form>
  );
}