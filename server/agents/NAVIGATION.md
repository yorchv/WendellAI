
# Calendar Navigation

## Overview
The calendar navigation system allows users to navigate between daily and weekly views of the meal planner, with the current view state persisted in the URL query parameters.

## URL Structure
```
/meal-planner?view=daily&date=2024-01-21
```

### Query Parameters
- `view`: Either "daily" or "weekly"
- `date`: ISO date string (YYYY-MM-DD)

## Navigation Hook
The `useCalendarNavigation` hook manages all navigation state and URL updates:

### State Management
- Maintains view mode (daily/weekly)
- Tracks selected date
- Syncs state with URL parameters

### Core Functions
- `navigate(direction)`: Move forward/backward by day or week
- `setViewMode(mode)`: Switch between daily and weekly views
- `setSelectedDate(date)`: Update selected date
- `goToToday()`: Reset to current date in daily view

## URL Parameter Handling
- URL updates automatically when state changes
- State initializes from URL parameters on mount
- Preserves navigation state during page refreshes

## Component Integration
- Used in DailyView and MealPlanTable components
- Handles routing between views seamlessly
- Maintains consistent state across component boundaries
