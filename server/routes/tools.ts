import { Router } from "express";
import { formatRecipeResponse, analyzeRecipeImage } from "../libraries/claude";
import multer from "multer";
import { Buffer } from "buffer";

const router = Router();
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Recipe formatter endpoint
router.post("/format-recipe", async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Recipe text is required" });
    }

    // Format the recipe using Claude
    const formattedRecipe = await formatRecipeResponse(text);

    // Convert the structured data into a readable format
    const formatted = `${formattedRecipe.title}\n\n` +
      `${formattedRecipe.description}\n\n` +
      'Ingredients:\n' +
      formattedRecipe.ingredients.map(ing => 
        `${ing.quantity ? ing.quantity + ' ' : ''}${ing.unit ? ing.unit + ' ' : ''}${ing.name}${ing.notes ? ' (' + ing.notes + ')' : ''}`
      ).join('\n') +
      '\n\nInstructions:\n' +
      formattedRecipe.instructions.map((step, i) => `${i + 1}. ${step}`).join('\n') +
      (formattedRecipe.prepTime ? `\n\nPrep Time: ${formattedRecipe.prepTime} minutes` : '') +
      (formattedRecipe.cookTime ? `\nCook Time: ${formattedRecipe.cookTime} minutes` : '') +
      (formattedRecipe.servings ? `\nServings: ${formattedRecipe.servings}` : '');

    res.json({ formatted });
  } catch (error) {
    console.error("Error formatting recipe:", error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to format recipe" 
    });
  }
});

// Recipe image extraction endpoint
router.post("/extract-recipe", upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    // Convert buffer to base64
    const base64Image = req.file.buffer.toString('base64');
    const mediaType = req.file.mimetype;

    // Use Claude to analyze the recipe image
    const recipeData = await analyzeRecipeImage(base64Image, mediaType);

    // Format the recipe text similarly to the recipe formatter
    const recipe = `${recipeData.title}\n\n` +
      `${recipeData.description}\n\n` +
      'Ingredients:\n' +
      recipeData.ingredients.map(ing => 
        `${ing.quantity ? ing.quantity + ' ' : ''}${ing.unit ? ing.unit + ' ' : ''}${ing.name}${ing.notes ? ' (' + ing.notes + ')' : ''}`
      ).join('\n') +
      '\n\nInstructions:\n' +
      recipeData.instructions.map((step, i) => `${i + 1}. ${step}`).join('\n') +
      (recipeData.prepTime ? `\n\nPrep Time: ${recipeData.prepTime} minutes` : '') +
      (recipeData.cookTime ? `\nCook Time: ${recipeData.cookTime} minutes` : '') +
      (recipeData.servings ? `\nServings: ${recipeData.servings}` : '');

    res.json({ recipe });
  } catch (error) {
    console.error("Error extracting recipe from image:", error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to extract recipe from image" 
    });
  }
});

export default router;