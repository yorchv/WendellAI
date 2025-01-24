import { Router } from "express";
import { formatRecipeResponse, analyzeRecipeImage, anthropic } from "../libraries/claude";
import multer from "multer";
import { Buffer } from "buffer";
import { db } from "@db";
import { apiUsage } from "@db/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Import the API usage tracking middleware
import { trackApiUsage } from "../middleware/apiUsage";

// Apply the middleware to all routes in this router
router.use(trackApiUsage);

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// PDF upload endpoint
router.post("/format-recipe/upload", upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    const buffer = req.file.buffer;
    
    if (req.file.mimetype === 'application/pdf') {
      const base64Data = buffer.toString('base64');
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: base64Data
                }
              },
              {
                type: "text",
                text: "Please extract the recipe text from this PDF. Return only the recipe text content."
              }
            ]
          }
        ]
      });
      
      const extractedText = response.content[0].type === "text" ? response.content[0].text : "";
      res.send(extractedText);
    } else {
      // Assume text file
      res.send(buffer.toString('utf-8'));
    }
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).send("Failed to process file");
  }
});

// Recipe formatter endpoint
router.post("/format-recipe", async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    const user = req.user as { id: number } | undefined;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Recipe text is required" });
    }

    // Get or create global usage record
    let [usage] = await db
      .select()
      .from(apiUsage)
      .where(eq(apiUsage.endpoint, 'format-recipe'));

    if (!usage) {
      [usage] = await db
        .insert(apiUsage)
        .values({
          endpoint: 'format-recipe',
          count: 0
        })
        .returning();
    }

    // Check global usage limit
    if (usage.count >= 100) {
      return res.status(429).json({ 
        message: "Free usage limit reached. Please try again later."
      });
    }

    // Increment global usage count
    await db
      .update(apiUsage)
      .set({ 
        count: usage.count + 1,
        updatedAt: new Date()
      })
      .where(eq(apiUsage.id, usage.id));

    // Format the recipe using Claude
    const recipe = await formatRecipeResponse(text);
    res.json(recipe);
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