# Meal Participation and Recipe Suggestion System

## Overview
This document describes the meal participation tracking and recipe suggestion system implemented in WendellAI. The system allows family members to be optionally included in meal planning at different granularities (meal, day, or week) while considering their dietary preferences for recipe suggestions.

## Meal Participation Tracking

### Default Participation
Each family member can have default meal participation preferences stored in the `familyMemberMealParticipation` table with the following attributes:
- `defaultParticipation`: Boolean flag indicating if the member generally participates in meals
- `defaultMeals`: Array of meal types (breakfast, lunch, dinner) they usually participate in

### Participation Override
The meal plan structure supports overriding default participation at multiple levels:
1. **Meal Level**: Specific participants can be set for individual meals
2. **Default Behavior**: If no participants are specified for a meal, the system uses default participation preferences

## Recipe Suggestion Algorithm

### Data Structure
- `recipeDietaryPreferences`: Links recipes with dietary preferences
  - `isCompatible`: Boolean indicating if the recipe works with a specific dietary preference
  - Used to filter suitable recipes based on participants' needs

### Suggestion Process
1. **Participant Preference Collection**
   - Gather dietary preferences for all participating family members
   - Consider both allergies and dietary restrictions

2. **Recipe Filtering**
   - Filter recipes based on compatibility with all participants' preferences
   - A recipe is suggested only if it's compatible with all participants' dietary needs

3. **Compatibility Check**
   ```typescript
   compatibleRecipes = recipes.filter(recipe =>
     participantPreferences.every(prefId =>
       recipe.dietaryPreferences.some(dp =>
         dp.dietaryPreferenceId === prefId && dp.isCompatible
       )
     )
   )
   ```

## API Endpoints

### Meal Participation
- `GET /api/family-members/:familyMemberId/meal-participation`
  - Retrieves default meal participation settings for a family member
- `POST /api/family-members/:familyMemberId/meal-participation`
  - Sets or updates default meal participation preferences

### Recipe Suggestions
- `GET /api/recipes/suggestions?participantIds=1,2,3`
  - Returns recipes compatible with all specified participants' dietary needs
  - If no participants specified, returns all recipes

## Data Flow
1. When viewing meal plans:
   - System fetches default participation for all family members
   - Applies these defaults unless overridden at the meal level

2. When adding recipes to a meal:
   - System considers participating members' preferences
   - Only suggests compatible recipes
   - Allows manual override of suggestions if needed

## Usage Example
```typescript
// Setting default participation
POST /api/family-members/1/meal-participation
{
  "defaultParticipation": true,
  "defaultMeals": ["breakfast", "dinner"]
}

// Getting recipe suggestions for specific participants
GET /api/recipes/suggestions?participantIds=1,2

// Adding a meal with specific participants
PUT /api/meal-plans/1
{
  "meals": [{
    "day": "Monday",
    "recipes": {
      "breakfast": {
        "recipeIds": [1, 2],
        "participants": [1, 3] // Overrides defaults
      }
    }
  }]
}
```
