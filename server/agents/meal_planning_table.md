# Meal Planning Table View

## Overview
The meal planning table view provides a structured weekly view of meal plans, organizing meals by type (breakfast, lunch, dinner) in rows and days of the week in columns.

## Data Structure
```typescript
interface MealPlan {
  id: number;
  userId: number;
  weekStart: Date;
  weekEnd: Date;
  meals: Array<{
    day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
    recipes: {
      breakfast?: number[];
      lunch?: number[];
      dinner?: number[];
    };
  }>;
}
```

## Table View Features
1. **Row Organization**
   - Each meal type (breakfast, lunch, dinner) has its own dedicated row
   - Consistent vertical alignment for better readability
   - Visual separation between meal types

2. **Column Structure**
   - Days of the week are displayed as columns
   - Clear day headers with dates
   - Responsive design for different screen sizes

3. **Recipe Display Logic**
   - Shows up to 2 recipes per meal slot
   - When more than 2 recipes exist:
     - Displays first 2 recipes
     - Shows "+X more" indicator (where X is the number of additional recipes)
     - Provides navigation to detailed meal view

4. **Detailed Meal View**
   - Accessed by clicking on a meal cell with 3+ recipes
   - Shows all recipes for the selected meal
   - Displays full recipe details including:
     - Recipe names
     - Preparation times
     - Serving sizes
     - Links to full recipe pages

## Navigation
1. **Table to Detail View**
   - Click on meal cell with "+X more" indicator
   - Opens modal/page with all recipes for that meal
   - Maintains context of selected day and meal type

2. **Detail to Table View**
   - "Back to Week View" button returns to table
   - Preserves table scroll position and selected week

## Implementation Guidelines
1. Use CSS Grid for table layout
2. Implement responsive breakpoints
3. Use shadcn components for consistency
4. Maintain accessibility standards
5. Support keyboard navigation
