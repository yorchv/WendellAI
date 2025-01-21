
# API Request Validators

This document describes the validation schemas used for API requests in the application. These validators ensure data consistency and provide proper error messages.

## Design Principles

1. All validators are built using Zod
2. Timestamps like `createdAt` and `updatedAt` are handled by the database
3. Date fields are accepted as strings and transformed to Date objects
4. Nullable fields are explicitly marked
5. Custom refinements are used for date range validations

## Validator Categories

### Auth
- `loginSchema`: Username and password validation
- `registerSchema`: Same as login for consistency

### Recipes
- `createRecipeSchema`: Full recipe creation validation
- `updateRecipeSchema`: Partial version of create schema
- `generateRecipeSchema`: AI recipe generation prompt
- `analyzeImageSchema`: Recipe image analysis

### Meal Plans
- `createMealPlanSchema`: Weekly meal plan validation with nested day and meal structure 
- `updateMealPlanSchema`: Same as create for consistency

### Family
- `createFamilyMemberSchema`: Family member details
- `createDietaryPreferenceSchema`: Dietary preference types and details
- `createFamilyMemberDietaryPreferenceSchema`: Linking members to preferences
- `createMealParticipationSchema`: Meal participation defaults

### Shopping List
- `createShoppingListItemSchema`: Shopping list item with date range
- `updateShoppingListItemSchema`: Update schema for checking items

## Maintenance Guidelines

1. When adding new fields to database schemas, corresponding validators should be updated
2. Date transformations should always use string input and transform to Date objects
3. Enum values should be imported from database schema files
4. Keep refinements for date ranges consistent across schemas
5. Use meaningful error messages in validation rules
6. Maintain partial update schemas where appropriate

## Examples

Adding a new field to recipe validator:
```typescript
export const createRecipeSchema = z.object({
  // ... existing fields
  newField: z.string().nullable(),
});
```

Adding a new validator:
```typescript
export const newFeatureSchema = z.object({
  field: z.string().min(1, "Field is required"),
  optionalField: z.number().nullable(),
});
```
