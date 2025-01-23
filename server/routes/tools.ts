import { Router } from "express";
import { formatRecipeResponse } from "../libraries/claude";

const router = Router();

// Recipe formatter endpoint
router.post("/format-recipe", async (req, res) => {
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

export default router;