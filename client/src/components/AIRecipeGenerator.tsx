
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const promptSchema = z.object({
  prompt: z.string().min(1, "Please enter a prompt"),
});

type PromptFormData = z.infer<typeof promptSchema>;

interface AIRecipeGeneratorProps {
  onGenerate: (prompt: string) => Promise<void>;
}

export function AIRecipeGenerator({ onGenerate }: AIRecipeGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PromptFormData>({
    resolver: zodResolver(promptSchema),
    defaultValues: {
      prompt: "",
    },
  });

  async function onSubmit(data: PromptFormData) {
    setIsLoading(true);
    try {
      await onGenerate(data.prompt);
    } finally {
      setIsLoading(false);
    }
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
                  placeholder="Describe the recipe you want to generate..."
                  className="h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Generating..." : "Generate Recipe"}
        </Button>
      </form>
    </Form>
  );
}
