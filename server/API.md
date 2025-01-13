
# API Documentation

## Authentication
- `GET /api/user` - Get current authenticated user
- `POST /api/logout` - Log out current user

## Recipes
- `GET /api/recipes` - Get all recipes for authenticated user
- `GET /api/recipes/:id` - Get specific recipe by ID
- `POST /api/recipes` - Create new recipe
- `POST /api/recipes/generate` - Generate recipe using AI
- `POST /api/recipes/analyze-image` - Analyze recipe from image

## Meal Plans
- `GET /api/meal-plans` - Get all meal plans
- `POST /api/meal-plans` - Create new meal plan
- `PUT /api/meal-plans/:id` - Update existing meal plan
- `DELETE /api/meal-plans/:id` - Delete meal plan

## Shopping List
- `GET /api/shopping-list-items` - Get shopping list items (supports date range filtering)
- `POST /api/shopping-list-items` - Add item to shopping list
- `PUT /api/shopping-list-items/:id` - Update shopping list item

## Family Members
- `GET /api/family-members` - Get all family members
- `POST /api/family-members` - Add new family member
- `PUT /api/family-members/:id` - Update family member
- `DELETE /api/family-members/:id` - Delete family member

## Dietary Preferences
- `GET /api/dietary-preferences` - Get all dietary preferences
- `POST /api/dietary-preferences` - Create new dietary preference

### Family Member Dietary Preferences
- `POST /api/family-members/:familyMemberId/dietary-preferences` - Add dietary preference to family member
- `DELETE /api/family-members/:familyMemberId/dietary-preferences/:preferenceId` - Remove dietary preference from family member
