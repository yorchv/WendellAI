
# AI Recipe Generation Agents

This directory contains documentation for the AI agents used in recipe generation and processing.

## Perplexity Integration

The Perplexity API is used as the primary recipe generation engine. It uses the `llama-3.1-sonar-small-128k-online` model to generate recipe content based on user prompts.

### Recipe Generation Flow

1. User submits a recipe generation prompt
2. Perplexity generates initial recipe content
3. Claude formats and structures the response into our RecipePreview schema
4. Response is enriched with citation data from Perplexity

### Schema Validation

All responses are validated against the `recipePreviewSchema` which ensures:
- Required title and instructions
- Properly structured ingredients with optional quantities and units
- Optional metadata like prep time and servings
