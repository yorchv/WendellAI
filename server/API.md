
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
# API Documentation

## Route Structure

The API routes are organized into the following domains:

- `/api/auth`: Authentication routes
- `/api/recipes`: Recipe management
- `/api/meal-plans`: Meal planning
- `/api/shopping-list`: Shopping list management
- `/api/family`: Family member and dietary preferences management

### Authentication Routes (`/api/auth`)
- POST `/register`: Register a new user
- POST `/login`: Login user
- POST `/logout`: Logout user
- GET `/user`: Get current user information

### Recipe Routes (`/api/recipes`)
- GET `/`: Get all user recipes
- GET `/:id`: Get specific recipe
- POST `/generate`: Generate recipe using AI
- POST `/analyze-image`: Analyze recipe from image
- POST `/:id/generate-image`: Generate image for recipe
- POST `/`: Create new recipe

### Meal Plan Routes (`/api/meal-plans`)
- GET `/`: Get all meal plans
- POST `/`: Create new meal plan
- PUT `/:id`: Update meal plan
- DELETE `/:id`: Delete meal plan

### Shopping List Routes (`/api/shopping-list`)
- GET `/`: Get shopping list items
- POST `/`: Add shopping list item
- PUT `/:id`: Update shopping list item

### Family Routes (`/api/family`)
- GET `/`: Get family members
- POST `/`: Create family member
- GET `/dietary-preferences`: Get all dietary preferences
- POST `/dietary-preferences`: Create dietary preference
- POST `/:familyMemberId/dietary-preferences`: Add dietary preference to family member
- DELETE `/:familyMemberId/dietary-preferences/:preferenceId`: Remove dietary preference
- GET `/:familyMemberId/meal-participation`: Get meal participation
- POST `/:familyMemberId/meal-participation`: Set meal participation

Each route handles authentication and performs proper validation of input data. Error responses include appropriate status codes and messages.
