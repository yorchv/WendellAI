import { Router } from "express";
import { formatRecipeResponse, analyzeRecipeImage } from "../libraries/claude";
import multer from "multer";
import { Buffer } from "buffer";
import { db } from "@db";
import { apiUsage } from "@db/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Import the API usage tracking middleware
import { trackApiUsage } from "../middleware/apiUsage";

// Get remaining API requests
router.get("/usage", async (req, res) => {
  const DAILY_LIMIT = 100;
  const endpoint = req.query.endpoint as string;

  if (!endpoint) {
    return res.status(400).json({ error: "Endpoint parameter is required" });
  }

  try {
    const usages = await db
      .select()
      .from(apiUsage)
      .where(eq(apiUsage.endpoint, endpoint));
    
    const totalUsage = usages.reduce((sum, record) => sum + record.count, 0);
    const remaining = Math.max(0, DAILY_LIMIT - totalUsage);
    res.json({ remaining });
  } catch (error) {
    console.error("Error getting API usage:", error);
    res.status(500).json({ error: "Failed to get API usage" });
  }
});

// Apply the middleware to all routes in this router
router.use(trackApiUsage);

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
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
    const recipe = await analyzeRecipeImage(base64Image, mediaType);
    res.json(recipe);
  } catch (error) {
    console.error("Error extracting recipe from image:", error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to extract recipe from image" 
    });
  }
});

export default router;