import { Router } from "express";

const router = Router();

// Recipe formatter endpoint
router.post("/format-recipe", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Recipe text is required" });
    }

    // Format the recipe text
    const formattedRecipe = await formatRecipe(text);
    res.json({ formatted: formattedRecipe });
  } catch (error) {
    console.error("Error formatting recipe:", error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to format recipe" 
    });
  }
});

async function formatRecipe(text: string): Promise<string> {
  // Clean up the text first
  let cleanText = text.trim()
    .replace(/\n{3,}/g, "\n\n") // Replace multiple newlines with double newlines
    .replace(/\s+/g, " "); // Replace multiple spaces with single space

  // Use AI to format the recipe
  const prompt = `Format this recipe text into a clean, organized structure with clear sections for ingredients and instructions. Original text:\n\n${cleanText}`;
  
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        messages: [{
          role: "user",
          content: prompt
        }],
        model: "claude-2",
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to format recipe with AI");
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error("AI formatting error:", error);
    // Fallback to basic formatting if AI fails
    return cleanText
      .split(/\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join("\n\n");
  }
}

export default router;
