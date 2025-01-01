const PERPLEXITY_API_KEY = import.meta.env.VITE_PERPLEXITY_API_KEY;

interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  citations: string[];
}

export async function generateRecipe(prompt: string) {
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-sonar-small-128k-online",
      messages: [
        {
          role: "system",
          content: "You are a helpful cooking assistant. Generate recipes in JSON format with the following structure: { title: string, description: string, ingredients: string[], instructions: string[], prepTime: number, cookTime: number, servings: number }",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate recipe");
  }

  const data: PerplexityResponse = await response.json();
  const recipeData = JSON.parse(data.choices[0].message.content);

  return {
    ...recipeData,
    sources: data.citations,
  };
}
