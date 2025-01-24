import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CalendarCheck2, ArrowLeft, Upload, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

export default function CookbookToPhone() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [extractedRecipe, setExtractedRecipe] = useState<{
  title: string;
  description: string | null;
  ingredients: Array<{
    name: string;
    quantity: number | null;
    unit: string | null;
    notes: string | null;
  }>;
  instructions: string[];
  prepTime: number | null;
  cookTime: number | null;
  servings: number | null;
} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleExtractRecipe() {
    if (!image) {
      toast({
        title: "Error",
        description: "Please upload an image first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', image);

      const response = await fetch("/api/tools/extract-recipe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to extract recipe from image");
      }

      const recipe = await response.json();
      setExtractedRecipe(recipe);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to extract recipe",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="container max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-8"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <CalendarCheck2 className="w-8 h-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">Cookbook to Phone</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Convert cookbook photos to digital recipes you can cook from anywhere
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
              <div className="flex flex-col items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-muted-foreground">
                    PNG, JPG or JPEG (max. 5MB)
                  </span>
                </label>
              </div>
            </div>

            {preview && (
              <div className="space-y-4">
                <h3 className="font-semibold">Preview</h3>
                <div className="relative aspect-video rounded-lg overflow-hidden bg-secondary/20">
                  <img
                    src={preview}
                    alt="Recipe preview"
                    className="object-contain w-full h-full"
                  />
                </div>
              </div>
            )}

            <Button 
              className="w-full" 
              onClick={handleExtractRecipe}
              disabled={!image || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Extracting Recipe...
                </>
              ) : (
                "Extract Recipe"
              )}
            </Button>

            {extractedRecipe && (
              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-semibold">Extracted Recipe</h3>
                <div className="bg-card p-6 rounded-lg whitespace-pre-wrap font-serif">
                  {extractedRecipe}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
