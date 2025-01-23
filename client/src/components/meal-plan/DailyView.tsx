import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import type { MealType, DayType } from "@db/schema";
import { Clock, AlertCircle, Users, Plus, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface Recipe {
  id: number;
  title: string;
  description?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  image?: string;
}

interface DailyViewProps {
  planId: number | undefined;
  date: Date;
  viewMode: "daily" | "weekly";
  weekStart: Date;
  setViewMode: (mode: "daily" | "weekly") => void;
  setSelectedDate: (date: Date) => void;
  navigate: (direction: "prev" | "next") => void;
  goToToday: () => void;
  days: Array<{
    dayName: DayType;
    calendarDay: string;
    meals: {
      [key in MealType]?: {
        recipeIds: number[];
        participants: number[];
      };
    };
  }>;
  recipes: Record<number, Recipe>;
  familyMembers: Record<number, { id: number; name: string }>;
  onAddRecipe?: (day: DayType, mealType: MealType) => void;
  onRemoveRecipe?: (id: number) => void; // Added for removing recipes
}

export function DailyView({ planId, date, days, recipes, familyMembers, onAddRecipe, onRemoveRecipe }: DailyViewProps) {
  const [, navigate] = useLocation();
  const dayOfWeek = format(date, 'EEEE') as DayType;
  const dayData = days?.find(day => day.dayName === dayOfWeek);

  const handleMealClick = (mealType: MealType) => {
    if (planId) {
      navigate(`/meal/${planId}/${dayOfWeek}/${mealType}`);
    }
  };

  return (
    <Card className="w-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{format(date, 'EEEE')}</h2>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarDays className="h-4 w-4 mr-2" />
                {format(date, 'MMM d, yyyy')}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[400px]">
              <SheetHeader>
                <SheetTitle>Date & View Options</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <CalendarNavigation
                  selectedDate={date}
                  setSelectedDate={setSelectedDate}
                  viewMode={viewMode}
                  weekStart={weekStart}
                  setViewMode={setViewMode}
                  navigate={navigate}
                  goToToday={goToToday}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <div className="divide-y">
        {["breakfast", "lunch", "dinner"].map((mealType: MealType) => {
          const mealData = dayData?.meals[mealType] || { recipeIds: [], participants: [] };

          return (
            <div key={mealType} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Button
                  variant="link"
                  className="p-0 font-medium capitalize text-lg"
                  onClick={() => handleMealClick(mealType)}
                >
                  {mealType}
                </Button>
                {mealData.participants.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div className="flex -space-x-2">
                      {mealData.participants.slice(0, 3).map((id) => (
                        <Avatar key={id} className="h-6 w-6 border-2 border-background">
                          <AvatarFallback className="text-xs">
                            {familyMembers[id]?.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {mealData.participants.length > 3 && (
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                          +{mealData.participants.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {mealData.recipeIds.map((id) => {
                  const recipe = recipes[id];
                  return recipe ? (
                    <div key={id} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0">
                          {recipe.image ? (
                            <img 
                              src={recipe.image} 
                              alt={recipe.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <span className="text-muted-foreground text-[8px]">No img</span>
                            </div>
                          )}
                        </div>
                        <Button 
                          variant="link" 
                          className="text-sm p-0 h-auto" 
                          onClick={() => navigate(`/recipes/${recipe.id}`)}
                        >
                          {recipe.title}
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onRemoveRecipe?.(id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : null;
                })}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full flex items-center gap-2"
                  onClick={() => onAddRecipe?.(dayOfWeek, mealType)}
                >
                  <Plus className="h-4 w-4" />
                  Add Recipe
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}