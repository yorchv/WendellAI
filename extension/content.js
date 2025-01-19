// Recipe extraction logic
function extractRecipe() {
  try {
    // Common recipe schema selectors
    const jsonLd = document.querySelector('script[type="application/ld+json"]');
    if (jsonLd) {
      const data = JSON.parse(jsonLd.textContent);
      if (data['@type'] === 'Recipe' || (Array.isArray(data['@graph']) && data['@graph'].find(item => item['@type'] === 'Recipe'))) {
        const recipe = Array.isArray(data['@graph']) 
          ? data['@graph'].find(item => item['@type'] === 'Recipe')
          : data;
        
        return {
          success: true,
          recipe: {
            name: recipe.name,
            description: recipe.description,
            ingredients: Array.isArray(recipe.recipeIngredient) ? recipe.recipeIngredient : [],
            instructions: Array.isArray(recipe.recipeInstructions) 
              ? recipe.recipeInstructions.map(i => typeof i === 'string' ? i : i.text)
              : [recipe.recipeInstructions],
            cookTime: recipe.cookTime,
            prepTime: recipe.prepTime,
            totalTime: recipe.totalTime,
            servings: recipe.recipeYield,
            sourceUrl: window.location.href
          }
        };
      }
    }

    // Fallback to common HTML structures
    const name = document.querySelector('h1')?.textContent;
    const ingredients = Array.from(document.querySelectorAll('.ingredients li, .recipe-ingredients li'))
      .map(el => el.textContent.trim());
    const instructions = Array.from(document.querySelectorAll('.instructions li, .recipe-directions li'))
      .map(el => el.textContent.trim());

    if (name && (ingredients.length > 0 || instructions.length > 0)) {
      return {
        success: true,
        recipe: {
          name,
          ingredients,
          instructions,
          sourceUrl: window.location.href
        }
      };
    }

    throw new Error('No recipe found on this page');
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'captureRecipe') {
    const result = extractRecipe();
    sendResponse(result);
  }
  return true;
});
