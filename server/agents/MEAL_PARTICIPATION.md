# Meal Participation and Recipe Suggestion System

## Overview
This document describes the meal participation tracking and recipe suggestion system implemented in WendellAI. The system allows both family members and guests to be included in meal planning at different granularities (meal, day, or week) while considering their dietary preferences for recipe suggestions.

## Family Members and Guests Management

### Family Member Types
The system distinguishes between two types of participants:
1. **Regular Family Members** (`isGuest: false`)
   - Core family members who regularly participate in meals
   - Have persistent dietary preferences and meal participation settings
   - Identified by a user icon in the UI

2. **Guests** (`isGuest: true`)
   - Occasional participants in meals
   - Can have saved dietary preferences for future visits
   - Identified by a user-plus icon in the UI
   - Can be added ad-hoc during meal planning

### Data Structure
- `familyMembers` table:
  ```typescript
  {
    id: number;
    userId: number;
    name: string;
    birthDate: date;
    isGuest: boolean;
    createdAt: timestamp;
    updatedAt: timestamp;
  }
  ```

## Dietary Preferences System

### Preference Categories
Dietary preferences are categorized into three types:
1. **Allergies**: Critical food restrictions that must be strictly enforced
2. **Diet**: Lifestyle choices (e.g., vegetarian, vegan)
3. **Supplementation**: Additional nutritional requirements

### Data Structure
```typescript
// Main dietary preference definitions
dietaryPreferences: {
  id: number;
  name: string;
  type: 'ALLERGY' | 'DIET' | 'SUPPLEMENTATION';
  description: string?;
}

// Linking preferences to family members/guests
familyMemberDietaryPreferences: {
  id: number;
  familyMemberId: number;
  dietaryPreferenceId: number;
  notes: string?;
}
```

## Meal Participation Tracking

### Default Participation
Each family member (including guests) can have default meal participation preferences:
- `defaultParticipation`: Boolean flag indicating if the member generally participates in meals
- `defaultMeals`: Array of meal types they usually participate in

### Participation Override
The meal plan structure supports overriding default participation:
1. **Meal Level**: Specific participants can be set for individual meals
2. **Default Behavior**: System uses default participation preferences if no specific participants are set

## Recipe Suggestion Algorithm

### Compatibility Check
The system ensures recipes match all participants' dietary needs:
```typescript
function isRecipeCompatible(recipe, participants) {
  return participants.every(participant => 
    participant.dietaryPreferences.every(preference =>
      recipe.dietaryPreferences.some(dp =>
        dp.dietaryPreferenceId === preference.id && dp.isCompatible
      )
    )
  );
}
```

### Guest Consideration
When suggesting recipes for meals with guests:
1. Guest dietary preferences are given equal priority to family members
2. The system maintains dietary preference history for returning guests
3. New guests can have preferences set during their addition to a meal

## API Endpoints

### Family Member & Guest Management
```typescript
// Add new family member or guest
POST /api/family-members
{
  name: string;
  birthDate: Date;
  isGuest: boolean;
}

// Update dietary preferences
POST /api/family-members/:id/dietary-preferences
{
  preferences: Array<{
    id: number;
    notes?: string;
  }>;
}
```

### Meal Participation
- `GET /api/family-members/:familyMemberId/meal-participation`
  - Retrieves default meal participation settings for a family member
- `POST /api/family-members/:familyMemberId/meal-participation`
  - Sets or updates default meal participation preferences

```typescript
// Get participants for a meal
GET /api/meal-plans/:planId/meals/:mealId/participants

// Update meal participants
PUT /api/meal-plans/:planId/meals/:mealId/participants
{
  participantIds: number[];
}
```

### Recipe Suggestions
- `GET /api/recipes/suggestions?participantIds=1,2,3`
  - Returns recipes compatible with all specified participants' dietary needs
  - If no participants specified, returns all recipes


## Usage Examples

### Adding a Guest with Dietary Preferences
```typescript
// 1. Create guest profile
POST /api/family-members
{
  name: "John Doe",
  birthDate: "1990-01-01",
  isGuest: true
}

// 2. Add dietary preferences
POST /api/family-members/123/dietary-preferences
{
  preferences: [
    { id: 1, notes: "Severe peanut allergy" },
    { id: 5, notes: "Prefers vegetarian" }
  ]
}
```

### Adding Participants to a Meal
```typescript
PUT /api/meal-plans/1/meals/breakfast
{
  participants: {
    familyMembers: [1, 2],    // Regular family members
    guests: [5, 8]            // Guest participants
  }
}
```

## UI Components
The system provides clear visual distinction between family members and guests:
- Family members: User icon (solid)
- Guests: User-plus icon
- Dietary preferences: Color-coded badges with appropriate icons
- Quick access to add new guests during meal planning

## Data Flow
1. When viewing meal plans:
   - System fetches default participation for all family members
   - Applies these defaults unless overridden at the meal level

2. When adding recipes to a meal:
   - System considers participating members' preferences
   - Only suggests compatible recipes
   - Allows manual override of suggestions if needed